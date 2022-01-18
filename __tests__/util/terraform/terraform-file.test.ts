import {describe, expect, test} from '@jest/globals'
import {join} from 'path'
import {TerraformFile} from '../../../src/util/terraform/terraform-file'

describe('terraform-file', () => {
  test('canary verifies test infrastructure', () => {
    expect(true).toBe(true)
  })

  describe('given load()', () => {
    describe('when passed variables.tf', () => {
      test('should load file', async () => {
        const result = await TerraformFile.load(join(__dirname, 'variables.tf'))

        expect(result.variables[0]).toEqual({
          name: 'login_user',
          type: 'string',
          description: 'Username for login',
          default: ''
        })
        expect(result.variables[1]).toEqual({
          name: 'string_var',
          type: 'string',
          description: 'String variable',
          default: 'test',
          sensitive: true
        })
        expect(result.variables[2]).toEqual({
          name: 'flag',
          type: 'bool',
          description: 'Flag value',
          default: false
        })
        expect(result.variables[3]).toEqual({
          name: 'list_string',
          type: 'list(string)',
          description: 'List of strings value',
          default: ['test1', 'test2']
        })
        expect(result.variables[4]).toEqual({
          name: 'no_default',
          type: 'string'
        })
        expect(result.variables[5]).toEqual({
          name: 'multi_line_type',
          type: `object({
    value = string
  })`
        })
        expect(result.variables[6]).toEqual({
          name: 'multi_line_type2',
          type: `object({
    value = object({
      nested_value = string
    })
  })`
        })
        expect(result.variables[7]).toEqual({
          name: 'multi_line_type3',
          type: `list(object({
    value = object({
      nested_value = string
    })
  }))`,
          default: `[{
    value = {
      nested_value = "test"
    }
  }]`
        })
      })
    })
    describe('when passed outputs.tf', () => {
      test('should load file', async () => {
        const result = await TerraformFile.load(join(__dirname, 'outputs.tf'))

        console.log(`Result: ${JSON.stringify(result)}`)
        expect(result.outputs.length).toBeGreaterThan(0)
        expect(result.outputs[0]).toEqual({
          name: 'id',
          description: 'ID of the cluster.'
        })
      })
    })
  })
})
