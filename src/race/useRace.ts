import { useCallback, useEffect, useRef, useState } from 'react'
import { ALGORITHMS } from '../core/algorithms'
import { makeInput, type Preset } from '../core/prng'
import { Race } from './engine'

export const MIN_SIZE = 8
export const MAX_SIZE = 256

export interface RaceConfig {
  preset: Preset
  size: number
  seed: number
}

/** Slider 0..100 -> 4 .. 16384 work steps per second (log scale). */
export const stepsPerSecond = (speed: number): number => 2 ** (2 + (12 * speed) / 100)

const newSeed = () => Math.floor(Math.random() * 1_000_000)
const buildRace = (c: RaceConfig) => new Race(ALGORITHMS, makeInput(c.preset, c.size, c.seed))

export function useRace() {
  const [config, setConfig] = useState<RaceConfig>({ preset: 'random', size: 64, seed: 4242 })
  const [race, setRace] = useState(() => buildRace(config))
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(60)
  // Bumped whenever the (mutable) race moves, so React re-renders the lanes.
  const [version, setVersion] = useState(0)
  const configRef = useRef(config)
  const speedRef = useRef(speed)
  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  const configure = useCallback((patch: Partial<RaceConfig>) => {
    const next = { ...configRef.current, ...patch }
    configRef.current = next
    setConfig(next)
    setRace(buildRace(next))
    setPlaying(false)
  }, [])

  const reset = useCallback(() => configure({}), [configure])
  const reshuffle = useCallback(() => configure({ seed: newSeed() }), [configure])

  const step = useCallback(() => {
    setPlaying(false)
    if (race.tick(1)) setVersion((v) => v + 1)
  }, [race])

  const toggle = useCallback(() => {
    if (race.finished) return
    setPlaying((p) => !p)
  }, [race])

  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    let id = requestAnimationFrame(function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (race.advanceBy(stepsPerSecond(speedRef.current), dt)) setVersion((v) => v + 1)
      if (race.finished) {
        setPlaying(false)
        return
      }
      id = requestAnimationFrame(frame)
    })
    return () => cancelAnimationFrame(id)
  }, [playing, race])

  return { race, version, config, configure, playing, toggle, step, reset, reshuffle, speed, setSpeed }
}

export type RaceController = ReturnType<typeof useRace>
