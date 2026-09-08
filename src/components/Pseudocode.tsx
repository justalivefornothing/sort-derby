import type { CSSProperties } from 'react'
import type { Algorithm } from '../core/algorithms'

interface Props {
  alg: Algorithm
  /** 1-based line of the most recent step; 0 before the first step. */
  line: number
  done: boolean
}

export function Pseudocode({ alg, line, done }: Props) {
  return (
    <div
      style={{ '--lane': alg.color } as CSSProperties}
      className="rounded-lg border border-line/15 bg-asphalt-2/70 p-3"
    >
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
          {alg.name} <span className="text-muted">pseudocode</span>
        </h2>
        <span className="text-[11px] text-muted">
          {done ? 'finished' : line === 0 ? 'waiting for the flag' : `line ${line}`}
        </span>
      </div>
      <ol className="text-xs leading-6 sm:text-[13px]">
        {alg.code.map((text, i) => {
          const active = !done && i + 1 === line
          return (
            <li
              key={i}
              aria-current={active ? 'step' : undefined}
              className={`grid grid-cols-[1.5rem_1fr] whitespace-pre rounded px-1 transition-colors ${
                active ? 'bg-(--lane)/20 text-chalk shadow-[inset_2px_0_0_var(--lane)]' : 'text-muted'
              }`}
            >
              <span className="text-right pr-2 text-muted/60 tabular-nums">{i + 1}</span>
              <code>{text}</code>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
