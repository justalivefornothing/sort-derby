import type { Algorithm } from '../core/algorithms'
import { applyStep, emptyTally, isWork, tallyStep, type SortGenerator, type Step, type Tally } from '../core/steps'

export interface Lane {
  alg: Algorithm
  /** Mirror of the algorithm's array, rebuilt purely from swap/write events. */
  arr: number[]
  tally: Tally
  settled: Uint8Array
  /** Indices touched by the most recent step, for highlighting. */
  compared: number[]
  moved: number[]
  /** 1-based pseudocode line of the most recent step. */
  line: number
  done: boolean
  /** 1 = first across the line. */
  place: number | null
  gen: SortGenerator
}

function makeLane(alg: Algorithm, input: readonly number[]): Lane {
  return {
    alg,
    arr: [...input],
    tally: emptyTally(),
    settled: new Uint8Array(input.length),
    compared: [],
    moved: [],
    line: 0,
    done: false,
    place: null,
    gen: alg.sort(input),
  }
}

/** Pull steps until one unit of work has been consumed (or the generator finishes). */
function advanceLane(lane: Lane, race: Race): void {
  lane.compared = []
  lane.moved = []
  for (;;) {
    const next = lane.gen.next()
    if (next.done) {
      lane.done = true
      lane.place = ++race.finishedCount
      lane.settled.fill(1)
      race.finishOrder.push(lane)
      return
    }
    const step: Step = next.value
    applyStep(lane.arr, step)
    tallyStep(lane.tally, step)
    lane.line = step.line
    if (step.type === 'compare') lane.compared = step.indices
    else if (step.type === 'settle') for (const i of step.indices) lane.settled[i] = 1
    else lane.moved = step.indices
    if (isWork(step)) return
  }
}

/**
 * Holds one lane per algorithm and advances them in lockstep: every call to
 * `tick(k)` gives each unfinished lane exactly k units of work, round-robin,
 * so the finish order is decided purely by how many steps each algorithm needs.
 */
export class Race {
  readonly lanes: Lane[]
  readonly finishOrder: Lane[] = []
  finishedCount = 0
  /** Fractional work carried between frames so slow speeds still progress. */
  private budget = 0

  constructor(algorithms: readonly Algorithm[], input: readonly number[]) {
    this.lanes = algorithms.map((alg) => makeLane(alg, input))
  }

  get finished(): boolean {
    return this.finishedCount === this.lanes.length
  }

  /** Advance every unfinished lane by `units` steps. Returns true if anything moved. */
  tick(units: number): boolean {
    let moved = false
    for (let u = 0; u < units && !this.finished; u++) {
      for (const lane of this.lanes) {
        if (!lane.done) {
          advanceLane(lane, this)
          moved = true
        }
      }
    }
    return moved
  }

  /** Time-based advance: `stepsPerSecond * dt` units, carrying the remainder. */
  advanceBy(stepsPerSecond: number, dtSeconds: number): boolean {
    this.budget += stepsPerSecond * dtSeconds
    const whole = Math.floor(this.budget)
    this.budget -= whole
    return this.tick(whole)
  }
}
