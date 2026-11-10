# memo demo — see re-renders live

Full lecture: [`../memo.md`](../memo.md). This app is the hands-on version.

One parent, three panels, **the same list child in all three**. The big
**Renders** number in each panel is the whole story:

```text
1 · No memo                → re-renders on every click      ❌
2 · memo + new props       → memo can't help (common bug)   ❌
3 · memo + stable props    → skips re-renders               ✅
```

## Run

```bash
npm install   # first time only
npm run dev   # → http://localhost:5173
```

## Try it (30 seconds)

1. Click **+1** — panels 1 and 2 re-render; panel 3 does nothing.
2. Type **memo** in the filter box — panel 3 updates exactly once.
3. DevTools console prints one line per render, so you can count along.

## Where each idea lives

| Idea | File |
| --- | --- |
| The heavy child + `React.memo` wrapper | `src/components/SlowList.jsx` |
| The stable array (`useMemo`) | `src/App.jsx` → `filtered` |
| The stable function (`useCallback`) | `src/App.jsx` → `handleSelect` |
| The "common bug" (inline props) | `src/App.jsx` → panel 2 |

Dev-only note: `<StrictMode>` double-renders in dev, so counters climb in
pairs — the difference **between panels** is the lesson (and holds in
production builds).
