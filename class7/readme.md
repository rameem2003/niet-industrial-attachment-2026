# Day 7 — React Basics

**Session length:** ~2.5–3 hours
**Goal of today:** Stop commanding the DOM one element at a time and start **describing UI as functions of data**. A React component is a JavaScript function that *returns what the screen should look like*; React does the updating. By the end you'll have reusable `Card`, `Button`, and `Badge` components composed into one small UI — styled with Day 6's Tailwind classes.

> **What changed since Day 6.** Yesterday markup lived in `index.html` and you styled it with classes.
> Today the *same classes* live inside JavaScript, in JSX, spelled `className`. The profile card becomes a
> `<Card />` — reusable, data-driven, no copy-paste HTML.
>
> **How this connects to Day 4.** Remember writing `createElement` + `textContent` + `replaceChildren()`
> every time data changed? React replaces all of that: you change the data, React re-renders. The
> three-state fetch UI from Day 4 becomes a component that reads state (Day 8) and re-renders itself.
>
> **How this connects forward.** Everything from now — Router (Day 11), Context (Day 12), the capstone —
> is today's picture at bigger scale: components + props + composition.

---

## 1 · The one idea — components

Before React, a dynamic page meant manual DOM surgery:

```js
// Day 4 style: imperative — HOW to touch the screen
grid.replaceChildren();
posts.forEach((p) => {
  const card = document.createElement("article");
  const title = document.createElement("h2");
  title.textContent = p.title;
  grid.append(card);
  // …14 more lines…
});
```

React shrinks that to one line of intent:

```js
// React style: declarative — WHAT the screen is, given the data
{posts.map((p) => <PostCard key={p.id} post={p} />)}
```

Three mental models, one per line:

| Model | Meaning |
| --- | --- |
| **Component** = function | `Card({ title, children })` returns JSX; call it with different props → different cards |
| **Data down** | props flow one way: parent → child. A child never reaches up to edit its parent |
| Virtual DOM | you return "what it should look like"; React diffs and updates only what changed — that's the engine's job, not yours |

```jsx
function App() {
  return <PostCard title="First post" author="Samira" />;
}
function PostCard({ title, author }) {
  return <article className="card"><h2>{title}</h2><p>{author}</p></article>;
}
```

Same `<PostCard>` → different props → different cards. **`<h1>Hello</h1>` is not HTML; it's JavaScript
that becomes DOM.**

---

## 2 · Project setup with Vite (10 minutes)

```bash
npm create vite@latest react-ui -- --template react
cd react-ui
npm install
npm run dev        # http://localhost:5173 — edit, save, browser updates instantly
```

The files you touch today:

```text
src/main.jsx        # entry — mounts <App /> onto the real #root div (you rarely edit)
src/App.jsx         # your root component (delete boilerplate, own it)
src/index.css       # put Tailwind's @import "tailwindcss"; here if you want classes available
```

Optional but recommended — Tailwind inside React (same plugin as Day 6):

```bash
npm install tailwindcss @tailwindcss/vite
# vite.config.js → import tailwindcss from "@tailwindcss/vite" → plugins: [tailwindcss()]
# src/index.css → @import "tailwindcss";
```

Your first honest component — replace `App.jsx` with:

```jsx
export default function App() {
  return <h1>Hello React</h1>;
}
```

Edit the text while the dev server runs and watch it update without a refresh — that feedback loop is
the real reason React is pleasant.

---

## 3 · JSX — five rules

JSX is JavaScript's syntax for describing UI. Rules:

### 3.1 One root → wrap in a fragment

```jsx
// ❌ two roots side by side — not allowed
return <h2>Title</h2><p>Body</p>;

// ✅ one root, or the invisible fragment
return (
  <article>…</article>
);
return (
  <>
    <h2>Title</h2>
    <p>Body</p>
  </>
);
```

### 3.2 `{}` holds JavaScript *expressions* — never statements

