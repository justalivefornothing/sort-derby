# Sort Derby - Plan

## Goal

Six sorting algorithms race side by side on the same shuffled data, with live
comparison/swap counters and a photo-finish leaderboard. The point is to make
asymptotic complexity *visible*: quicksort crosses the finish line while bubble
sort is still on its third pass.

## Features

1. Six algorithms as step generators: bubble, insertion, selection, merge,
   quick (Lomuto), heap.
2. Shared seeded PRNG input so every lane sorts the identical array. Presets:
   random, nearly-sorted, reversed, few-unique.
3. Global play / pause / step and a speed slider driving all six generators in
   lockstep frames.
4. Per-lane live counters (comparisons, swaps/writes, steps) and a finish-order
   leaderboard.
5. Array size slider (8-256) with bar colouring for compared, swapped and
   settled indices.
6. Solo mode: expand one lane to full width with a pseudocode panel that
   highlights the current line.
7. Export a CSV of final stats for the current run.

## Architecture

```
src/
  core/
    steps.ts        Step event types + runToEnd() reducer (stats from events)
    prng.ts         mulberry32 seeded PRNG + preset generators
    sorts/*.ts      one generator per algorithm, yields Step events
    pseudocode.ts   per-algorithm pseudocode lines (line ids match Step.line)
    csv.ts          stats -> CSV string
  race/
    useRace.ts      lockstep engine: holds 6 lanes, advances N steps per frame
    Lane.tsx        bar canvas for one lane + counters
    Leaderboard.tsx checkered-flag finish order panel
    Controls.tsx    play/pause/step/reset, speed, size, preset
    Pseudocode.tsx  solo-mode code panel
  App.tsx
```

Core rule: algorithms never touch stats. Each generator yields
`{ type: 'compare' | 'swap' | 'write' | 'settle', indices, line? }` over a
private copy of the array. The UI (and tests) reduce that stream into counters.
That keeps every lane honest and comparable - the same event stream that drives
the pixels drives the leaderboard numbers.

Lockstep: one `requestAnimationFrame` loop pulls `speed` events from every
unfinished generator per frame, so lanes advance at the same *step* rate and the
visual gap between them is purely algorithmic.

## Milestones

1. Plan, license, scaffold.
2. Core: step types, PRNG, six sorts, tests green.
3. Race engine + lanes + controls.
4. Leaderboard, presets, size slider, bar colouring.
5. Solo mode with pseudocode highlighting, CSV export.
6. Polish: typography, responsive, keyboard, smoke test, README, publish.
