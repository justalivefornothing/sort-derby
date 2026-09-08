import { describe, expect, it } from 'vitest'
import { ALGORITHMS } from './algorithms'
import { makeInput, seededArray } from './prng'
import { applyStep, runToEnd } from './steps'
import { bubbleSort } from './sorts/bubble'
import { insertionSort } from './sorts/insertion'
import { mergeSort } from './sorts/merge'
import { heapSort } from './sorts/heap'

const ascending = (xs: readonly number[]) => [...xs].sort((a, b) => a - b)

describe('exact operation counts', () => {
  it('bubble sort on [5,3,1,4,2] makes 10 comparisons', () => {
    expect(runToEnd(bubbleSort([5, 3, 1, 4, 2]))).toMatchObject({ sorted: [1, 2, 3, 4, 5], comparisons: 10 })
  })

  it('merge sort on a reversed 8-array makes 12 comparisons', () => {
    expect(runToEnd(mergeSort([8, 7, 6, 5, 4, 3, 2, 1])).comparisons).toBe(12)
  })

  it('insertion sort on sorted input is linear with zero swaps', () => {
    expect(runToEnd(insertionSort([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))).toMatchObject({ comparisons: 9, swaps: 0 })
  })

  it('heap sort handles duplicates', () => {
    expect(runToEnd(heapSort([2, 2, 2, 1, 1])).sorted).toEqual([1, 1, 2, 2, 2])
  })
})

describe('every algorithm sorts the same seeded input', () => {
  const input = seededArray(200, 42)
  for (const alg of ALGORITHMS) {
    it(`${alg.name} sorts seededArray(200, 42)`, () => {
      expect(runToEnd(alg.sort(input)).sorted).toEqual(ascending(input))
    })
  }

  it('does not mutate its input', () => {
    const snapshot = [...input]
    for (const alg of ALGORITHMS) runToEnd(alg.sort(input))
    expect(input).toEqual(snapshot)
  })
})

describe('the event stream is a complete description of the sort', () => {
  for (const alg of ALGORITHMS) {
    it(`${alg.name}: replaying swap/write events reproduces the result and settles every index`, () => {
      const input = makeInput('few-unique', 64, 7)
      const mirror = [...input]
      const settled = new Set<number>()
      const gen = alg.sort(input)
      let next = gen.next()
      while (!next.done) {
        applyStep(mirror, next.value)
        if (next.value.type === 'settle') next.value.indices.forEach((i) => settled.add(i))
        for (const i of next.value.indices) expect(i).toBeGreaterThanOrEqual(0)
        for (const i of next.value.indices) expect(i).toBeLessThan(input.length)
        next = gen.next()
      }
      expect(mirror).toEqual(next.value)
      expect(mirror).toEqual(ascending(input))
      expect(settled.size).toBe(input.length)
    })
  }

  it('steps equals comparisons + swaps + writes', () => {
    const r = runToEnd(mergeSort(seededArray(50, 1)))
    expect(r.steps).toBe(r.comparisons + r.swaps + r.writes)
  })

  it('handles empty and single-element arrays', () => {
    for (const alg of ALGORITHMS) {
      expect(runToEnd(alg.sort([])).sorted).toEqual([])
      expect(runToEnd(alg.sort([9]))).toMatchObject({ sorted: [9], comparisons: 0 })
    }
  })
})

describe('seeded inputs', () => {
  it('are deterministic for the same seed and differ across seeds', () => {
    expect(seededArray(32, 5)).toEqual(seededArray(32, 5))
    expect(seededArray(32, 5)).not.toEqual(seededArray(32, 6))
  })

  it('presets produce permutations or bounded values of the right size', () => {
    expect(makeInput('reversed', 6, 0)).toEqual([6, 5, 4, 3, 2, 1])
    expect(ascending(makeInput('nearly-sorted', 40, 3))).toEqual(ascending(seededArray(40, 3)))
    const few = makeInput('few-unique', 100, 9)
    expect(new Set(few).size).toBeLessThanOrEqual(5)
    expect(few.every((v) => v >= 1 && v <= 100)).toBe(true)
  })
})
