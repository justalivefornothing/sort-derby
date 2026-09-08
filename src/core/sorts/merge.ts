import type { SortGenerator, Step } from '../steps'

export const mergeCode = [
  'mergeSort(lo, hi):',
  '  if hi <= lo: return',
  '  mid = (lo + hi) / 2',
  '  mergeSort(lo, mid); mergeSort(mid+1, hi)',
  '  left = a[lo..mid]; right = a[mid+1..hi]',
  '  while left and right both non-empty',
  '    if left[0] <= right[0]: a[k++] = left.shift()',
  '    else: a[k++] = right.shift()',
  '  copy whatever remains',
]

export function* mergeSort(input: readonly number[]): SortGenerator {
  const a = [...input]
  const n = a.length

  function* merge(lo: number, mid: number, hi: number): Generator<Step, void, void> {
    const left = a.slice(lo, mid + 1)
    const right = a.slice(mid + 1, hi + 1)
    const top = lo === 0 && hi === n - 1 // the final merge places every element for good
    let li = 0
    let ri = 0
    let k = lo
    while (li < left.length && ri < right.length) {
      yield { type: 'compare', indices: [lo + li, mid + 1 + ri], line: 7 }
      if (left[li]! <= right[ri]!) {
        a[k] = left[li++]!
        yield { type: 'write', indices: [k], value: a[k]!, line: 7 }
      } else {
        a[k] = right[ri++]!
        yield { type: 'write', indices: [k], value: a[k]!, line: 8 }
      }
      if (top) yield { type: 'settle', indices: [k], line: 8 }
      k++
    }
    while (li < left.length) {
      a[k] = left[li++]!
      yield { type: 'write', indices: [k], value: a[k]!, line: 9 }
      if (top) yield { type: 'settle', indices: [k], line: 9 }
      k++
    }
    while (ri < right.length) {
      a[k] = right[ri++]!
      yield { type: 'write', indices: [k], value: a[k]!, line: 9 }
      if (top) yield { type: 'settle', indices: [k], line: 9 }
      k++
    }
  }

  function* sort(lo: number, hi: number): Generator<Step, void, void> {
    if (hi <= lo) return
    const mid = (lo + hi) >> 1
    yield* sort(lo, mid)
    yield* sort(mid + 1, hi)
    yield* merge(lo, mid, hi)
  }

  yield* sort(0, n - 1)
  if (n === 1) yield { type: 'settle', indices: [0], line: 2 }
  return a
}
