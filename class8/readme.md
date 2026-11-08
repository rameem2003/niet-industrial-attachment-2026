# Day 8 — State & Events

**Session length:** ~2.5–3 hours
**Goal of today:** Give your components **memory** and **reactions**. Yesterday's components were frozen — data came in as props and buttons only did `console.log`. Today a component gets its own data (`useState`), responds to clicks and inputs (events), shows different screens on demand (conditional rendering), and lists render correctly with `key`. The deliverable is the classic first React app: a **to-do list** — add, delete, toggle-complete, filter.

> **What changed since Day 7.** React gave you components, JSX, and props — but props flow **down**, and
> nothing inside could change. Today's state is the data a component **owns**: it survives re-renders, and
> updating it re-renders the component. UI again = a function of data, only now the data changes at runtime.
>
> **How this connects forward.** Day 10's fetch screen shows loading/error through the conditional
> rendering you learn in § 4. The Day 14 cart is § 2's add/remove/toggle shapes. The multi-field form of
> Day 9 is today's one-input form, times six. Learn these four verbs cold: **add, delete, update, show/hide**.

---

## 1 · The one idea — state is component memory

Two kinds of data in a component:

| | Props | State |
| --- | --- | --- |
| Who owns it | the **parent** (passed down) | the component itself |
| Can the component change it? | no — read-only | **yes** — via the setter |
| Missing? | optional, with defaults | you initialize it |
| Triggers re-render? | when the parent re-renders with new props | when you call the setter |

```jsx
const [count, setCount] = useState(0);
//   ↑ read     ↑ update     ↑ initial value (once)
```

- `useState` returns exactly two things: the **current value** and a **setter function** — destructured into
  `[name, setName]`.
- You don't edit the DOM, and you don't re-assign `count = 5`. You **call the setter** with the new value;
  React **schedules a re-render**, the component function runs again with fresh `count`, and the JSX comes
  out different. That diff-then-update is the whole engine — still not your job.

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <p className="text-4xl font-bold">{count}</p>
      <button onClick={() => setCount(count + 1)} className="px-4 py-2 rounded-lg bg-sky-600 text-white">
        +1
      </button>
      <button onClick={() => setCount(0)} className="px-4 py-2 rounded-lg border">
        Reset
      </button>
    </div>
  );
}
```

Click → setter → render again → new number. No `document.querySelector`, no re-creating nodes — the Day 4
card loop is gone for good.

**Hook rules (apply to every hook, forever):** import it, call it at the **top level** of your component —
not inside conditions, loops, or event handlers — and same order every render.

```jsx
import { useState } from "react";

// ❌ useState inside an if → React loses track of the hook order
if (something) { const [x, setX] = useState(0); }
```

---

## 2 · `useState` — replace, never mutate

State is compared by **reference**. Push into the same array and React may think "nothing changed":

```jsx
// ❌ mutation — same array, same reference, no reliable re-render
todos.push(newTodo);
setTodos(todos);

// ✅ replacement — NEW array, new reference
setTodos([...todos, newTodo]);
```

The four update shapes you'll write this week and for nine more weeks:

```jsx
// ADD       — spread old, append new
setTodos([...todos, { id, text, done: false }]);

// DELETE    — filter out the one
setTodos(todos.filter((t) => t.id !== id));

// UPDATE ONE — map, replace where id matches, spread the rest
setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

// UPDATE OBJECT — spread, overwrite keys
setUser({ ...user, name: "Samira" });
```

**No `.push`, no `.splice`, no `user.name = x`, no sort-in-place.** Day 3's immutability instinct (`slice`,
`toSorted`, spread) is the same musculature — in React it's not a style, it's *how updates register*.

### Functional updates — when the new value needs the old one

```jsx
// ❌ two calls in one handler → both read the SAME stale count → +1 applies once
setCount(count + 1);
setCount(count + 1);

// ✅ updater form — React passes the LATEST value each time
setCount((c) => c + 1);
setCount((c) => c + 1);   // genuinely +2
```

Rule of thumb: **if the new value depends on the old, use the function form.** (For literals — reset,
set-by-input — plain `setState(value)` is fine.)

---

## 3 · Events

React listening looks like HTML attributes, camelCased:

| JSX | Fires on | Typical job |
| --- | --- | --- |
| `onClick` | click | buttons, tabs, toggles |
| `onChange` | input changes | reading typed text (`event.target.value`) |
| `onSubmit` | form submit | validate → add → clear (with `preventDefault`) |

### Pass the function, don't call it in JSX

```jsx
// ✅ pass a reference — clicked when actually clicked
<button onClick={handleClick}>Save</button>
<button onClick={() => remove(id)}>✕</button>

// ❌ that's a CALL — fires on every render, before anyone clicked
<button onClick={handleClick()}>Save</button>
```

With arguments there's nothing to pass directly, so wrap — `onClick={() => remove(id)}` is the standard
shape (Day 7's `{...rest}` enviar pattern also still works for handlers).

### The event object & forms

React wraps browser events — same API you know: `event.target.value`, `event.preventDefault()`.

```jsx
<form onSubmit={(e) => {
  e.preventDefault();            // stop the full-page reload — class rule for forms
  addTodo();
}}>
  <input onChange={(e) => setText(e.target.value)} />
