import type { SortGenerator } from '../steps'

export const bubbleCode = [
  'for i in 0 .. n-2',
  '  swapped = false',
  '  for j in 0 .. n-i-2',
  '    if a[j] > a[j+1]',
  '      swap a[j], a[j+1]; swapped = true',
  '  a[n-i-1] is now in place',
  '  if not swapped: break',
]

export function* bubbleSort(input: readonly number[]): SortGenerator {
  const a = [...input]
  const n = a.length
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'compare', indices: [j, j + 1], line: 4 }
      if (a[j]! > a[j + 1]!) {
        const tmp = a[j]!
        a[j] = a[j + 1]!
        a[j + 1] = tmp
        swapped = true
        yield { type: 'swap', indices: [j, j + 1], line: 5 }
      }
    }
    yield { type: 'settle', indices: [n - i - 1], line: 6 }
    if (!swapped) {
      yield { type: 'settle', indices: Array.from({ length: n - i - 1 }, (_, k) => k), line: 7 }
      break
    }
  }
  yield { type: 'settle', indices: [0], line: 7 }
  return a
}
