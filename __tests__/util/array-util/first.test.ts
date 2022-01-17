import {describe, test, expect} from '@jest/globals'
// @ts-ignore
import Optional from 'js-optional'
import {first} from '../../../src/util/array-util'


describe('first', () => {
  test('canary verifies test infrastructure', () => {
    expect(true).toBe(true);
  })

  describe('when called with undefined', () => {
    test('then should return empty Optional', async () => {
      const result: Optional = first(undefined)

      expect(result.isPresent()).toBe(false)
    })
  })

  describe('when called with empty array', () => {
    test('then should return empty Optional', async () => {
      const result: Optional = first([])

      expect(result.isPresent()).toBe(false)
    })
  })

  describe('when called with array', () => {
    test('then should return Optional with first element', async () => {
      const result: Optional = first(["a", "b", "c", "d"])

      expect(result.isPresent()).toBe(true)
      expect(result.get()).toBe("a")
    });
  });
})
