import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/action'
import {join} from 'path'
import {copyFile} from 'fs-extra';

import {Container} from 'typescript-ioc'
import {ModuleMetadataService} from './services'
import {LoggerApi} from './util/logger'
import {ActionLogger} from './util/logger/logger.action'
import {YamlFile} from './util/yaml-file/yaml-file';

async function run(): Promise<void> {
  try {
    Container.bind(LoggerApi).to(ActionLogger)

    const token: string = core.getInput('token')
    const tagName: string = core.getInput('tagName')
    const distDir: string = core.getInput('distDir')
    const strict: boolean = core.getBooleanInput('strict')
    const validate: boolean = core.getBooleanInput('validate')
    const publishBranch: string = core.getInput('publishBranch')
    const metadataFile: string = core.getInput('metadataFile')
    const repoSlugInput: string = core.getInput('repoSlug')

    if (!process.env.GITHUB_REPOSITORY) {
      throw new Error(
        'gitSlug param and GITHUB_REPOSITORY env variable not set'
      )
    }

    const repoSlug: string = repoSlugInput || process.env.GITHUB_REPOSITORY

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const octokit: Octokit = github.getOctokit(token) as any

    const service: ModuleMetadataService = new ModuleMetadataService()
    const {metadata} = await service.create({
      version: tagName,
      repoSlug,
      strict,
      publishBranch,
      metadataFile
    })

    if (validate) {
      await service.verify({
        metadata,
        strict
      })
    }

    await (new YamlFile(join(distDir, 'index.yaml'), metadata)).write()
    await copyFile('README.md', join(distDir, 'README.md'))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run().catch(error => core.error(error.message))