</form>
```

`preventDefault` on submit is non-optional in this course: the browser's default submit reloads the page
and throws your state away.

Handlers are plain functions — `async` allowed; keep the Day 4 habit of `try/catch` inside them.

---

## 4 · Conditional rendering — three idioms

**Ternary** — one of two screens:

```jsx
{loading ? <Spinner /> : <PostList posts={posts} />}
```

**`&&`** — optional extra, only when true:

```jsx
{error && <p className="text-rose-600">{error}</p>}
{doneCount > 0 && <button>Clear completed</button>}
```

⚠️ `&&` renders the falsy **left side** when it isn't boolean — `{count && <Badge text="x" />}` prints a
literal `0` once `count` is 0. Guard with a real comparison: `{count > 0 && …}`.

**Early return** — the guard before the real JSX:

```jsx
function Profile({ user }) {
  if (!user) {
    return <p className="text-slate-500">No profile yet.</p>;   // screen A
  }
  return <Card title={user.name}>{user.bio}</Card>;              // screen B
}
```

And the **empty state** — a third kind of "nothing to show" that is *not* an error:

```jsx
{visible.length === 0
  ? <p className="text-center text-slate-500">Nothing here — yet.</p>
  : <TodoList todos={visible} />}
```

Loading, error, success, *empty* — the three-plus-one UI states from Day 4, one idiom each.

---

## 5 · Lists & `key`, the deeper look

```jsx
<ul>
  {visibleTodoTodos.map((t) => (
    <li key={t.id} className="flex items-center gap-3 ...">…</li>
  ))}
</ul>
```

On every re-render React compares old tree ↔ new tree. `key` is the **identity** it matches by:

```text
Before:  [t1] [t2] [t3]        click delete on t2 →
After:   [t1]      [t3]        `key` solves it: React sees t1 and t3 SURVIVED
                              and only t2 vanished — nothing else re-created,
                              focus/checkbox state preserved.
