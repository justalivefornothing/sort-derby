import { describe, expect, it } from 'vitest'
import { statsToCsv } from '../core/csv'
import { configFromUrl, shareUrl } from './share'

describe('shareable race links', () => {
  it('parses a full query and clamps the size', () => {
    expect(configFromUrl('?preset=reversed&n=999&seed=7&autostart')).toEqual({
      config: { preset: 'reversed', size: 256, seed: 7 },
      autostart: true,
    })
  })

  it('falls back to defaults for junk', () => {
    expect(configFromUrl('?preset=bogus&n=abc&seed=-3')).toEqual({
      config: { preset: 'random', size: 64, seed: 4242 },
      autostart: false,
    })
  })

  it('round-trips through shareUrl', () => {
    const config = { preset: 'few-unique' as const, size: 40, seed: 99 }
    const url = shareUrl(config, 'https://example.test/derby/?stale=1')
    expect(url).toBe('https://example.test/derby/?preset=few-unique&n=40&seed=99')
    expect(configFromUrl(new URL(url).search).config).toEqual(config)
  })
})

describe('CSV export', () => {
  it('writes a header, one row per lane and escapes commas', () => {
    const csv = statsToCsv(
      { preset: 'random', size: 8, seed: 1 },
      [
        { place: 1, algorithm: 'Quick (Lomuto)', comparisons: 20, swaps: 9, writes: 0, steps: 29 },
        { place: 2, algorithm: 'Merge, top-down', comparisons: 17, swaps: 0, writes: 24, steps: 41 },
      ],
    )
    expect(csv.split('\n')).toEqual([
      'preset,size,seed,place,algorithm,comparisons,swaps,writes,steps',
      'random,8,1,1,Quick (Lomuto),20,9,0,29',
      'random,8,1,2,"Merge, top-down",17,0,24,41',
      '',
    ])
  })
})