```jsx
<p>{firstName + " " + lastName}</p>        // ✅ value
<p>{user ? "online" : "offline"}</p>       // ✅ ternary (expression)
<p>{products.length}</p>                   // ✅ value
<p>{if (sale) "OFF"}</p>                   // ❌ if is a statement — use ternary
<p>{for (…)}</p>                           // ❌ loops go above the return (or .map)
```

**Rule: `{}` must evaluate to a value** — numbers, strings, function calls, ternaries, `.map(...)`.

### 3.3 `className`, not `class`

```jsx
<div className="card p-4">…</div>          // ✅
<div class="card p-4">…</div>              // ❌ (silently ignored — the #1 JSX bug)
```

Tailwind classes from Day 6 work unchanged; only the attribute name changes (`for` → `htmlFor` on labels).

### 3.4 Self-closing tags

```jsx
<img src="/photo.jpg" alt="Me" />          // ✅ JSX requires the slash on empty elements
<br /> <input type="text" />               // same
```

### 3.5 `style` takes an object, camelCase inside

```jsx
<p style={{ color: "crimson", fontSize: "1.5rem" }}>Attention</p>
// outer braces = "JS value", inner braces = the object; never kebab-case here
```

Inline objects are recreated every render — for constants, move them out of the component.

---

## 4 · Functional components & props

A **component is a plain function**:

```jsx
// Arrow with explicit destructure — the house style
const Badge = ({ text, tone = "sky" }) => {
  const tones = {
    sky:   "bg-sky-100 text-sky-700",
    green: "bg-green-100 text-green-700",
    rose:  "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>
      {text}
    </span>
  );
};

// Usage — attributes become props
<Badge text="New" />
<Badge text="Sale" tone="rose" />
```

**Props are read-only.** A component never edits its own props; it only returns JSX from them:

```jsx
// ❌ mutating props
function Post({ post }) {
  post.title += " (edited)";    // don't
}

// ✅ derive, don't mutate
function Post({ post }) {
  const shown = post.title.toUpperCase();
  return <h2>{shown}</h2>;
}
```

`use` components like functions-with-flair: tags `<Badge text="New" />` = calling
`Badge({ text: "New" })` — the camelCase lowercase names map straight into a props object.

---

## 5 · The `children` prop — composition's secret door

Anything *between* a component's opening and closing tag arrives as `props.children`:

```jsx
function Card({ title, badge, children }) {
  return (
    <article className="bg-white rounded-2xl shadow-md p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {badge && <Badge text={badge} tone="green" />}
      </header>
      <div className="mt-2 text-slate-600">{children}</div>   {/* nested content slots in here */}
    </article>
  );
}
```

```jsx
<Card title="My profile" badge="Open to work">
  <p>Front-end student. Learning React.</p>       {/* ← this whole subtree = children */}
  <p>Currently at Day 7.</p>
</Card>
```

`children` makes one generic shell host infinite contents — that's composition: **small parts, snapped
together, not configs**.

---

## 6 · A reusable `Button`

```jsx
function Button({ children, variant = "primary", ...rest }) {
  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700",
    ghost:   "border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger:  "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition ${variants[variant]}`}
      {...rest}                      // onClick, type, disabled… pass straight through
    >
      {children}
    </button>
  );
}

<Button>Follow</Button>
<Button variant="ghost">Message</Button>
<Button variant="danger" type="button" onClick={() => console.log("later!")}>Delete</Button>
```

`{...rest}` passes any extra attributes down — no prop is left behind.

---

## 7 · Rendering multiple — `.map` + `key`

```jsx
const skills = ["HTML", "CSS", "JavaScript", "Tailwind"];

<ul className="flex gap-2 flex-wrap">
  {skills.map((s) => <li key={s} className="px-2 py-1 bg-slate-100 rounded">{s}</li>)}
</ul>
```

`key` = a **stable identity** per item so React can match old and new nodes (Day 8 does lists deeply —
for now: unique, stable, ideally an id — never the render index if order can change).

And the composition payoff — one generic card, many looks:

```jsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {projects.map((p) => (
    <Card key={p.id} title={p.title} badge={p.status}>
      <p>{p.description}</p>
      <Button variant="ghost">View</Button>
    </Card>
  ))}
