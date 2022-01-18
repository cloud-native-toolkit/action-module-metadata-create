// eslint-disable-next-line filenames/match-regex
export interface ModuleMetadataProvider {
  name: string
  source: string
}

export interface ModuleMetadataDependencyRef {
  source: string
  version: string
}

export interface ModuleMetadataDependency {
  id: string
  refs?: ModuleMetadataDependencyRef[]
  interface?: string
}

export interface ModuleMetadataModuleRef {
  id: string
  output: string
}

export interface ModuleMetadataVariable {
  name: string
  scope?: string
  moduleRef?: ModuleMetadataModuleRef
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any
  description?: string
  sensitive?: boolean
}

export interface ModuleMetadataOutput {
  name: string
  description?: string
}

export interface ModuleMetadataVersion {
  platforms: string[]
  providers: ModuleMetadataProvider[]
  dependencies: ModuleMetadataDependency[]
  variables: ModuleMetadataVariable[]
  outputs: ModuleMetadataOutput[]
  version: string
}

export interface ModuleMetadataModel {
  id: string
  name: string
  alias?: string
  cloudProvider?: string
  interfaces?: string[]
  softwareProvider?: string
  type: string
  description: string
  tags: string[]
  versions: ModuleMetadataVersion[]
}

export interface ModuleInterfaceModel {
  id: string
  name: string
  variables?: ModuleMetadataVariable[]
  outputs?: ModuleMetadataOutput[]
}
