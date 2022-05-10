import * as core from '@actions/core'
import {join} from 'path'
import {copyFile, mkdirp, readdir} from 'fs-extra'
import {Container} from 'typescript-ioc'

import {ModuleMetadataService} from './services'
import {LoggerApi} from './util/logger'
import {ActionLogger} from './util/logger/logger.action'
import {YamlFile} from './util/yaml-file/yaml-file'

async function run(): Promise<void> {
  try {
    Container.bind(LoggerApi).to(ActionLogger)

    const logger: LoggerApi = Container.get(LoggerApi)

    const tagName: string = core.getInput('tagName')
    const distDir: string = core.getInput('distDir')
    const strict: boolean = core.getBooleanInput('strict')
    const validate: boolean = core.getBooleanInput('validate')
    const publishBranch: string = core.getInput('publishBranch')
    const metadataFile: string = core.getInput('metadataFile')
    const repoSlugInput: string = core.getInput('repoSlug')

    const repoSlug: string | undefined =
      repoSlugInput || process.env.GITHUB_REPOSITORY

    if (!repoSlug) {
      throw new Error(
        'gitSlug param and GITHUB_REPOSITORY env variable not set'
      )
    }

    const service: ModuleMetadataService = new ModuleMetadataService()

    logger.info('Creating metadata')
    const {metadata} = await service.create({
      version: tagName,
      repoSlug,
      strict,
      publishBranch,
      metadataFile
    })

    logger.info(JSON.stringify(metadata, undefined, '  '))

    if (validate) {
      logger.info('Validating metadata')
      await service.verify({
        metadata,
        strict
      })
    }

    logger.info('Creating output directory: ' + distDir)
    await mkdirp(distDir)

    logger.info('Writing yaml metadata')
    await new YamlFile(join(distDir, 'index.yaml'), metadata).write()
    logger.info('Copying README.md')
    await copyFile('README.md', join(distDir, 'README.md'))

    logger.info('Directory contents:')
    readdir(distDir, (err, files) => {
      files.forEach(file => {
        logger.info(file)
      })
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run().catch(error => core.error(error.message))
