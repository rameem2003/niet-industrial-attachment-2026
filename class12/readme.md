# Day 12 — Context API & Custom Hooks

**Session length:** ~2.5–3 hours
**Goal of today:** Two tools every React app beyond one screen needs. **Context**: a shared broadcast channel so any component can read the same data — no passing `theme` through five layers. **Custom hooks**: wrapping your own `useState`+`useEffect` patterns into functions you can reuse — `useLocalStorage`, `useFetch`. The deliverable: a **global theme (light/dark) context** and a **shopping-cart context** usable from any component.

> **What changed since Day 11.** Yesterday's `Layout` renders every page — which makes it exactly the kind
> of component you'd be tempted to *drill* data through: `Layout → Products → ProductCard → PriceTag`.
> Today that stops: state goes into a **Provider** once, components **consume** it where they need it.
> Callbacks-up-from-children (Day 9) still exist — but only between the components that actually talk.
>
> **How this connects forward.** Day 14's cart is today's cart with persistence; Day 28's `AuthContext`
> (login state) is today's pattern with a token inside; `useFetch` is Day 10's effect pattern, bottled.

---

## 1 · The one idea — Context is a broadcast channel

Prop drilling, the problem:

```text
App (theme state)
 └─ Layout (theme)
     └─ Products (theme)        ← doesn't care about theme!
         └─ ProductCard (theme) ← doesn't care!
             └─ PriceTag        ← actually uses it, 4 layers down
```

Four components held a prop just to pass it along — each one now re-renders and re-names a prop nobody
reads. Context deletes the middlemen:

```text
ThemeProvider (owns the state + provides it)
      ║ (any descendant, any depth)
      ├── Layout        — reads theme only if it wants
      └── PriceTag      — useContext(ThemeContext) → reads + updates directly
```

| Channel | Best for |
| --- | --- |
| props / callback props | parent ↔ child, data that changes often (Day 9 — still the default) |
| **Context** | "global-ish" values used in many unrelated places: theme, auth user, cart, language |
| Redux/Zustand | same idea, more tooling for very large apps (see § 5) |

Rule of thumb: **context is not a state replacement** — it's a delivery mechanism. The `useState` lives in
a provider; context just gives every component a direct wire to it.

---

## 2 · `createContext`, `Provider`, `useContext` — a working theme

```jsx
import { createContext, useContext, useState } from "react";

// 1. the channel (any name — by convention *Context)
const ThemeContext = createContext(null);

// 2. the provider — owns the state, hands it to descendants
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. the consumer hook — read it anywhere below the provider
export function useTheme() {
  return useContext(ThemeContext);
}
```

Usage — provider wraps the app once, consumers read wherever:

```jsx
// main.jsx
<ThemeProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ThemeProvider>

// any component, any depth
const { theme, toggleTheme } = useTheme();

<button onClick={toggleTheme}>
  {theme === "light" ? "🌙 dark" : "☀️ light"}
</button>
```

Three things to notice:

- `value` can be **anything** — here an object with state *and* an updater (Day 9: state down, events up,
  same verbs, new transport).
- Every component inside `ThemeProvider` can `useTheme()` — no props crossed between them.
- Changing `theme` re-renders the provider's subtree (that's the broadcast) — so keep context values for
  *meaningful, shared* state, not for per-keystroke inputs.

---

## 3 · The "correct" context pattern (worth copying forever)

Two conventions that prevent the classic bugs:

```jsx
// 1. always a custom hook with a guard — misused context fails LOUDLY, not confusingly
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>"); // instant diagnosis
  }
  return ctx;
}

// 2. default value = null, so "outside provider" is detectable (see the throw above)
const ThemeContext = createContext(null);
```

Without the guard, `useContext` silently returns the default (`null`) and the bug surfaces later as
"cannot read `theme` of null" — three screens away from the real cause.

