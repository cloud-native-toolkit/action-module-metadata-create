import {Container} from 'typescript-ioc'
import YAML from 'js-yaml'
import {get, Response} from 'superagent'
import ZSchema from 'z-schema'

import {LoggerApi} from '../util/logger'
import {
  ModuleInterfaceModel,
  ModuleMetadataModel,
  ModuleMetadataOutput,
  ModuleMetadataVariable,
  ModuleMetadataVersion
} from '../models/module-metadata.model'
import {YamlFile} from '../util/yaml-file/yaml-file'
import {TerraformFile} from '../util/terraform/terraform-file'
import {rightDifference, first} from '../util/array-util'
import {InterfaceError, InterfaceErrors} from './errors'

export interface ModuleServiceCreateParams {
  repoSlug: string
  version: string
  metadataFile?: string
  strict?: boolean
  publishBranch?: string
}

export interface ModuleServiceVerifyParams {
  metadata: ModuleMetadataModel
  strict?: boolean
}

export interface ModuleServiceCreateResult {
  metadata: ModuleMetadataModel
}

export class ModuleMetadataService {
  private logger: LoggerApi

  constructor() {
    this.logger = Container.get(LoggerApi)
  }

  async create({
    version = '0.0.0',
    repoSlug,
    strict,
    metadataFile = 'module.yaml',
    publishBranch = 'gh-pages'
  }: ModuleServiceCreateParams): Promise<ModuleServiceCreateResult> {
    const metadata: ModuleMetadataModel = await this.buildModuleMetadata({
      version,
      repoSlug,
      strict,
      metadataFile
    })

    const mergedMetadata: ModuleMetadataModel = await this.mergeModuleMetadata({
      metadata,
      publishBranch,
      repoSlug
    })

    return {
      metadata: mergedMetadata
    }
  }

  async buildModuleMetadata({
    version = '0.0.0',
    repoSlug,
    strict,
    metadataFile = 'module.yaml'
  }: ModuleServiceCreateParams): Promise<ModuleMetadataModel> {
    this.logger.info(`Loading metadata file: ${metadataFile}`)

    const metadata: ModuleMetadataModel = (await YamlFile.load(metadataFile))
      .contents

    this.logger.info(`Loaded metadata: ${JSON.stringify(metadata)}`)

    metadata.id = `github.com/${repoSlug}`

    if (/v?0[.]0[.]0/.test(version)) {
      this.logger.info('Found version 0.0.0. Creating empty metadata.')
      metadata.versions = []

      return metadata
    }

    const metadataVersion: ModuleMetadataVersion = metadata.versions[0]

    metadataVersion.version = version

    metadataVersion.variables = await this.parseModuleVariables(
      metadataVersion.variables,
      strict
    )
    metadataVersion.outputs = await this.parseModuleOutputs(
      metadataVersion.outputs,
      strict
    )

    return metadata
  }

  async parseModuleVariables(
    metadataVariables: ModuleMetadataVariable[],
    strict = false
  ): Promise<ModuleMetadataVariable[]> {
    const {variables} = await TerraformFile.load('variables.tf')

    const variableNames = variables.map(v => v.name)

    const result: string[] = metadataVariables
      .map(m => m.name)
      .filter(m => !variableNames.includes(m))
    if (strict && result.length > 0) {
      throw new Error(
        `Variables in metadata that don't exist in module: ${JSON.stringify(
          result
        )}`
      )
    } else if (result.length > 0) {
      this.logger.warning(
        `Variables in metadata that don't exist in module: ${JSON.stringify(
          result
        )}`
      )
    }

    return variables.map(t => {
      const metadataVariable: ModuleMetadataVariable | undefined = first(
        metadataVariables.filter(m => m.name === t.name)
      )

      if (metadataVariable) {
        return Object.assign({}, t, metadataVariable)
      }

      return t
    })
  }