```

- **Stable and unique**: an id from the data (`id`, slug) — `id` from `Date.now()` in the practice.
- **Not the array index** when items can be deleted/reordered — the "identity" shifts with the array and
  React reuses the **wrong** nodes (stale text, stuck focus, misplaced input). Index is fine only if
  the list is honestly append-only/frozen.
- Keys live on the element you map; **children don't receive them as props**.

---

## 6 · Practice — the To-Do List

**Time:** 60–90 min · **Deliverable:** `react-todo` repo, all four verbs working through a **PR** (Day 5's loop, Day 7's components).

```bash
npm create vite@latest react-todo -- --template react   # + Tailwind wiring like Day 7
git switch -c feature/todo
```

Start state in `App.jsx` — both items must show without any user action:

```jsx
const [todos, setTodos] = useState([
  { id: 1, text: "Learn useState", done: true },
  { id: 2, text: "Build the to-do list", done: false },
]);
```

### Task A — Add (20 min)

1. Input + "Add" button inside `<form onSubmit>`.
2. `onChange` → `setText(e.target.value)`; submit → `preventDefault()`.
3. Guard empty: `.trim()` and `return` — no empty tasks.
4. New object: `{ id: Date.now(), text, done: false }` — spread-add (§ 2), then **clear the input**
   (`setText("")`) and watch the form reset itself from state.

### Task B — Toggle complete + Delete (20 min)

1. Checkbox per row → `onChange={() => toggle(t.id)}`.
2. Toggle = the map-and-spread update (§ 2). Done rows: `line-through text-slate-400`.
3. ✕ button → `remove(id)` → the filter-delete. Check the list shortens — and stays.

### Task C — Filter tabs (25 min)

1. `const [filter, setFilter] = useState("all")` — three pill buttons (`all / active / completed`),
   active one styled (`bg-sky-600 text-white`, else `bg-slate-100`).
2. **Derive, don't duplicate**: don't keep a second array — one source list, three lenses:

```jsx
const visible = todos.filter((t) =>
  filter === "all"      ? true      :
  filter === "active"   ? !t.done   :
                          t.done
);
```

3. Each tab knows its **own empty state** — "Nothing here — yet." ≠ a network error.

### Task D — Footer stats + clear completed (15 min)

1. `{doneCount} of {todos.length} done.` (computed, not stored — derived values aren't state).
2. **Clear completed** button — the same filter-delete, `&&`-rendered only when relevant (§ 4).
3. Stretch (index-key demo): delete an item **mid-list** while its checkbox is focused → note a checkbox
   flip with the wrong text → then re-key by `t.id` and confirm the cure. That bug, out loud, is worth
   more than the fix.

<details>
<summary>Full reference implementation (compare after building — don't copy first)</summary>

```jsx
import { useState } from "react";

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn useState", done: true },
    { id: 2, text: "Build the to-do list", done: false },
  ]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");

  const add = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((t) => [...t, { id: Date.now(), text: trimmed, done: false }]);
    setText("");
  };

  const toggle = (id) =>
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const remove = (id) => setTodos((t) => t.filter((x) => x.id !== id));

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <main className="max-w-md mx-auto p-6">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
        />
        <button className="px-4 py-2 rounded-lg bg-sky-600 text-white">Add</button>
      </form>

      <div className="mt-4 flex gap-2">
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition ${
              filter === f ? "bg-sky-600 text-white" : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-center text-slate-500">Nothing here — yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {visible.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                className="w-4 h-4"
              />
              <span className={`flex-1 ${t.done ? "line-through text-slate-400" : ""}`}>
                {t.text}
              </span>
              <button
                onClick={() => remove(t.id)}
                className="text-rose-600 hover:text-rose-700 text-sm"
                aria-label={`Delete ${t.text}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-sm text-slate-500">
        {doneCount} of {todos.length} done.
        {doneCount > 0 && (
          <button
            onClick={() => setTodos((t) => t.filter((x) => !x.done))}
            className="ml-2 text-rose-600 hover:underline"
          >
            Clear completed
          </button>
        )}
      </p>
    </main>
  );
}
```

</details>

```bash
git add . && git commit -m "Add and clear form logic"
git commit -m "Toggle complete plus delete"
git commit -m "Filter tabs with derived list"
git commit -m "Footer stats and clear completed"
git push -u origin feature/todo   # → PR → self-review this diff → merge
```

---

## 7 · Cheat sheet

```jsx
const [v, setV] = useState(init)  // destructure: [read, write]; hooks at top level
setV(newValue)                    // literal set — reset, form input
setV((old) => next)               // updater form — whenever next needs old
setTodos([...todos, t])                              // ADD
setTodos(todos.filter((x) => x.id !== id))           // DELETE
setTodos(todos.map((x) => x.id === id ? { ...x, done: !x.done } : x))  // UPDATE ONE
setUser({ ...user, name: v })                        // OBJECT update
```

```text
onClick / onChange / onSubmit;  e.preventDefault() on every form submit
onClick={fn}                  ✅    onClick={fn()}                  ❌ calls at render
{cond ? a : b}   {ok && <x/>} — boolean-guard, or 0 leaks   if (!x) return <Empty/>
.map((t) => <li key={t.id}>…)   — stable unique id, never an index if rows move
```

---

## 8 · Quick self-check

1. Props vs state — who owns what, and who can change each?
2. `setCount(count + 1)` twice in one handler — what does `count` end up as? And the fix?
3. `onClick={handleClick()}` — when does it actually run, and why is that wrong?
4. On this form's `onSubmit`, the two lines you must write — and what breaks without the first?
5. `{count && <Badge text="x" />}` with `count = 0` — what shows up on screen?
6. `todos.push(x); setTodos(todos);` — why can the screen not update?
7. The four update shapes — ADD, DELETE, UPDATE-ONE, OBJECT — one line each.
8. Why is an array index a bad `key` for a deletable list?
9. Where does the `key` attribute go, and does the mapped child receive it as a prop?
10. Write the early-return guard for a component whose `user` prop may be missing.
11. "Nothing here — yet." — which state is that, and which of the three-plus-one states is it NOT?
12. Calling `setCount(9)` and then reading `count` on the very next line — what do you get?

> Answers: (1) Props: owned by the **parent**, read-only, passed down. State: owned by the *component itself*, changed only through the setter, re-renders on every change. (2) `+1` — both calls read the same render's `count`; each queued update overwrites. Fix = the updater form `setCount((c) => c + 1)` twice → +2. (3) The moment JSX evaluates, on every render — button never clicked, handler still fired. Pass the function instead. (4) `e.preventDefault()` and then your add logic — without it the browser's default submit reloads the page and the state is gone. (5) A literal `0`, because `0 && x` evaluates to the falsy left side and React renders it — guard with a boolean: `count > 0 && …`. (6) `.push` mutates in place — same array reference, React's diff sees no change, so it may not re-render; create a **new** array instead. (7) `[...todos, item]`, `todos.filter((x) => x.id !== id)`, `todos.map((x) => x.id === id ? { ...x, done: !x.done } : x)`, `{ ...user, name: v }`. (8) The index shifts with the array; after deletes the "identity" sticks to the wrong node, so React reuses the wrong DOM — stale text, stuck focus on the wrong input. (9) On the element JSX you map over (`<li key={t.id}>`) — not inside the child, and not on the surrounding `<ul>`. Children don't receive it as a prop. (10) `function Profile({ user }) { if (!user) return <p>No profile yet.</p>; return <Card title={user.name}>{user.bio}</Card>; }`. (11) The **empty state** — a legitimate "no items yet" success; it is **not** an error, and it must not reuse the error screen. (12) Still the old value — the re-render is scheduled, not inlined; only the next render sees `9`. (That's also why § 2 says updater form whenever the next value needs the old.)

**Tomorrow — Day 9:** Component communication & forms. Today the child talked to its own state; tomorrow
the **child → parent** door opens: callbacks as props, lifting state up, controlled inputs — and a
multi-field signup form with validation wearing all of Day 8's verbs.
