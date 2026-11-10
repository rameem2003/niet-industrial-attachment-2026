import { useCallback, useMemo, useRef, useState } from "react";
import { SlowList, MemoSlowList } from "./components/SlowList.jsx";
import "./App.css";

const TASKS = [
  { id: 1, emoji: "🧠", text: "Understand why this list re-renders" },
  { id: 2, emoji: "🪞", text: "React.memo skips same-prop renders" },
  { id: 3, emoji: "📦", text: "useMemo keeps a value stable" },
  { id: 4, emoji: "🔁", text: "useCallback keeps a function stable" },
  { id: 5, emoji: "🤝", text: "All three tools work together" },
  { id: 6, emoji: "🚫", text: "Measure first, memoize later" },
  { id: 7, emoji: "🚀", text: "Same idea later in the cart page" },
];
/**
 * THE DEMO — one parent, three panels, same child everywhere.
 * The big "Renders" number in each panel is the whole story:
 *
 *   1 · No memo               → re-renders on every click     ❌
 *   2 · memo + new props      → memo can't help (common bug)  ❌
 *   3 · memo + stable props   → skips re-renders              ✅
 *
 * Dev-note: StrictMode double-renders in dev, so numbers climb in pairs.
 * The DIFFERENCE between panels is the lesson, and it holds in prod too.
 */
export default function App() {
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("— none yet —");

  // Panel 3 prop 1 — useMemo: `filtered` is the SAME array until `query`
  // really changes. An inline TASKS.filter(...) here would rebuild it
  // every render and re-render panel 3 on every click too.
  const filtered = useMemo(
    () =>
      TASKS.filter((t) =>
        t.text.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query], // TASKS never changes, so it isn't even a dependency
  );

  // Panel 3 prop 2 — useCallback: ONE function forever.
  // An inline arrow would be a new function each render and break memo.
  const handleSelect = useCallback((text) => setSelected(text), []);

  return (
    <main>
      <header className="demo-header">
        <h1>Do children re-render? The memo demo</h1>

        <p className="lead">
          Three panels, same list child. The big <strong>Renders</strong> number
          in each panel is the whole story. Steps:
        </p>
        <ol className="steps">
          <li>
            Click <strong>+1</strong> — panels 1 and 2 re-render. Panel 3 does{" "}
            <strong>nothing</strong>.
          </li>
          <li>
            Type <strong>memo</strong> in the box — panel 3 updates exactly
            once.
          </li>
        </ol>

        <div className="toolbar">
          <button
            type="button"
            className="btn"
            onClick={() => setCount((c) => c + 1)}
          >
            +1
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter… try 'memo'"
            aria-label="Filter tasks"
          />
          <span className="selected">Selected from list: {selected}</span>
        </div>
      </header>

      {/* ── Panel 1 · no memo — re-renders every click ── */}
      <div className="grid">
        <section className="panel panel--plain">
          <div className="panel__head">
            <h2>1 · No memo</h2>
            <span className="tag">re-renders every click</span>
          </div>
          <div className="panel__body">
            <SlowList
              label="Panel 1"
              list={filtered}
              onSelect={(text) => setSelected(text)}
            />
          </div>
        </section>

        {/* ── Panel 2 · memo with NEW props — the common bug ──
            Wrapped in memo, right. But `TASKS.filter(...)` and `() => ...`
            are rebuilt inside JSX on every parent render, so the props are
            brand-new objects/functions — memo says "different" every time. */}
        <section className="panel panel--broken">
          <div className="panel__head">
            <h2>2 · memo, props rebuilt every render</h2>
            <span className="tag">the common bug</span>
          </div>
          <div className="panel__body">
            <MemoSlowList
              label="Panel 2"
              list={TASKS.filter((t) =>
                t.text.toLowerCase().includes(query.trim().toLowerCase()),
              )}
              onSelect={(text) => setSelected(text)}
            />
          </div>
        </section>

        {/* ── Panel 3 · memo + stable props — the fix ──
            `filtered` (useMemo) and `handleSelect` (useCallback) keep their
            identities across renders → memo sees "same props" → skips. */}
        <section className="panel panel--fixed">
          <div className="panel__head">
            <h2>3 · memo + stable props ✅</h2>
            <span className="tag">skips re-renders</span>
          </div>
          <div className="panel__body">
            <MemoSlowList
              label="Panel 3"
              list={filtered}
              onSelect={handleSelect}
            />
          </div>
        </section>
      </div>

      <footer className="demo-footer">
        <p>
          <strong>Why panel 3 skips:</strong> <code>React.memo</code> compares
          props by identity, and panel 3&rsquo;s props never change identity
          between renders — same array (useMemo), same function (useCallback).
          Panels 1 and 2 rebuild props (or don&rsquo;t wrap), so they re-render.
          Note the +1 button doesn&rsquo;t even touch the list — the panels 1–2
          re-renders you see are the waste memo solves.
        </p>
        <p className="hint">
          Console: one line per render. Dev-only: StrictMode double-renders, so
          numbers climb in pairs — the panel-to-panel difference is the lesson
          (and holds in `npm run build` too).
        </p>
      </footer>
    </main>
  );
}
