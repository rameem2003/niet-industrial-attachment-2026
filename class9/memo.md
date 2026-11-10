# Day 9 Extra — `React.memo`, `useMemo`, `useCallback`

> A performance mini-lecture to pair with `readme.md` (Day 9: Component Communication & Forms). Not a new
> API day — three tools for **one** problem: needless re-renders. Read `readme.md` first; come here before
> the signup form's callbacks get passed *everywhere*.

---

## 1 · The one problem — new props, every render

When a parent re-renders, **every child re-renders too** — even if nothing it read changed. Usually that's
fine (renders are cheap). It becomes expensive when a child is heavy: a big list, a chart, a wide form panel.

```jsx
function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <HeavyList items={items} />        {/* re-renders on EVERY click — `items` didn't change! */}
    </>
  );
}
```

React gives three tools, each caching a different thing:

| Tool | Caches | Stays "the same" while… |
| --- | --- | --- |
| `React.memo(Child)` | the child's rendered output | its props don't differ (shallow check) |
| `useMemo(fn, deps)` | a **value** (computed list, object) | its deps are unchanged |
| `useCallback(fn, deps)` | a **function** you pass down | its deps are unchanged |

⚠️ The catch that makes all three a *team*: props you build **inside JSX** — `{...}`, `() =>`, `items.filter(...)`
— are **brand-new objects/functions on every render**, and shallow comparison can't tell them from "changed."
Left as-is, `React.memo` never holds. That's where `useMemo`/`useCallback` come in.

---

## 2 · `React.memo` — skip re-renders when props are unchanged

```jsx
const HeavyList = React.memo(function HeavyList({ items, onSelect }) {
  console.log("HeavyList render");          // watch when this fires — measure, don't guess
  return <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;
});
```

Wrapped, `HeavyList` re-renders only when a prop **differs** — measured *shallowly*:

```jsx
<HeavyList items={items} />                 // ✅ `items` is the same reference → skipped

<HeavyList items={items.filter((i) => i.active)} />          // ❌ new array every render → always re-renders
<HeavyList onSelect={() => go(id)} />       // ❌ new function every render → memo is vapor
<HeavyList style={{ margin: 4 }} />         // ❌ new object literal → memo is vapor
```

The pattern is direct: **wrap the component, keep prop *identities* stable.** Custom
compare exists if "shallow" isn't enough:

```jsx
memo(HeavyList, (prev, next) => prev.items === next.items);   // return true = skip render
```

---

## 3 · `useMemo(fn, deps)` — remember a value

Two jobs, both "keep this value the same until its inputs change":

```jsx
// 1. Expensive computation — recompute only when `users` changes
const usersByRank = useMemo(
  () => [...users].sort((a, b) => b.score - a.score),
  [users]
);

// 2. Reference stability — a NEW object each render is the memo-killer from § 2
const settings = useMemo(() => ({ theme, fontSize }), [theme, fontSize]);
<HeavyList settings={settings} />       // stable now — one object identity, reused
```

| Without `useMemo` | With `useMemo` |
| --- | --- |
| items sorted on every render/keystroke | sorted only when the raw list changed |
| `{a, b, c}` = fresh object in props each render | one object identity until inputs change |

Discipline: `useMemo` re-runs its factory only when a dep differs (Object.is — § readme Day 10, § 5), and
skips the work otherwise. Trivial values (`a + b`, `text.trim()`) don't need it — the caching costs more
than the math.

---

## 4 · `useCallback` — remember a function

A callback prop defined in JSX is a **new function every render**, which means every memo child
downstream sees "a changed prop" — and re-renders forever:

```jsx
const onAdd = useCallback(
  (text) => setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]),
  []                                  // no outside state read → []
);

<AddTodo onAdd={onAdd} />             // memoized child, STABLE handler → skips re-renders
```

`useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)` — same engine, functions in / function out. Deps rule
Deps rule matches Day 10's: the dep array is what the closure reads; updater-form closures like `(prev) => …` avoid the
closure trap entirely (empty deps stay honest).

Without a memoized child, `useCallback` is overhead on a function that was going to be used anyway — the
pair earns its keep together:

```text
memo(Child) — no-op  +  unstable props in  →  child re-renders anyway
memo(Child) — no-op  +  stable useX props  →  child re-renders only when it MUST
```

---

## 5 · The trio, end to end

One realistic shape from the signup form (Day 9 practice) — a heavy preview panel that should NOT re-render
on every keystroke of a sibling field:

