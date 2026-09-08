import { describe, expect, it } from 'vitest'
import { ALGORITHMS } from '../core/algorithms'
import { seededArray } from '../core/prng'
import { runToEnd } from '../core/steps'
import { Race } from './engine'

describe('Race', () => {
  const input = seededArray(48, 2024)

  it('advances every unfinished lane by exactly k work steps', () => {
    const race = new Race(ALGORITHMS, input)
    race.tick(25)
    for (const lane of race.lanes) expect(lane.tally.steps).toBe(25)
    expect(race.finishedCount).toBe(0)
  })

  it('finishes in ascending order of total steps and matches runToEnd', () => {
    const race = new Race(ALGORITHMS, input)
    while (!race.finished) race.tick(64)
    const expected = ALGORITHMS.map((a) => runToEnd(a.sort(input)))
    race.lanes.forEach((lane, i) => {
      expect(lane.arr).toEqual(expected[i]!.sorted)
      expect(lane.tally).toEqual({
        comparisons: expected[i]!.comparisons,
        swaps: expected[i]!.swaps,
        writes: expected[i]!.writes,
        steps: expected[i]!.steps,
      })
      expect(Array.from(lane.settled).every((s) => s === 1)).toBe(true)
    })
    const steps = race.finishOrder.map((l) => l.tally.steps)
    expect(steps).toEqual([...steps].sort((a, b) => a - b))
    expect(race.finishOrder.map((l) => l.place)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('carries fractional budget across frames', () => {
    const race = new Race(ALGORITHMS, input)
    expect(race.advanceBy(10, 0.05)).toBe(false) // 0.5 units: nothing yet
    expect(race.advanceBy(10, 0.05)).toBe(true) // now 1.0
    expect(race.lanes[0]!.tally.steps).toBe(1)
  })
})
