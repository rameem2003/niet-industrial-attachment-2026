# Day 9 — Component Communication & Forms

**Session length:** ~2.5–3 hours
**Goal of today:** Open the **child → parent door**. So far state lived in *one* component; real forms need three fields talking to one owner, and siblings sharing one list. Today you'll lift state up, pass callbacks down, build **controlled inputs**, and validate — ending with a **multi-step signup form with a live preview**.

> **What changed since Day 8.** Components got memory (`useState`) and reactions (events) — but only over
> their own data. If `AddTodo` (child) owns the list and `StatsBar` (sibling) needs it, neither can reach
> the other. Today state moves **up** to the closest common parent; children report *events* back through
> callbacks. Data flows down; events flow up. Always.
>
> **How this connects forward.** `AuthContext` on Day 28 is today's "lifted state" taken global (Context
> API, Day 12, is the cure for when you'd have to drill through five layers). Every POST form in the
> MERN block (login Day 26, new post Day 30) is today's form pattern with a fetch after submit.
>
> 📎 **Optional extra reading:** `class9/memo.md` — `React.memo`, `useMemo`, `useCallback`, the
> performance trio that makes callback-heavy component trees behave (and why callback props can quietly
> break memoization).

---

## 1 · The one idea — data down, events up

```text
        TodoApp  ← owns `todos` (lifted state)
         ▱▱▱▱
  ┌───────┴────────┐
<TodoList>      <StatsBar>         ← render from props (reading)
     ▲
  <AddTodo>                        ← calls props.onAdd(text) (reporting)
```

| Direction | Mechanism | Looks like |
| --- | --- | --- |
| Parent → child | **props** (data) | `<TodoList todos={todos} />` |
| Child → parent | **callback props** (events) | `<AddTodo onAdd={add} />` → child calls `onAdd("new")` |

```jsx
function Parent() {
  const [message, setMessage] = useState("");

  return (
    <section>
      <p>Latest from child: {message}</p>
      <Child onSay={(msg) => setMessage(msg)} />
    </section>
  );
}

function Child({ onSay }) {
  return <button onClick={() => onSay("hi from the child")}>Say</button>;
}
```

The child never touches the parent's state — it **calls a prop that happens to be a function**, and the
parent's own setter does the updating. One-way flow intact; React re-renders from wherever the state changed.

Naming convention worth keeping forever: prop `onSay` / handler `handleSay` — `on*` names promise "when X
happens, I'll call you."

---

## 2 · Lifting state up

The decision rule: state lives **as low as possible, but high enough** to reach every component that needs it.

```jsx
// ❌ AddTodo owns the list it only half-controls; TodoList can't see it
function AddTodo() { const [todos, setTodos] = useState([]); … }
function TodoList() { /* needs todos too — stuck */ }
```

```jsx
// ✅ lifted: closest common ancestor owns it, both children render from props
function App() {
  const [todos, setTodos] = useState([]);

  return (
    <>
      <AddTodo onAdd={(t) => setTodos((prev) => [...prev, t])} />
      <TodoList todos={todos} />
      <StatsBar todos={todos} />
    </>
  );
}
```