```jsx
const LivePreview = React.memo(function LivePreview({ form, onJumpToStep }) { … });

export default function SignupApp() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // stable callbacks — memo children compare against THEM every render
  const update = useCallback(
    (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const onJumpToStep = useCallback((s) => setStep(s), []);   // plus step state from Day 9

  const previewData = useMemo(() => ({ shown: form.name, email: form.email }), [form.name, form.email]);

  return (
    <>
      <Panel form={form} update={update} />                  {/* needs EVERY keystroke */}
      <LivePreview form={previewData} onJumpToStep={onJumpToStep} />  {/* skips needless re-renders */}
    </>
  );
}
```

Evaluates as: keystroke → `Panel` re-renders (it must — it owns the input), `LivePreview` **skips** until
*its own* inputs (`form.name`, `form.email`) actually change. One render, split by responsibility.

---

## 6 · When NOT to use them (most of the time, actually)

| The temptation | Reality check |
| --- | --- |
| Wrap every component in `memo` "to be fast" | Renders are cheap; memo compare + cache is real cost and mental overhead. Wrap the **heavy, leaf** ones — lists, charts, preview panels. |
| `useMemo` on `title.toUpperCase()` | Return-what-you-typed: rendering computes trivial values faster than remembering them. |
| Sprinkle memo hooks *before* measuring | Measure first — **React DevTools → Profiler** shows actual render costs. Fix what is slow and visible, not what is *hypothetically* heavy. |
| `useCallback` with wrong/missing deps | The predicate stale-closure bug factory from Day 10 § 5.3 — unstable identities are safer than wrong ones. `react-hooks/exhaustive-deps` (ESLint) is on duty here. |

`memo` earns its keep most honestly in the places you'll build soon anyway: cart lines (Day 14), product
grid pages (Day 13), today's preview panel. Jump there *when a component actually re-renders too much* —
then this file is your recipe sheet.

---

## 7 · Cheat sheet

```jsx
// The three, one line each
const Child = React.memo(Child);                       // skip child render unless props change
const value  = useMemo(() => makeValue(a, b), [a, b]);  // cache a VALUE between renders
const stable = useCallback((x) => act(x), [dep]);       // cache a FUNCTION identity

// The team rule — memo holds ONLY if every prop identity holds
<Child items={useMemo(() => filter(x), [x])}           // objects with useMemo
       onSelect={useCallback(() => go(id), [id])} />   // callbacks with useCallback

// Deps discipline — same rule as useEffect (Object.is, exhaust everything read)
```

---

## 8 · Quick self-check

1. Parent renders — name the child that also re-renders, and the default rule.
2. What exactly does `React.memo` compare, and what does "shallow" miss?
3. `{a: 1}` created in JSX — why does it sink memo, one sentence?
4. Which TWO of the trio are called in render scope — and what does each return/keep?
5. `useCallback(fn, [])` — what does `[]` tell React about the closure inside `fn`?
6. The equivalence: `useCallback(fn, deps)` ≡ `useMemo(???, deps)`?
7. In § 5's form: why does `Panel` re-render on every keystroke while `LivePreview` skips?
8. Before reaching for all three — what do you DO first, and with which DevTools panel?
9. A memoized child still re-renders every badge — name two likely prop-identity leaks.
10. Wrong deps on `useCallback` — the bug class it opens, and the lint rule that guards it?

> Answers: (1) Every child, by default — parent render re-renders the subtree regardless of whether a child's props changed. (2) Its props, one level deep by reference (Object.is); it misses *content-plus-equal* objects AND newly-created ones — a new `{}` inside JSX is always "different". (3) It's a brand-new object identity on every render, so the shallow comparison never finds "same props". (4) `useMemo` and `useCallback` — both *called during render*; one returns a cached value, the other a cached function, until deps change. (5) "This closure reads nothing that changes" — the function identity stays valid forever, which is honest only for handler-style code built on setters / the updater form. (6) `useMemo(() => fn, deps)` — same caching machinery, functions as the value. (7) `Panel` owns the input, so it must; `LivePreview`'s props (`previewData`, `onJumpToStep`) are identity-stable through `useMemo`/`useCallback` and its slice never changed on that keystroke. (8) Profile first — React DevTools **Profiler**, see which components render how long and how often; memoize the measured offenders. (9) Inline object/array props (`style={{…}}`, derived arrays) and inline callbacks (`() => go(id)`) — any freshly-built reference defeats the memo. (10) The stale-closure class from Day 10 § 5.3 — reading captured state that changed since; `react-hooks/exhaustive-deps` ESLint rule is the guard.
