/**
 * Step events are the only thing an algorithm emits. The algorithm bodies never
 * count anything; every statistic (and every pixel) is derived from this stream.
 *
 * `line` is a 1-based index into the algorithm's pseudocode, used by solo mode.
 */
export type Step =
  | { type: 'compare'; indices: [number, number]; line: number }
  | { type: 'swap'; indices: [number, number]; line: number }
  | { type: 'write'; indices: [number]; value: number; line: number }
  | { type: 'settle'; indices: number[]; line: number }

/** A sort takes a read-only input, works on a private copy and returns it sorted. */
export type SortGenerator = Generator<Step, number[], void>
export type SortFn = (input: readonly number[]) => SortGenerator

export interface Tally {
  comparisons: number
  swaps: number
  writes: number
  /** Work steps: compare + swap + write. `settle` is bookkeeping and costs nothing. */
  steps: number
}

export const emptyTally = (): Tally => ({ comparisons: 0, swaps: 0, writes: 0, steps: 0 })

/** True for steps that represent real work and therefore consume a lockstep budget. */
export const isWork = (step: Step): boolean => step.type !== 'settle'

/** Fold one step into a tally (mutates and returns it). */
export function tallyStep(t: Tally, step: Step): Tally {
  switch (step.type) {
    case 'compare':
      t.comparisons++
      t.steps++
      break
    case 'swap':
      t.swaps++
      t.steps++
      break
    case 'write':
      t.writes++
      t.steps++
      break
    case 'settle':
      break
  }
  return t
}

/**
 * Replay a step's mutation onto a mirror array. The UI never sees the
 * algorithm's private copy - it reconstructs the array purely from events,
 * which is also what proves the event stream is complete.
 */
export function applyStep(arr: number[], step: Step): void {
  if (step.type === 'swap') {
    const [i, j] = step.indices
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  } else if (step.type === 'write') {
    arr[step.indices[0]] = step.value
  }
}

export interface RunResult extends Tally {
  sorted: number[]
}

/** Drain a generator, returning the sorted array plus the tallied statistics. */
export function runToEnd(gen: SortGenerator): RunResult {
  const tally = emptyTally()
  let next = gen.next()
  while (!next.done) {
    tallyStep(tally, next.value)
    next = gen.next()
  }
  return { sorted: next.value, ...tally }
}
