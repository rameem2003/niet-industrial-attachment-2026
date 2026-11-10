# Day 10 — useEffect & Side Effects

**Session length:** ~2.5–3 hours
**Goal of today:** Let React talk to **the world outside components** — APIs, timers, subscriptions. Rendering stays pure; effects run *after* React finishes a render, and dependency arrays decide exactly when. The deliverable is the app you first attempted on Day 4: a **GitHub user search app** fetching live data as you type, with debouncing.

> **What changed since Day 4/8.** Day 4 fetched *before React existed* — manual `setState` style with
> `loading`/`error`/`success` flags and a hand-rolled render function. Day 8's components could hold state
> but had no way to *start* work. `useEffect` is the bridge: state in the component, world-effects it
> controls, and the **same three UI states** — now rendered by a component instead of a `setState` block.
>
> **How this connects forward.** Every data screen in this course — Day 13's product list, Day 28's
> authenticated feeds, Day 34's Next.js pages — is today's effect pattern. Cleanup comes back for real in
> websockets/subscriptions; dependency arrays are the day's whole discipline.
>
> The **`fetchJson` helper from Day 4 comes back** below — you've written it once already; keep it.

---

## 1 · The one idea — render is pure; effects live after it

A render (Day 7's function) must be a **pure description** of the screen given props + state:

```jsx
// ❌ side effects INSIDE render — no fetch, no timers, no DOM here
function Profile({ id }) {
  fetch(`/users/${id}`);                    // runs on EVERY render, duplicates, never awaited
  document.title = "profile";               // mutates the browser mid-render
  return <h1>…</h1>;
}
```

```jsx
// ✅ the render describes; the effect ACTS afterwards
function Profile({ id }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // runs AFTER React commits this render to the screen
    fetchJson(`/users/${id}`).then(setUser);
  }, [id]);                                 // …and re-runs when `id` changes

  return <h1>{user?.name ?? "Loading…"}</h1>;
}
```

`useEffect` = "after React commits this render, run this function — and *here is when*."

**`useEffect` runs after paint**, so it never blocks the visible page — and text-with-no-data can paint
first (that's the `Loading…` state, not a bug).

```jsx
import { useEffect, useState } from "react";
```

---

## 2 · The dependency array — the entire day in one table

```jsx
useEffect(() => { /* effect */ }, [deps]);   // deps decide WHEN it re-runs
```

| Syntax | When it runs | Which campus of problems it solves |
| --- | --- | --- |
| `useEffect(fn)` | **every** render (after each) | rare, deliberate: "anything changed, sync whatever" |
| `useEffect(fn, [])` | **once** — after the first render (mount) | initial fetch, one-time subscribe |
| `useEffect(fn, [id])` | after mount **and** when `id`'s *value* differs | react to selection/param changes |
| `useEffect(fn, [a, b])` | when `a` OR `b` differs | multi-input watch |

Two precision points the quiz loves:

1. **"changed" = Object.is identity**, not JSON equality. `setTerm` with `"new text"` changes `[term]`;
   re-setting the *same* string does **not** re-run the effect. `state` objects you build freshly each
   render compare as "different" even when equal in content — **deps are primitives** or stable refs
   (see pitfalls, § 5).
2. **Effects run in the order defined** — and once one sets state, that triggers a render, and the
   *next* effect runs after that render. Reading effects as "just functions" misses the ~cascade.

Mount vs update vs unmount — React's words but sharp: `[]` is the only setup committed once **and its
cleanup runs on unmount**; `[dep]` bumps **cleanup-then-run** on every dep change. No "didUpdate-only"
flag needed — the shape above *is* the lifecycle.

---

## 3 · Data fetching — the same three states, in a component

Day 4's fetch page was a script with `setState`-shaped flags. The component version:

```jsx
import { useEffect, useState } from "react";

async function fetchJson(url, options = {}) {           // Day 4 § 7.2 — unchanged, still yours
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

function PostList() {
  const [posts, setPosts] = useState([]);
  const [state, setState] = useState("loading");        // loading | success | error

  useEffect(() => {
    fetchJson("https://jsonplaceholder.typicode.com/posts")
      .then((data) => {
        setPosts(data);
        setState("success");
      })
      .catch(() => setState("error"));
  }, []);                                               // [] = once, on mount

  // …UI renders the four-way: loading | error | success(empty list ≠ error!) | grid
}
```

Four things guaranteed by this shape:

- the render **first paints** `loading` (effect hasn't run yet — that's fine, it's the point);
- `catch` catches **network** failures; `res.ok` conversion catches **HTTP** 404/500 (Day 4, § 2's "check ok");
- `[]` means the server is hit **once** — not per keystroke/re-render (`useEffect(fn)` would be a flood);
- empty-success renders `"no posts"` — the empty state is not an error.

---

## 4 · Cleanup — the return function

`useEffect` may **return a cleanup function**, which React calls: before the effect re-runs and when the
component unmounts. It's where every timer and subscription finally keeps its promise — `clearInterval`,
`clearTimeout`, unsubscribe, abort, ignore-flag reset.

```jsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id);       // ← React calls this before next run + on unmount
}, []);

useEffect(() => {
  document.title = `${remaining} tasks left`;
  return () => { document.title = "React App"; };
}, [remaining]);
```

All the cleanup idioms you know, one view:

| I started… | I clean up with… |
| --- | --- |
| `setInterval` | `clearInterval(id)` |
| `setTimeout` (debounce, § 6) | `clearTimeout(id)` |
| a fetch the user raced past | `AbortController.abort()` / an `ignore` flag |
| a subscription / listener | unsubscribe |

**Why cleanup ≠ optional when deps change:** without it, each `[term]` keystroke adds *another* running
fetch/timer — the cleanup is what makes the *latest* run the only run. And in dev your page **mounts, runs
effects, cleans up, mounts again** once (React Strict Mode's second mount) — a built-in test that your
cleanup actually works. If dev shows a doubled effect and prod doesn't: that's Strict Mode probing for
exactly this discipline.

---

## 5 · The pitfalls — the ones that eat entire afternoons

### 5.1 Missing dependency array → infinite loop

```jsx
// ❌ no deps → runs after EVERY render → ran a setState → new render → runs again → …
useEffect(() => { setCount((c) => c + 1); });
```

### 5.2 Fresh objects/arrays/functions in deps → sleepless re-runs

"Changed" = identity, and these are **new every render**:

```jsx
// ❌ {} inside deps is a brand-new object per render — infinite
useEffect(() => {
  search(options);
}, [options]);            // options = { term, limit } built inside JSX

// ✅ deps are the primitives that describe it
useEffect(() => {
  search({ term, limit: 10 });
}, [term]);               // or useMemo the object (class9/memo.md)
```

Same rule for functions in deps — if you pass callbacks around, `useCallback` stabilizes them (memo.md).

### 5.3 Stale closures — reading old state from an async callback

```jsx
useEffect(() => {
  setSearches((s) => [...s, count]);   // ❌ `count` is the MOUNT-time value inside effect for [term]?
}, [term]);
```

The effect captured `count` as it was when *that string of code was created*. Fixes: **updater form**
(`setX((prev) => …)`) for anything built on old state, or include the value in deps — the linter
(`react-hooks/exhaustive-deps`) yells about these trusts for a reason.

```jsx
// ✅ functional updates never need the snapshot
setSearches((prev) => [...prev, prev.length + 1]);
```

### 5.4 Derived state stored as state

```jsx
// ❌ sync via effect — two sources of truth, missing updates
const [doubled, setDoubled] = useState(0);
useEffect(() => setDoubled(count * 2), [count]);

// ✅ derive in render — it can never go stale
const doubled = count * 2;
```

If a value can be computed from existing state/props, computing it is the render's job — Day 8's
filter-tab `visible` list was exactly this "derive, don't store" move. Effects are for the world outside
the component, not for bookkeeping inside it.

---

## 6 · Practice — GitHub User Search (live, debounced)

**Time:** 75–90 min · **Deliverable:** `react-github-search` repo, debounced live search + 3 states, via PR.
API: `https://api.github.com/search/users?q=<term>` — no key, CORS-friendly. Unauthenticated GitHub allows
**60 requests/hour**, so the debounce in Task C is a real requirement, not decoration.

```bash
npm create vite@latest react-github-search -- --template react   # + Tailwind
git switch -c feature/search
```

### Task A — submit-based search, all three states (30 min)

1. Input + form. On **submit** (preventDefault!): fetch `?q=<term>`, render avatar + username per result.
2. The effect way: a `[]`-mount run is unnecessary; `onSubmit` + the callback pattern from Day 7 works —
   *or* an effect on a `submittedTerm` state (either is fine; the goal is the loader/error/empty trio).
3. `setState` per UI state; results into `state`-shaped `res.items`; **empty matches ≠ network error**.

### Task B — search as the user types (25 min)

1. Move the fetch into `useEffect` with `[term]`.
2. Guard the empty query (`term.trim()` false → skip the fetch, render an idle "type to search" state) —
   otherwise GitHub 422s an empty q.
3. Watch DevTools' Network tab: one request across whole words is the *intent*; observable reality is a
   request per keystroke — Task C exists.

### Task C — debounce 500 ms (25 min)

1. Re-arm per keystroke, fire only after real silence (timers + cleanup — § 4):

```jsx
useEffect(() => {
  if (!term.trim()) return;

  const timer = setTimeout(() => {
    search(term);               // fire the fetch — trimmed, guarded inside `search`
  }, 500);

  return () => clearTimeout(timer);   // ← every new keystroke cancels the pending one
}, [term]);
```

2. Prove it: hold one long word, then release — DevTools shows **one** request; fix it to fetch only after
   a complete typed phrase for your sanity. 60 req/hr will run out *fast* without the guard.
3. `let ignore = false` + `return () => { ignore = true; }` — the out-of-order guard skipped in § 3's
   happy-path example (it's in the reference below): a slow, older response landing **after** a newer
   one must never `setState` and never paint.

<details>
<summary>Full reference implementation (compare after Task C)</summary>

```jsx
import { useEffect, useState } from "react";

const GH = "https://api.github.com/search/users?q=";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

export default function App() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [state, setState] = useState("idle");     // idle | loading | success | error

  useEffect(() => {
    const q = term.trim();
    if (!q) { setResults([]); setState("idle"); return; }

    let ignore = false;

    const timer = setTimeout(() => {
      setState("loading");
      fetchJson(GH + encodeURIComponent(q))
        .then((data) => { if (!ignore) { setResults(data.items); setState("success"); } })
        .catch((err) => { if (!ignore && err.name !== "AbortError") setState("error"); });
    }, 500);

    return () => { ignore = true; clearTimeout(timer); };
  }, [term]);

  return (
    <main className="max-w-md mx-auto p-6">
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}   // the ONLY writer to `term`
        placeholder="Search GitHub users…"
        className="w-full border border-slate-300 rounded-lg px-3 py-2"
      />

      {state === "loading" && <p className="mt-4 text-slate-500">Searching…</p>}
      {state === "error" && (
        <p className="mt-4 text-rose-600">Search failed — check quota / network.</p>
      )}
      {state === "success" && results.length === 0 && (
        <p className="mt-4 text-slate-500">No users matched.</p>
      )}
      {state === "idle" && results.length === 0 && (
        <p className="mt-4 text-slate-500">Type to search.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((u) => (
            <li key={u.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full" />
              <span className="font-medium">{u.login}</span>
              <a href={u.html_url} target="_blank" rel="noreferrer" className="ml-auto text-sky-600 text-sm">
                profile ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

</details>

```bash
git add . && git commit -m "Search with three UI states"
git commit -m "Effect fetch on term change"
git commit -m "Debounce 500ms with timer cleanup"
git commit -m "Ignore-guard against late responses"
git push -u origin feature/search   # → PR → self-review → merge
```

---

## 7 · Cheat sheet

```jsx
useEffect(fn)         // every render            — practically never
useEffect(fn, [])     // mount once              — initial fetch, subscribe
useEffect(fn, [id])   // when id differs         — selection / search / params
return cleanup        // before next run + unmount — clearInterval, clearTimeout, abort, ignore

Effects live OUTSIDE render: no fetch/timers/DOM inside the return-JSX itself
Deps are VALUES — Object.is identity; primitives and stable refs only
Funnel: state → render paints → effect acts → (later) setState → re-render
```

```text
Pitfalls  missing deps → never runs correctly | footprint-tracking deps → loops
          fresh {} / () in deps → infinite sync | stale closures → updater form + lint
          derived info → compute in render, state only for ACTUALLY-async data
```

---

## 8 · Quick self-check

1. In one sentence: render vs effect — who paints, who acts, in what order?
2. The four shapes of `useEffect` — what does each dependency setup promise?
3. `useEffect(fn, [term])` — does it re-run when you `setTerm(term)` with the identical same string?
4. Why does the fetch effect use `[]` while a search effect uses `[term]` — what breaks if they're swapped?
5. Where does cleanup run, and what timer/API-related rule needs it by Day 5?
6. `.catch` alone isn't enough on a fetch — what else does `fetchJson` check, and for what reason?
7. Why is the empty-results screen not an error screen?
8. `{}` or `() =>` inside a dependency array — why is that a bug, in one sentence?
9. Stale closure from an async effect — the two standard fixes?
10. `useEffect(() => setDoubled(n * 2), [n])` — what's the render-side cure?
11. Dev shows every effect running twice on mount — name the mode, and what discipline it's testing?
12. In the search lab, what does the `ignore` flag prevent — plot: response order and UI?

> Answers: (1) Render describes the screen (pure, from props/state); the effect acts `after` React commits it — after paint, and again on dependency change. (2) `fn`-only = after every render; `[]` = once on mount (cleanup on unmount); `[a]` = mount + whenever `a` differs; `[a, b]` = whenever either differs. (3) No — identity, not content: same string, `Object.is` true, effect stays. (4) The initial-fetch one would re-flood per keystroke (paid per dependency change), while the search one would leave the term mounted on `query ""` initially/frozen — wrong state-source both ways. (5) Before the effect re-runs and on unmount — and Day 5's rule: every `setInterval`/`setTimeout` needs the matching `clearInterval`/`clearTimeout` *here*. (6) It checks `res.ok` — `.catch` catches network failures only; 404/500 fulfill, and the helper turns them into thrown errors. (7) Empty is a *success with no rows*; it carries its own friendly "nothing found," while errors need retry/quota context. (8) It's a new identity every render, so the effect sees "changed" and re-runs — forever. (9) The updater form `setX((prev) => …)`, or include the value in the deps — plus the lint plugin rule. (10) Drop this state + effect entirely and derive: `const doubled = n * 2` in render. (11) React **Strict Mode** (double mount in dev) — it's auditing that your cleanup is real before you meet real subscriptions. (12) Out-of-order network responses — a slow, older response landing after a newer one; `ignore` (per effect run) makes late/burned responses never `setState` and never paint.

---

**Tomorrow — Day 11:** React Router. Today everything lives in *one screen*; tomorrow URL-driven views
arrive — `Routes`, dynamic params, `Link`, `<Outlet />` — and the GitHub-search page becomes a *page*.
