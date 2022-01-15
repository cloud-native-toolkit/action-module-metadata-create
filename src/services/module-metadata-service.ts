import {Octokit} from '@octokit/action'
import {LoggerApi} from '../util/logger'
import {Container} from 'typescript-ioc'

export interface ModuleServiceParams {
  octokit: Octokit
}

export interface ModuleServiceResult {
}

export class ModuleMetadataService {
  async verify(input: ModuleServiceParams): Promise<ModuleServiceResult> {
    const logger: LoggerApi = Container.get(LoggerApi)

    const logWarning = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: any
    ): void => {
      logger.warning(error.message)
    }

    return {};
  }
}