Keep **one context per concern**: `ThemeContext`, `CartContext`, `AuthContext` — never one mega-context,
or a cart change re-renders every theme reader.

---

## 4 · Custom hooks — your `useState` patterns, bottled

A **custom hook** is any function starting with `use` that calls other hooks. Rules from Day 8 still apply:
call hooks at the top level, in the same order — custom hooks follow the same law (that's *why* the name
must start with `use`, so linters and humans can check).

### `useLocalStorage` — state that survives reloads

```jsx
import { useEffect, useState } from "react";

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;   // lazy init — read once, on mount
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value)); // Day 10 effect — write on every change
  }, [key, value]);

  return [value, setValue];   // behaves exactly like useState
}
```

Swap-in trivially — the API is useState's:

```jsx
const [theme, setTheme] = useLocalStorage("theme", "light");
// → refresh the page: the theme stays. Day 6's toggle, now a reusable hook.
```

### `useFetch` — Day 10's three states, reusable

```jsx
import { useEffect, useState } from "react";

export function useFetch(url) {
  const [state, setState] = useState("loading"); // loading | success | error
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;                          // Day 10 § 6 — no out-of-order paints
    setState("loading");

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!ignore) {
          setData(json);
          setState("success");
        }
      })
      .catch(() => {
        if (!ignore) setState("error");
      });

    return () => { ignore = true; };
  }, [url]);

  return { state, data };
}

// one line per data screen, forever after:
const { state, data } = useFetch("https://jsonplaceholder.typicode.com/posts");
```

**The rule of hooks, satisfied by design:** `useFetch` calls `useState`/`useEffect` unconditionally at the
top — components calling it inherit the discipline automatically. That's the whole value of custom hooks:
*enforce your patterns by making them one call.*

---

## 5 · Context vs props vs a state library

| Situation | Reach for |
| --- | --- |
| One component owns it | `useState` (Day 8) |
| Two neighbors need it | lift to the common parent (Day 9) |
| Many unrelated components, rarely changes | **Context** (today) |
| Many components, changes *constantly*, or app is huge | a store library |

Brief tour, zero fear: **Zustand** (`create()` store, subscribe per-slice) and **Redux Toolkit** (actions
+ reducers, heavy tooling) solve the same "share widely" problem with more structure — you'll meet them in
job code. For this course: **Context + hooks is enough**; recognize the library patterns on sight.

Two honest warnings to keep in your pocket:

- Context value changes **re-render every consumer** (even if they only read one slice) — the store
  libraries exist partly to slice that.
- Big "god objects" in one context = everything depends on everything. One concern per context (§ 3).

---

## 6 · Practice — Theme + Cart, both global

