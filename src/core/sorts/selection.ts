import type { SortGenerator } from '../steps'

export const selectionCode = [
  'for i in 0 .. n-2',
  '  min = i',
  '  for j in i+1 .. n-1',
  '    if a[j] < a[min]: min = j',
  '  if min != i: swap a[i], a[min]',
  '  a[i] is now in place',
  'a[n-1] is now in place',
]

export function* selectionSort(input: readonly number[]): SortGenerator {
  const a = [...input]
  const n = a.length
  for (let i = 0; i < n - 1; i++) {
    let min = i
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', indices: [j, min], line: 4 }
      if (a[j]! < a[min]!) min = j
    }
    if (min !== i) {
      const tmp = a[i]!
      a[i] = a[min]!
      a[min] = tmp
      yield { type: 'swap', indices: [i, min], line: 5 }
    }
    yield { type: 'settle', indices: [i], line: 6 }
  }
  if (n > 0) yield { type: 'settle', indices: [n - 1], line: 7 }
  return a
}
