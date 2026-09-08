import { PRESET_LABELS, PRESETS } from '../core/prng'
import { MAX_SIZE, MIN_SIZE, stepsPerSecond, type RaceController } from '../race/useRace'

const btn =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 font-display text-sm font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40'
const ghost = `${btn} border-line/20 bg-asphalt-2 text-chalk hover:border-line/50 hover:bg-asphalt-3 disabled:hover:border-line/20 disabled:hover:bg-asphalt-2`

const fmtRate = (v: number) => {
  const r = stepsPerSecond(v)
  return r >= 1000 ? `${(r / 1000).toFixed(r >= 10000 ? 0 : 1)}k` : `${Math.round(r)}`
}

interface Props {
  ctl: RaceController
  onExport: () => void
}

export function Controls({ ctl, onExport }: Props) {
  const { race, config, configure, playing, toggle, step, reset, reshuffle, speed, setSpeed } = ctl
  const started = race.lanes.some((l) => l.tally.steps > 0)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line/15 bg-asphalt-2/70 p-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={race.finished}
          aria-keyshortcuts="Space"
          className={`${btn} min-w-24 border-lime bg-lime text-asphalt hover:bg-lime/85 disabled:hover:bg-lime`}
        >
          {race.finished ? 'Finished' : playing ? 'Pause' : started ? 'Resume' : 'Start'}
        </button>
        <button type="button" onClick={step} disabled={race.finished} aria-keyshortcuts="ArrowRight" className={ghost}>
          Step
        </button>
        <button type="button" onClick={reset} disabled={!started} aria-keyshortcuts="R" className={ghost}>
          Reset
        </button>
      </div>

      <label className="flex min-w-36 flex-1 flex-col gap-1 text-[11px] uppercase tracking-wider text-muted">
        <span className="flex justify-between">
          Speed <b className="font-semibold text-chalk normal-case tabular-nums">{fmtRate(speed)} ops/s</b>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="accent-lime"
        />
      </label>

      <label className="flex min-w-36 flex-1 flex-col gap-1 text-[11px] uppercase tracking-wider text-muted">
        <span className="flex justify-between">
          Array size <b className="font-semibold text-chalk normal-case tabular-nums">n = {config.size}</b>
        </span>
        <input
          type="range"
          min={MIN_SIZE}
          max={MAX_SIZE}
          value={config.size}
          onChange={(e) => configure({ size: Number(e.target.value) })}
          className="accent-lime"
        />
      </label>

      <fieldset className="flex flex-col gap-1 text-[11px] uppercase tracking-wider text-muted">
        <legend className="mb-1">Input</legend>
        <div role="radiogroup" className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={config.preset === p}
              onClick={() => configure({ preset: p })}
              className={`h-7 rounded px-2 text-[11px] font-semibold tracking-wider transition-colors ${
                config.preset === p ? 'bg-chalk text-asphalt' : 'bg-asphalt-3 text-chalk hover:bg-line/20'
              }`}
            >
              {PRESET_LABELS[p]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-2">
        <button
          type="button"
          onClick={reshuffle}
          className={`${ghost} normal-case tracking-normal`}
          title="Reshuffle with a new seed"
        >
          <span aria-hidden="true">&#x21bb;</span> seed {config.seed}
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={!race.finished}
          className={ghost}
          title={race.finished ? 'Download final stats as CSV' : 'Available once every lane has finished'}
        >
          Export CSV
        </button>
      </div>
    </div>
  )
}
