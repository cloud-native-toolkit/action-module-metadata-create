import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/action'
import {Container} from 'typescript-ioc'
import {ModuleMetadataService} from './services'
import {LoggerApi} from './util/logger'
import {ActionLogger} from './util/logger/logger.action'

async function run(): Promise<void> {
  try {
    Container.bind(LoggerApi).to(ActionLogger)

    const token: string = core.getInput('token')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const octokit: Octokit = github.getOctokit(token) as any

    const service: ModuleMetadataService = new ModuleMetadataService()
    const result = await service.verify({
      octokit,
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run().catch(error => core.error(error.message))