**Time:** 75–90 min · **Deliverable:** a Vite+React app (with Day 11's router) holding **two contexts and
two custom hooks**, used from *unrelated* components — via PR.

```bash
npm install react-router-dom   # if starting fresh
git switch -c feature/contexts
```

Folder shape (the pattern you'll reuse all course):

```text
src/
  context/ThemeContext.jsx     # provider + useTheme
  context/CartContext.jsx      # provider + useCart
  hooks/useLocalStorage.js
  components/Navbar.jsx        # consumes BOTH contexts
  pages/Home.jsx / Products.jsx
```

### Task A — ThemeContext + `useLocalStorage` (30 min)

1. `useLocalStorage` (§ 4) in `src/hooks/`; wire `ThemeProvider`'s initial value to it —
   refresh keeps the choice.
2. `useTheme` with the outside-provider guard (§ 3). Try `useTheme()` in a component above the provider —
   read your own error message.
3. Toggle button (Navbar) + Day 6's `dark:` classes; add/remove the `dark` class via a tiny effect in
   `ThemeProvider` (Day 10 cleanup optional).

### Task B — CartContext (35 min)

1. State: `items` (array of `{ id, name, price, qty }`) — provided through context; **updaters
   `add`, `remove`, `setQty`** built with the Day 8 shapes (spread-add, filter-delete, map-update).
2. Derived values in the provider (Day 8: compute, don't store): `count` and `total` handed out via the
   same context.
3. Add-to-cart buttons on the Products page (Day 11's app is the natural home — `Link` to `/products` from
   the cart page).

### Task C — prove no drilling (25 min)

1. `Navbar` shows: theme toggle **and** a cart badge (`count` from `useCart`) — two unrelated components
   (Home, Products) touching the same cart via `add`, no props between them.
2. `/cart` route (Day 11) lists items with `remove` + qty `− / +` buttons and the derived `total`.
3. Stretch: persist the whole cart with `useLocalStorage` instead of plain `useState` — one-line swap,
   the hook earns its name.

```bash
git add . && git commit -m "useLocalStorage hook"
git commit -m "ThemeContext with guard"
git commit -m "CartContext with derived total"
git commit -m "Navbar + cart page consuming both contexts"
git push -u origin feature/contexts   # → PR → self-review → merge
```

---

## 7 · Cheat sheet

```jsx
// context, one concern per file
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

// custom hook = function named use* that calls hooks at its top level
export function useLocalStorage(key, initial) { /* lazy useState + Day 10 effect */ }
export function useFetch(url) { /* loading/success/error + ignore-guard */ }

// usage anywhere below the provider
const { theme, toggleTheme } = useTheme();
const { items, add, remove, setQty, total, count } = useCart();
```

---

## 8 · Quick self-check

1. What problem does Context solve, in one sentence?
2. The three pieces — which function creates the channel, which shares, which reads?
3. What can `value` be, and what did today's providers put inside it?
4. Why does a custom hook guard (`throw` when context is `null`) exist?
5. Custom hooks: the two naming/law constraints, and what law they enforce?
6. `useLocalStorage`'s lazy `useState(() => …)` — why a function, not a value?
7. `useFetch(url)` — which day's pattern does it bottle, and which extra guard does it include?
8. One context per *concern* — what breaks with one mega-context?
9. Context re-renders — when, and which library solves the slicing problem?
10. Props vs Context — which is still the default for parent ↔ child, and when does context win?
11. In the cart, `count`/`total` — stored in state or computed, and where do they live?
12. Zustand/Redux — do you need them now? What's the one-sentence reason they exist?

> Answers: (1) Deep prop drilling — data reaching many unrelated components without crossing every layer as props. (2) `createContext` makes the channel; `Provider` shares it to descendants; `useContext` reads it. (3) Anything — today: an object holding state (`theme`, `items`) and updater callbacks. (4) `useContext` outside a provider silently returns the default — the guard turns a faraway `undefined` bug into an instant, named error. (5) Name starts with `use`; hooks called at its top level, same order — they must obey the rules of hooks so linters (and callers) can check them. (6) Lazy initializer — the function runs once on mount (avoids re-reading `localStorage` every render and avoids `JSON.parse` cost). (7) Day 10's loading/success/error effect pattern — plus the `ignore` flag against out-of-order responses. (8) Every value change re-renders all consumers of that one context — cart clicks re-render theme readers, and unrelated state couples together. (9) On any provider `value` change — all consumers re-render; Zustand/Redux allow per-slice subscriptions to avoid it. (10) Props stay the default for direct parent↔child (data that changes often); context wins for widely-shared, app-level values (theme, auth, cart). (11) Computed — derived from `items` in the provider and handed out via the context value; storing them as state would create two sources of truth. (12) Not yet — same "share widely" problem, solved with more structure (per-slice stores) for very large apps; recognize them, Context+hooks covers this course.

**Tomorrow — Day 13:** React Mini Project I — the **Product Listing UI**. Today's contexts (theme + cart)
and yesterday's routes become a real mini-project: product cards, search, category filter — with dummy
JSON playing the role of the API until Day 16 brings a real backend.
