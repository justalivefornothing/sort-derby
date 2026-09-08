import type { SortGenerator, Step } from '../steps'

export const quickCode = [
  'quickSort(lo, hi):',
  '  if lo >= hi: a[lo] is in place; return',
  '  pivot = a[hi]; i = lo',
  '  for j in lo .. hi-1',
  '    if a[j] < pivot',
  '      swap a[i], a[j]; i++',
  '  swap a[i], a[hi]; a[i] is now in place',
  '  quickSort(lo, i-1); quickSort(i+1, hi)',
]

/** Classic Lomuto partition with the last element as pivot. */
export function* quickSort(input: readonly number[]): SortGenerator {
  const a = [...input]

  function swap(i: number, j: number) {
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }

  function* sort(lo: number, hi: number): Generator<Step, void, void> {
    if (lo >= hi) {
      if (lo === hi) yield { type: 'settle', indices: [lo], line: 2 }
      return
    }
    const pivot = a[hi]!
    let i = lo
    for (let j = lo; j < hi; j++) {
      yield { type: 'compare', indices: [j, hi], line: 5 }
      if (a[j]! < pivot) {
        if (i !== j) {
          swap(i, j)
          yield { type: 'swap', indices: [i, j], line: 6 }
        }
        i++
      }
    }
    if (i !== hi) {
      swap(i, hi)
      yield { type: 'swap', indices: [i, hi], line: 7 }
    }
    yield { type: 'settle', indices: [i], line: 7 }
    yield* sort(lo, i - 1)
    yield* sort(i + 1, hi)
  }

  yield* sort(0, a.length - 1)
  return a
}