Who keeps **form input text** local? Usually the component typing it (`AddTodo`'s draft text) — nobody else
reads the half-typed draft. Lift *shared* state; keep *private* state home. Day 8's todo list was already
lifted in spirit — today you name the move and repeat it deliberately.

**Prop drilling** — when lifted state must pass *through* layers that don't care:

```jsx
<App> → <Layout user=…> → <Sidebar user=…> → <UserBadge user=…>   // user drilled through two straight pipes
```

Annoying but honest, and fine for 2–3 hops. When a pipe runs five layers deep, that's Day 12's Context API.

---

## 3 · Controlled inputs

An input with a **state-backed `value`** plus an `onChange` writing back — state is the single source of truth:

```jsx
const [name, setName] = useState("");

<input
  value={name}                                  // screen ← state
  onChange={(e) => setName(e.target.value)}     // keystroke → state
/>
```

| | Controlled (course default) | Uncontrolled |
| --- | --- | --- |
| Truth lives in | React state | the DOM itself |
| Read it | anytime: `submit` handler uses state | `inputRef.current.value` at the end |
| Reset it | `setName("")` — one line | manual `ref.current.value = ""` |
| Validate live / preview / disable button on invalid | natural | awkward |

Day 8's practice inputs just *looked* controlled; today the `value=` prop is explicit. That's what made
"clear the input with `setText("")`" a one-liner — the DOM follows state, never the reverse.

**One index for many fields** — one object, one updater, `[e.target.name]` doing field math:

```jsx
const [form, setForm] = useState({ name: "", email: "", password: "" });

const update = (e) =>
  setForm({ ...form, [e.target.name]: e.target.value });   // computed key → field it came from

<input name="email" value={form.email} onChange={update} />
<input name="password" value={form.password} onChange={update} />
```

Every field names its state slot via `name=` — six inputs, one `update`, immutable spread (Day 8 § 2) at
the core.

---

## 4 · Validation — a pure function plus an errors object

Keep validation **pure and separate** from JSX: takes the form, returns errors.

```jsx
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email.";
  if (form.password.length < 8) errors.password = "At least 8 characters.";
  return errors;                                  // {} = all good
}

const [errors, setErrors] = useState({});

function handleSubmit(e) {
  e.preventDefault();
  const errs = validate(form);
  setErrors(errs);
  if (Object.keys(errs).length === 0) {
    console.log("submitting:", form);             // Day 26: a real POST lands here
  }
}
```

Display under each field:

```jsx
<input name="email" … />
{errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
```

Two habits this course keeps:

- **Validate on submit first** — red appears after the button, not while the user is mid-field with a
  half-written input; live-per-keystroke validation comes later with `touched` flags.
- `empty errors object` as the "go" signal — never a boolean state that can drift out of sync with `form`.

---

## 5 · Practice — Multi-step Signup + Live Preview

**Time:** 75–90 min · **Deliverable:** `react-signup` repo, three steps + preview panel + validation, via PR.

```bash
npm create vite@latest react-signup -- --template react   # + Tailwind (Day 7 setup)
git switch -c feature/signup
```

Shape: state lives in `App` (lifted), **three step components** render slices of it, a **live preview
panel** always reads the same state — proof the lift works.

### Task A — one-step form, fields + validation (30 min)

1. Three controlled fields: `name` (required), `email` (regex), `password` (≥ 8) — one `form` object, one
   `update` with computed keys (§ 3).
2. `validate` (§ 4) on submit; errors under fields in `text-rose-600`; successful submit clears the form.
3. Submit handler keeps the Day 8 discipline: `preventDefault`, trim, no empty submits.

```text
After Task A the form works — but one screen. Multi-step needs the lift to pay off…
```

### Task B — three steps + live preview (30 min)

1. `const [step, setStep] = useState(0)` — `0` Account, `1` Profile (bio + emoji picker via buttons),
   `2` Review. Conditional rendering (Day 8 § 4, early return per step is also fine):

```jsx
{step === 0 && <AccountStep form={form} update={update} errors={errors} />}
{step === 1 && <ProfileStep form={form} update={update} />}
{step === 2 && <ReviewStep form={form} />}
```

2. **Next** runs that step's `validate` before advancing — errors block, buttons disabled where they must
   be (`disabled={step === 0}` on Back).
3. **Preview panel** (right column on `md:` screens — Day 6 grid) renders `form.name`, emoji, email —
   live, no refresh: it receives the *same props* as the steps, from the same lifted state.

### Task C — finish line + stretch (25 min)

1. Review step shows every field + an **Edit** button per section (jumps `setStep(0|1)` with values intact —
   controlled inputs make "come back later" trivial).
2. Final submit logs the object — where Day 26's JWT `POST /auth/signup` will land.
3. Stretch: progress dots/width (`w-1/3 md:w-full` steps), keyboard focus to first field per step,
   `localStorage` draft (remember Day 12? no — Day 8's `useState` + `JSON.parse` … it's stretch meat).

<details>
<summary>Step skeleton (structure guidance for Task B — build your own)</summary>

```jsx
function SignupApp() {
  const [form, setForm] = useState({ name: "", email: "", password: "", bio: "", emoji: "🙂" });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const next = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
  };

  const stepViews = [
    <AccountStep form={form} update={update} errors={errors} />,
    <ProfileStep form={form} update={update} updateEmoji={(e) => setForm({ ...form, emoji: e })} />,
    <ReviewStep form={form} goTo={(s) => setStep(s)} onSubmit={() => console.log("signup!", form)} />,
  ];

  return (
    <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-[1fr_280px] p-6">
      <section>{stepViews[step]}</section>
      <LivePreview form={form} step={step} />
    </div>
  );
}
```

</details>

```bash
git add . && git commit -m "Controlled form with validation"
git commit -m "Three steps sharing lifted state"
git commit -m "Live preview panel from lifted state"
git push -u origin feature/signup   # → PR → self-review → merge
```

---

## 6 · Cheat sheet

```jsx
// LIFT  — closest common ancestor owns shared state
// DOWN  — data via props      <TodoList todos={todos} />
// UP    — events via callbacks <AddTodo onAdd={add} />  → child calls onAdd(x)
// MULTI-FIELD — one object, one updater, computed key
const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
// VALIDATION — pure fn in, errors object out; {} = clean
const errors = validate(form);
setErrors(errors);
if (Object.keys(errors).length === 0) submit();
```

```text
Controlled: value={state} + onChange → state is truth; clearing a form = one setState
Disabled blocking: disabled={step === 0}      errors.email && <p className="text-rose-600">
```

---

## 7 · Quick self-check

1. The two flows between parent and child — what mechanism carries each?
2. Who calls the function passed as `onAdd`, and who defines it?
3. "Lift state up" — what does "closest common ancestor" decide, concretely?
4. Who owns the draft text of `AddTodo`'s input — and who owns the added todos?
5. Controlled input — the two attributes that bind a field to state?
6. One updater for five fields — what makes it work ([e.target.?] and the object in state)?
7. `validate` returns `{}` — what does that mean, and how does the code read it?
8. When do you *first* show validation errors in this course, and why not on every keystroke?
9. The preview panel updates without refresh — why? (One phrase about props.)
10. Step 2 blocks "Next" until email passes regex — where does that check run, what state holds the verdict?
11. Prop drilling — is it a bug? When does it stop being practical, and what's the Day 12 cure?
12. After all of today — which deeper problem do callback props still not fix? (Hint: see `memo.md`.)

> Answers: (1) Data = props (**down**); events = callback props called by the child (**up**). (2) The child calls it; the parent defines the real behavior (usually its own setter) at creation — React's one-way flow intact. (3) The component *lowest* in the tree that still reaches every reader/writer of that state — siblings share through it rather than through each other. (4) Draft: `AddTodo` (nobody else reads the half-typed input); todos: the parent everyone reads. (5) `value={state}` + `onChange`; the input mirrors state, never their own DOM. (6) The computed key `[e.target.name]` picks which field fires; the whole object spreads and swaps that one key. (7) `{}` = "no validation complaints" — read with `Object.keys(errors).length === 0` as the submit gate. (8) First on **submit**; per-keystroke red before the user has finished typing is noise, and `touched`-style flags come later. (9) It re-renders when the props it receives change — the same lifted state object feeds steps and preview. (10) At the **Next click** (this course: validate-then-go), verdict stored as the `errors` object — an empty one is the pass. (11) No — it's honest, one-way flow at work; it hurts when a prop rides 3+ layers that don't care; Day 12's Context API takes over there. (12) Every render hands a **brand-new callback/object** down the tree — a memoized child with `React.memo` compares props shallowly and sees "different", so the memo never holds. Stable identities come from `useCallback` / `useMemo` — the companion lecture `class9/memo.md`.

---

**Tomorrow — Day 10:** `useEffect` & side effects. Today's state was in-memory from line one; tomorrow
the **world outside React** comes in — fetching from an API when a component mounts (and re-fetching when a
dependency changes), with cleanup timers and the three states you already know, now inside a component.
