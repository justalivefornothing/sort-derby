import { PRESETS, type Preset } from '../core/prng'

export const MIN_SIZE = 8
export const MAX_SIZE = 256

export interface RaceConfig {
  preset: Preset
  size: number
  seed: number
}

export const clampSize = (n: number): number => Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)))

/** Races are shareable: `?preset=reversed&n=128&seed=7&autostart` reproduces one exactly. */
export function configFromUrl(search: string): { config: RaceConfig; autostart: boolean } {
  const q = new URLSearchParams(search)
  const preset = q.get('preset') as Preset | null
  const n = Number(q.get('n'))
  const seed = Number(q.get('seed'))
  return {
    config: {
      preset: preset && PRESETS.includes(preset) ? preset : 'random',
      size: Number.isFinite(n) && n > 0 ? clampSize(n) : 64,
      seed: Number.isInteger(seed) && seed >= 0 ? seed : 4242,
    },
    autostart: q.has('autostart'),
  }
}

export const shareUrl = (c: RaceConfig, base: string): string => {
  const url = new URL(base)
  url.search = new URLSearchParams({ preset: c.preset, n: String(c.size), seed: String(c.seed) }).toString()
  return url.toString()
}