</div>
```

---

## 8 · Practice — reusable UI kit (Task A/B/C)

**Time:** 60–90 min · **Deliverable:** `react-ui` repo with the file tree below, pushed via PR.

```bash
git switch -c feature/ui-kit
```

### Task A — scaffold + first component (15 min)

1. Vite + React setup (§ 2). Delete the default boilerplate in `App.jsx`.
2. `App` renders `<h1>UI Kit</h1>`; tweak text live while the server runs — feel the reload.

### Task B — `Badge` + `Button` (25 min)

1. `src/components/Badge.jsx` (§ 4) with 3 tones; render a row of badges in `App`.
2. `src/components/Button.jsx` (§ 6) with 3 variants + `{...rest}`.
3. One intentionally wrong `<Badge class="…">` and one `<div class=…>` — watch DevTools' silent failure,
   then fix. You'll spot these bugs in code reviews forever.

### Task C — `Card` + composition (30 min)

1. `src/components/Card.jsx` with `title`, optional `badge`, and `children` (§ 5).
2. Hardcode one full profile using Card + Badge + two Buttons.
3. `const projects = [{ id, title, description, status } × 3]` in `App.jsx`; map into Cards with `key`
   (§ 7). Same API, three different cards.

```bash
git add . && git commit -m "Add Badge, Button, Card components"
git commit -m "Compose the App out of the UI kit"
git push -u origin feature/ui-kit     # → PR → self-review the diff → merge
```

---

## 9 · Cheat sheet

```jsx
export default function App() {
  return (
    <>
      <h1 className="text-2xl font-bold">Root</h1>
      <Badge text="New" tone="green" />                 {/* props = attributes */}
      <Card title="Tip" badge="Live">                    {/* children = nested JSX */}
        <p>Body content</p>
        <Button variant="primary" onClick={handler}>Go</Button>
      </Card>
      {items.map((item) => <li key={item.id}>{item.name}</li>)}
    </>
  );
}
```

```text
One root or <></>          className (not class)       htmlFor (not for)
{} = expressions only      self-close `<br />`         style={{ color: "red" }}
props: read-only, down     children: the nested JSX    key: stable id per list item
```

---

## 10 · Quick self-check

1. What does a component return, in one sentence?
2. `<Card title="Bio">stuff</Card>` — what does `stuff` arrive as, and where is it rendered?
3. What's wrong with `<p>{if (on) "on"}</p>`, and the fix?
4. Why `className`, not `class` — and can Tailwind classes be copied from Day 6's HTML?
5. Are props editable inside the component? What's the "derive, don't mutate" version?
6. What is `<Button variant="danger">` actually doing to the `Button` function?
7. What's `key` for in a `.map` render?
8. Day 4 spent 14 lines appending a card to the DOM. What's the whole recipe in React?

> Answers: (1) JSX — a value-like description of what the screen should look like, which React turns into DOM. (2) As `props.children`, rendered wherever the component renders `{children}`. (3) `if` is a statement, and `{}` needs an *expression* — use a ternary `{on ? "on" : "off"}`. (4) JSX outputs DOM with `className` under the hood; `class` is silently ignored. Yes — Tailwind classes copy over verbatim. (5) No — read-only, one-way downward; compute a new value (`.map`, spread, `.toUpperCase()`) instead of editing the prop. (6) Calls `Button({ variant: "danger", children: "…" })` — attributes become the props object. (7) A stable identity so React can match old/new items and only touch the ones that changed. (8) One line: `{posts.map((p) => <PostCard key={p.id} post={p} />)}` — data in, UI described, React handles the DOM.

**Tomorrow — Day 8:** State & events. Today's components were still "frozen": what goes in, comes out —
no button press changes the page. Tomorrow `useState` makes a component hold + update its own data: the
to-do list you'll build is that idea, full throttle.
