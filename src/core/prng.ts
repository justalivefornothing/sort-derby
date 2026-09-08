/** mulberry32: tiny, fast, good enough for shuffling bars. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const PRESETS = ['random', 'nearly-sorted', 'reversed', 'few-unique'] as const
export type Preset = (typeof PRESETS)[number]

export const PRESET_LABELS: Record<Preset, string> = {
  random: 'Random',
  'nearly-sorted': 'Nearly sorted',
  reversed: 'Reversed',
  'few-unique': 'Few unique',
}

const staircase = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1)

function shuffle(arr: number[], rand: () => number): number[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

/** Build the input every lane will sort. Same preset + size + seed => identical array. */
export function makeInput(preset: Preset, size: number, seed: number): number[] {
  const rand = mulberry32(seed)
  switch (preset) {
    case 'random':
      return shuffle(staircase(size), rand)
    case 'reversed':
      return staircase(size).reverse()
    case 'nearly-sorted': {
      // Displace ~8% of the elements by a short hop so a few bars stick out.
      const arr = staircase(size)
      const hops = Math.max(1, Math.round(size * 0.08))
      for (let h = 0; h < hops; h++) {
        const i = Math.floor(rand() * size)
        const j = Math.min(size - 1, Math.max(0, i + Math.floor(rand() * 7) - 3))
        const tmp = arr[i]!
        arr[i] = arr[j]!
        arr[j] = tmp
      }
      return arr
    }
    case 'few-unique': {
      const distinct = Math.min(size, 5)
      const stepH = size / distinct
      return Array.from({ length: size }, () => Math.round((Math.floor(rand() * distinct) + 1) * stepH))
    }
  }
}

/** Convenience used by tests: a seeded random permutation of 1..n. */
export const seededArray = (n: number, seed: number): number[] => makeInput('random', n, seed)
