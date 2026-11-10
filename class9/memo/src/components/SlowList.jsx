import { memo, useRef } from "react";

/**
 * The "expensive" child. Same body for all 3 panels of App.jsx,
 * so the ONLY difference between panels is memoization.
 *
 * memo idea         here
 * memoized by React → `MemoSlowList` below
 * render counter    `renders.current` (shown live in the panel)
 * console log       one line per render in DevTools
 * fake heavy work   the ~25 ms loop — re-renders also FEEL slow
 */
export function SlowList({ label, list, onSelect }) {
  const renders = useRef(0);
  renders.current += 1;
  console.log(`${label} rendered — #${renders.current}`);

  // Pretend this component does heavy work on every render.
  // Small enough to stay usable; big enough to feel the jank.
  let sink = 0;
  const start = performance.now();
  while (performance.now() - start < 25) {
    sink += Math.random();
  }
  if (sink < 0) {
    console.log(sink); // never true — keeps the accumulator used
  }

  return (
    <div className="screen">
      <p className="renders">
        Renders: <strong>{renders.current}</strong>
      </p>

      {list.length === 0 && <p className="empty">No matches</p>}

      <ul className="task-list">
        {list.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="task-row"
              onClick={() => onSelect(item.text)}
            >
              <span aria-hidden="true">{item.emoji}</span>
              <span className="task-text">{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * React.memo wrapper (memo.md § 2):
 * re-renders ONLY when a prop is different (shallow, Object.is).
 * New array / new inline function → "different" → memo can't help.
 */
export const MemoSlowList = memo(SlowList);
