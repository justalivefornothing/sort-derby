import type { CSSProperties } from 'react'
import type { Lane } from '../race/engine'

const fmt = (n: number) => n.toLocaleString('en-US')

interface Props {
  finishOrder: readonly Lane[]
  total: number
}

export function Leaderboard({ finishOrder, total }: Props) {
  const open = finishOrder.length > 0
  return (
    <aside
      aria-label="Leaderboard"
      aria-live="polite"
      className="self-start overflow-hidden rounded-lg border border-line/15 bg-asphalt-2/70"
    >
      <header className="flex items-center gap-3 border-b border-line/15 px-3 py-2">
        <span className="checker size-6 rounded-sm" aria-hidden="true" />
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Finish</h2>
        <span className="ml-auto text-xs text-muted tabular-nums">
          {finishOrder.length}/{total}
        </span>
      </header>
      {open ? (
        <ol className="divide-y divide-line/10">
          {finishOrder.map((lane) => (
            <li
              key={lane.alg.id}
              style={{ '--lane': lane.alg.color } as CSSProperties}
              className="slide-in grid grid-cols-[2rem_1fr_auto] items-center gap-x-2 px-3 py-2"
            >
              <span className="font-display text-2xl leading-none font-semibold text-(--lane) tabular-nums">
                {lane.place}
              </span>
              <div className="min-w-0">
                <div className="truncate font-display text-base leading-tight font-medium uppercase tracking-wide">
                  {lane.alg.name}
                </div>
                <div className="text-[11px] text-muted tabular-nums">
                  {fmt(lane.tally.comparisons)} cmp · {fmt(lane.tally.swaps + lane.tally.writes)} moves
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-sm font-semibold">{fmt(lane.tally.steps)}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted">steps</div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-3 py-6 text-center text-xs leading-5 text-muted">
          Nobody has crossed the line yet.
          <br />
          Hit <b className="text-chalk">Start</b> and the board stamps each finisher.
        </p>
      )}
    </aside>
  )
}
