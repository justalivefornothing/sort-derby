import type { SortFn } from './steps'
import { bubbleCode, bubbleSort } from './sorts/bubble'
import { insertionCode, insertionSort } from './sorts/insertion'
import { selectionCode, selectionSort } from './sorts/selection'
import { mergeCode, mergeSort } from './sorts/merge'
import { quickCode, quickSort } from './sorts/quick'
import { heapCode, heapSort } from './sorts/heap'

export type AlgorithmId = 'bubble' | 'insertion' | 'selection' | 'merge' | 'quick' | 'heap'

export interface Algorithm {
  id: AlgorithmId
  name: string
  /** Fits a narrow lane label when `name` would truncate. */
  short?: string
  complexity: string
  /** Tailwind theme colour token, also resolved to a CSS colour for canvas drawing. */
  color: string
  sort: SortFn
  code: readonly string[]
}

export const ALGORITHMS: readonly Algorithm[] = [
  { id: 'bubble', name: 'Bubble', complexity: 'O(n²)', color: '#c6ff3d', sort: bubbleSort, code: bubbleCode },
  { id: 'insertion', name: 'Insertion', complexity: 'O(n²)', color: '#34e5ff', sort: insertionSort, code: insertionCode },
  { id: 'selection', name: 'Selection', complexity: 'O(n²)', color: '#ff3dd1', sort: selectionSort, code: selectionCode },
  { id: 'merge', name: 'Merge', complexity: 'O(n log n)', color: '#ffb930', sort: mergeSort, code: mergeCode },
  { id: 'quick', name: 'Quick (Lomuto)', short: 'Quick', complexity: 'O(n log n)*', color: '#a78bfa', sort: quickSort, code: quickCode },
  { id: 'heap', name: 'Heap', complexity: 'O(n log n)', color: '#ff6b57', sort: heapSort, code: heapCode },
]
