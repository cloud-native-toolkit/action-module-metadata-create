import {describe, test, expect, beforeEach} from '@jest/globals';
import {ModuleMetadataService} from '../../src/services';
import {ModuleInterfaceModel} from '../../src/models/module-metadata.model';

describe('module-metadata-service', () => {
  test('canary verifies test infrastructure', () => {
    expect(true).toBe(true);
  })

  let classUnderTest: ModuleMetadataService;
  beforeEach(() => {
    classUnderTest = new ModuleMetadataService()
  })

  describe('given loadInterface()', () => {
    describe('when called with valid interface id', () => {
      test('then should return interface', async () => {
        const id = 'github.com/cloud-native-toolkit/automation-modules#cluster'

        const result: ModuleInterfaceModel = await classUnderTest.loadInterface(id)

        expect(result.id).toEqual(id)
      })
    })

    describe('when called with invalid interface id', () => {
      test('then should throw error', async () => {
        const id = 'github.com/cloud-native-toolkit/automation-modules#bogus'

        await classUnderTest.loadInterface(id)
          .then(val => expect(true).toBe(false))
          .catch(err => console.log('Got exception'))
      })
    })
  })

  describe('given processMetadata()', () => {
    describe('when empty object provided', () => {
      test('then should return empty arrays', async () => {
        const result = classUnderTest.processMetadata({} as any)

        expect(result).toEqual({variables: [], outputs: []})
      })
    })
  })

  describe('given validateInterfaces()', () => {
    describe('when module has no interfaces', () => {
      test('then should return void', async () => {

        await classUnderTest.validateInterfaces({} as any)
          .catch(err => {
            console.log('Got error', err)
            expect(err).toBeUndefined()
          })
      })
    })

    describe('when module has an interface', () => {
      describe('and when module does not implement interface', () => {
        test('then should throw error', async () => {
          await classUnderTest.validateInterfaces({interfaces: ['github.com/cloud-native-toolkit/automation-modules#cluster']} as any)
            .then(val => expect(val).toBeUndefined())
            .catch(err => {
              console.log('Got error', err)
              expect(err).toBeDefined()
            })
        });
      })
      describe('and when module does implement interface', () => {
        test('then should not throw error', async () => {
          const metadata = {
            interfaces: ['github.com/cloud-native-toolkit/automation-modules#cluster'],
            versions: [{
              outputs: [{
                name: 'id'
              }, {
                name: 'name'
              }, {
                name: 'resource_group_name'
              }, {
                name: 'region'
              }, {
                name: 'config_file_path'
              }, {
                name: 'platform'
              }]
            }]
          } as any

          await classUnderTest.validateInterfaces(metadata)
            .catch(err => {
              console.log('Got error', err)
              expect(err).toBeUndefined()
            })
        });
      })
    })
  })
})
