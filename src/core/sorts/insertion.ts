import type { SortGenerator } from '../steps'

export const insertionCode = [
  'for i in 1 .. n-1',
  '  key = a[i]; j = i-1',
  '  while j >= 0 and a[j] > key',
  '    a[j+1] = a[j]; j--',
  '  a[j+1] = key',
  'all elements in place',
]

export function* insertionSort(input: readonly number[]): SortGenerator {
  const a = [...input]
  const n = a.length
  for (let i = 1; i < n; i++) {
    const key = a[i]!
    let j = i - 1
    while (j >= 0) {
      // The key conceptually sits in the hole at j+1 while we scan left.
      yield { type: 'compare', indices: [j, j + 1], line: 3 }
      if (a[j]! <= key) break
      a[j + 1] = a[j]!
      yield { type: 'write', indices: [j + 1], value: a[j + 1]!, line: 4 }
      j--
    }
    if (j + 1 !== i) {
      a[j + 1] = key
      yield { type: 'write', indices: [j + 1], value: key, line: 5 }
    }
  }
  yield { type: 'settle', indices: Array.from({ length: n }, (_, k) => k), line: 6 }
  return a
}