  async parseModuleOutputs(
    metadataOutputs: ModuleMetadataOutput[] = [],
    strict = false
  ): Promise<ModuleMetadataOutput[]> {
    const {outputs} = await TerraformFile.load('outputs.tf')

    const outputNames = outputs.map(o => o.name)

    const result: string[] = metadataOutputs
      .map(m => m.name)
      .filter(m => !outputNames.includes(m))
    if (strict && result.length > 0) {
      throw new Error(
        `Outputs in metadata that don't exist in module: ${JSON.stringify(
          result
        )}`
      )
    } else if (result.length > 0) {
      this.logger.warning(
        `Outputs in metadata that don't exist in module: ${JSON.stringify(
          result
        )}`
      )
    }

    return outputs.map(t => {
      const metadataOutput: ModuleMetadataOutput | undefined = first(
        metadataOutputs.filter(m => m.name === t.name)
      )

      if (metadataOutput) {
        return Object.assign({}, t, metadataOutput)
      }

      return t
    })
  }

  async mergeModuleMetadata({
    metadata,
    publishBranch,
    repoSlug
  }: {
    metadata: ModuleMetadataModel
    publishBranch: string
    repoSlug: string
  }): Promise<ModuleMetadataModel> {
    const existingMetadata: ModuleMetadataModel | undefined =
      await this.loadMetadata({publishBranch, repoSlug})

    if (!existingMetadata) {
      return metadata
    }

    const versions = metadata.versions.slice()
    versions.push(...existingMetadata.versions)

    return Object.assign({}, existingMetadata, metadata, {
      versions
    })
  }

  async loadMetadata({
    publishBranch,
    repoSlug
  }: {
    publishBranch: string
    repoSlug: string
  }): Promise<ModuleMetadataModel | undefined> {
    const url = `https://raw.githubusercontent.com/${repoSlug}/${publishBranch}/index.yaml`
    try {
      const response: Response = await get(url)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return YAML.load(response.text) as any
    } catch (err) {
      this.logger.info(`No existing catalog found: ${url}`)
    }

    return
  }

  async verify({metadata}: ModuleServiceVerifyParams): Promise<{}> {
    const schema = await this.loadSchema()

    await this.validateSchema(metadata, schema)

    await this.validateInterfaces(metadata)

    return {}
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadSchema(): Promise<any> {
    const url = 'https://modules.cloudnativetoolkit.dev/schemas/module.json'

    const response: Response = await get(url)

    const result: string = response.text

    return JSON.parse(result)
  }

  async validateSchema(
    metadata: ModuleMetadataModel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const validator: ZSchema = new ZSchema({})

      validator.validate(metadata, schema, (err: Error, valid: boolean) => {
        if (!valid) {
          reject(err)
          return
        }

        resolve()
      })
    })
  }

  async validateInterfaces(metadata: ModuleMetadataModel): Promise<void> {
    const interfaces: ModuleInterfaceModel[] = await Promise.all(
      (metadata.interfaces || []).map(async name => {
        return this.loadInterface(name)
      })
    )

    const errors: InterfaceError[] = interfaces
      .map(testInterface(this.processMetadata(metadata)))
      .filter(v => !!v) as InterfaceError[]

    if (errors.length > 0) {
      throw new InterfaceErrors(errors)
    }
  }

  processMetadata(metadata: ModuleMetadataModel): {
    variables: string[]
    outputs: string[]
  } {
    const variables: string[] = first(metadata.versions)
      .map((v: ModuleMetadataVersion) => v.variables)
      .map((v: ModuleMetadataVariable[]) => v.map(x => x.name))
      .orElse([])
    const outputs: string[] = first(metadata.versions)
      .map((v: ModuleMetadataVersion) => v.outputs)
      .map((v: ModuleMetadataOutput[]) => v.map(x => x.name))
      .orElse([])

    return {variables, outputs}
  }

  async loadInterface(id: string): Promise<ModuleInterfaceModel> {
    const shortName: string = id.replace(/.*#(.*)/g, '$1')

    const url = `https://modules.cloudnativetoolkit.dev/interfaces/${shortName}.yaml`
    return get(url)
      .then((response: Response) => response.text)
      .then(text => YAML.load(text) as ModuleInterfaceModel)
  }
}

const testInterface = (module: {variables: string[]; outputs: string[]}) => {
  return (val: ModuleInterfaceModel): InterfaceError | undefined => {
    const missingVariables: string[] = rightDifference(
      module.variables,
      (val.variables || []).map(v => v.name)
    )
    const missingOutputs: string[] = rightDifference(
      module.outputs,
      (val.outputs || []).map(v => v.name)
    )

    if (missingVariables.length > 0 || missingOutputs.length > 0) {
      return new InterfaceError({id: val.id, missingVariables, missingOutputs})
    }

    return
  }
}
