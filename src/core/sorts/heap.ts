import type { SortGenerator, Step } from '../steps'

export const heapCode = [
  'for i in n/2-1 down to 0: siftDown(i, n)',
  'for end in n-1 down to 1',
  '  swap a[0], a[end]; a[end] is in place',
  '  siftDown(0, end)',
  'siftDown(i, size):',
  '  while child = 2i+1 < size',
  '    if child+1 < size and a[child+1] > a[child]: child++',
  '    if a[i] >= a[child]: break',
  '    swap a[i], a[child]; i = child',
]

export function* heapSort(input: readonly number[]): SortGenerator {
  const a = [...input]
  const n = a.length

  function swap(i: number, j: number) {
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }

  function* siftDown(start: number, size: number): Generator<Step, void, void> {
    let i = start
    while (2 * i + 1 < size) {
      let child = 2 * i + 1
      if (child + 1 < size) {
        yield { type: 'compare', indices: [child, child + 1], line: 7 }
        if (a[child + 1]! > a[child]!) child++
      }
      yield { type: 'compare', indices: [i, child], line: 8 }
      if (a[i]! >= a[child]!) break
      swap(i, child)
      yield { type: 'swap', indices: [i, child], line: 9 }
      i = child
    }
  }

  for (let i = (n >> 1) - 1; i >= 0; i--) yield* siftDown(i, n)
  for (let end = n - 1; end >= 1; end--) {
    swap(0, end)
    yield { type: 'swap', indices: [0, end], line: 3 }
    yield { type: 'settle', indices: [end], line: 3 }
    yield* siftDown(0, end)
  }
  if (n > 0) yield { type: 'settle', indices: [0], line: 2 }
  return a
}
