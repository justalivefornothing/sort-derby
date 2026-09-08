import { useEffect, useState } from 'react'
import { Controls } from './components/Controls'
import { Lane } from './components/Lane'
import { Leaderboard } from './components/Leaderboard'
import { Pseudocode } from './components/Pseudocode'
import { ALGORITHMS, type AlgorithmId } from './core/algorithms'
import { statsToCsv } from './core/csv'
import { useRace } from './race/useRace'

function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const ctl = useRace()
  const { race, version, config } = ctl
  const [solo, setSolo] = useState<AlgorithmId | null>(() => {
    const id = new URLSearchParams(window.location.search).get('solo')
    return ALGORITHMS.some((a) => a.id === id) ? (id as AlgorithmId) : null
  })
  const soloLane = solo ? race.lanes.find((l) => l.alg.id === solo) : undefined

  const exportCsv = () => {
    const rows = race.finishOrder.map((l) => ({ place: l.place, algorithm: l.alg.name, ...l.tally }))
    downloadCsv(`sort-derby-${config.preset}-n${config.size}-seed${config.seed}.csv`, statsToCsv(config, rows))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(t.tagName)) return
      if (e.key === ' ') {
        e.preventDefault()
        ctl.toggle()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        ctl.step()
      } else if (e.key === 'r' || e.key === 'R') ctl.reset()
      else if (e.key === 'Escape') setSolo(null)
      else if (/^[1-6]$/.test(e.key)) {
        const lane = race.lanes[Number(e.key) - 1]
        if (lane) setSolo((s) => (s === lane.alg.id ? null : lane.alg.id))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ctl, race])

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px] flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="font-display text-5xl leading-none font-bold uppercase tracking-tight sm:text-6xl">
            Sort <span className="text-lime">Derby</span>
          </h1>
          <p className="mt-1 max-w-xl text-xs leading-5 text-muted sm:text-sm">
            Six sorting algorithms race on the identical shuffled array, advancing in lockstep, one primitive
            operation per step. The gaps you see are pure algorithmic complexity.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-wider text-muted" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-2 bg-line" /> comparing
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-2 bg-[#ff3b3b]" /> swap / write
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-2 bg-lime" /> settled
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-2 bg-lime/40" /> unsorted
          </li>
        </ul>
      </header>

      <Controls ctl={ctl} onExport={exportCsv} />

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <main className="track relative min-w-0 rounded-lg border border-line/15 px-3 pr-4 sm:px-4 sm:pr-5">
          {soloLane ? (
            <div className="grid gap-4 py-2 lg:grid-cols-[1fr_22rem]">
              <Lane lane={soloLane} index={race.lanes.indexOf(soloLane)} version={version} solo onSolo={() => setSolo(null)} />
              <Pseudocode alg={soloLane.alg} line={soloLane.line} done={soloLane.done} />
            </div>
          ) : (
            race.lanes.map((lane, i) => (
              <Lane
                key={lane.alg.id}
                lane={lane}
                index={i}
                version={version}
                solo={false}
                onSolo={() => setSolo(lane.alg.id)}
              />
            ))
          )}
        </main>
        <Leaderboard finishOrder={race.finishOrder} total={race.lanes.length} />
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <span>
          Keys: <kbd>Space</kbd> play/pause · <kbd>&rarr;</kbd> step · <kbd>R</kbd> reset · <kbd>1</kbd>-<kbd>6</kbd>{' '}
          solo lane · <kbd>Esc</kbd> back
        </span>
        <span>* Lomuto quicksort degrades to O(n²) on sorted or reversed input. Try it.</span>
      </footer>
    </div>
  )
}
