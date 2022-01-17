import {describe, test, expect} from '@jest/globals';
import {leftDifference, rightDifference} from '../../../src/util/array-util';

describe('difference', () => {
  test('canary verifies test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('given rightDifference', () => {
    describe('when list includes all values', () => {
      test('then return empty list', async () => {
        const result = rightDifference(["a", "b", "c"], ["a", "b", "c"])

        expect(result).toEqual([])
      })
    })

    describe('when left list includes extra values', () => {
      test('then return empty list', async () => {
        const result = rightDifference(["a", "b", "c", "d"], ["a", "b", "c"])

        expect(result).toEqual([])
      })
    })

    describe('when right list includes extra values', () => {
      test('then return extra values', async() => {
        const result = rightDifference(["a", "b", "c"], ["a", "b", "c", "d"])

        expect(result).toEqual(["d"])
      })
    })
  })

  describe('given leftDifference', () => {
    describe('when list includes all values', () => {
      test('then return empty list', async () => {
        const result = leftDifference(["a", "b", "c"], ["a", "b", "c"])

        expect(result).toEqual([])
      })
    })

    describe('when left list includes extra values', () => {
      test('then return extra values', async () => {
        const result = leftDifference(["a", "b", "c", "d"], ["a", "b", "c"])

        expect(result).toEqual(["d"])
      })
    })

    describe('when right list includes extra values', () => {
      test('then return empty list', async() => {
        const result = leftDifference(["a", "b", "c"], ["a", "b", "c", "d"])

        expect(result).toEqual([])
      })
    })
  })
})
