import { useEffect, useRef, type CSSProperties } from 'react'
import type { Lane as LaneState } from '../race/engine'

const COMPARE = '#f4f1ea'
const MOVE = '#ff3b3b'

function drawLane(canvas: HTMLCanvasElement, lane: LaneState): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr
    canvas.height = h * dpr
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const { arr, settled, compared, moved, alg, done } = lane
  const n = arr.length
  const slot = w / n
  const gap = slot > 4 ? 1 : slot > 2 ? 0.5 : 0
  const barW = Math.max(0.5, slot - gap)
  let max = 1
  for (const v of arr) if (v > max) max = v

  for (let i = 0; i < n; i++) {
    const hh = Math.max(1, (arr[i]! / max) * (h - 2))
    if (!done && moved.includes(i)) {
      ctx.fillStyle = MOVE
      ctx.globalAlpha = 1
    } else if (!done && compared.includes(i)) {
      ctx.fillStyle = COMPARE
      ctx.globalAlpha = 1
    } else {
      ctx.fillStyle = alg.color
      ctx.globalAlpha = settled[i] ? 1 : 0.42
    }
    ctx.fillRect(i * slot, h - hh, barW, hh)
  }
  ctx.globalAlpha = 1
}

const fmt = (n: number) => n.toLocaleString('en-US')

interface Props {
  lane: LaneState
  index: number
  version: number
  solo: boolean
  onSolo: () => void
}

export function Lane({ lane, index, version, solo, onSolo }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    drawLane(canvas, lane)
    const ro = new ResizeObserver(() => drawLane(canvas, lane))
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [lane, version])

  const { alg, tally, place, done } = lane
  const busy = !done && tally.steps > 0

  return (
    <section
      aria-label={`Lane ${index + 1}: ${alg.name} sort`}
      style={{ '--lane': alg.color } as CSSProperties}
      className={`grid gap-x-3 border-b border-dashed border-line/25 py-2 ${
        solo ? 'grid-cols-1' : 'grid-cols-[7.25rem_1fr] sm:grid-cols-[minmax(9rem,12rem)_1fr]'
      }`}
    >
      <header className={`flex min-w-0 ${solo ? 'flex-row flex-wrap items-baseline gap-x-4 pb-2' : 'flex-col'}`}>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none font-semibold text-(--lane) tabular-nums">
            {index + 1}
          </span>
          <button
            type="button"
            onClick={onSolo}
            title={solo ? 'Back to the race' : `Solo ${alg.name} with pseudocode`}
            className="group -mx-1 truncate rounded px-1 text-left font-display text-base leading-none font-medium uppercase tracking-wide text-chalk hover:text-(--lane) sm:text-xl"
          >
            {alg.short && !solo ? (
              <>
                <span className="sm:hidden">{alg.short}</span>
                <span className="hidden sm:inline">{alg.name}</span>
              </>
            ) : (
              alg.name
            )}
            <span className="ml-1 text-xs tracking-normal text-muted normal-case group-hover:text-(--lane)">
              {solo ? 'back' : 'solo'}
            </span>
          </button>
        </div>
        <span className="text-[11px] text-muted">{alg.complexity}</span>
        <dl className="mt-1 grid grid-cols-[2.6rem_1fr] gap-x-1 text-[11px] leading-4 tabular-nums sm:text-xs">
          <dt className="text-muted">cmp</dt>
          <dd>{fmt(tally.comparisons)}</dd>
          <dt className="text-muted">swap</dt>
          <dd>{fmt(tally.swaps)}</dd>
          <dt className="text-muted">write</dt>
          <dd>{fmt(tally.writes)}</dd>
          <dt className="text-muted">steps</dt>
          <dd className="font-semibold">{fmt(tally.steps)}</dd>
        </dl>
      </header>
      <div className="relative min-w-0">
        <canvas
          ref={ref}
          role="img"
          aria-label={`${alg.name} sort bars, ${busy ? 'sorting' : done ? 'sorted' : 'ready'}`}
          className={`block w-full ${solo ? 'h-[46vh] min-h-64' : 'h-24 sm:h-28'}`}
        />
        <div className="checker absolute inset-y-0 -right-1.5 w-1.5 opacity-70" aria-hidden="true" />
        {place !== null && (
          <span className="slide-in absolute top-1 right-2 inline-flex items-center gap-1.5 rounded-sm bg-(--lane) px-2 py-0.5 font-display text-sm font-bold uppercase text-asphalt shadow-lg">
            <span className="checker inline-block size-3 rounded-[2px]" aria-hidden="true" /> P{place}
          </span>
        )}
      </div>
    </section>
  )
}
