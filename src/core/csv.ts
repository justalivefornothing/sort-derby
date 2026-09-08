import type { Tally } from './steps'

export interface StatsRow extends Tally {
  place: number | null
  algorithm: string
}

export interface RunMeta {
  preset: string
  size: number
  seed: number
}

const cell = (v: string | number | null): string => {
  if (v === null) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Final stats for one run as CSV. Rows are emitted in finish order. */
export function statsToCsv(meta: RunMeta, rows: readonly StatsRow[]): string {
  const header = ['preset', 'size', 'seed', 'place', 'algorithm', 'comparisons', 'swaps', 'writes', 'steps']
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(
      [meta.preset, meta.size, meta.seed, r.place, r.algorithm, r.comparisons, r.swaps, r.writes, r.steps]
        .map(cell)
        .join(','),
    )
  }
  return lines.join('\n') + '\n'
}
