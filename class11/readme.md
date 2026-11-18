# Day 11 — React Router

**Session length:** ~2.5–3 hours
**Goal of today:** One app, **many URLs**. So far every React screen you built lived on a single page; today `react-router-dom` gives each view its own address — `/`, `/products`, `/products/42`, a 404 — with no reloads. The deliverable: a product-listing idea turned into a **multi-page app** (Home, Products, Product Details, 404).

> **What changed since Day 10.** Effects fetched data for *one screen*. But "which screen" itself was a
> decision hardcoded in one `App` component. Today the **URL** becomes the source of truth for what renders
> — and you already know how to react to changing values (Day 10's dependency arrays); the router is just
> that idea with the address bar.
>
> **How this connects forward.** Day 13–14's product project *is* this practice app with real data and a
> cart. `useParams` returns on Day 20+ (Mongoose `findById` routes), and every blog/capstone route is
> today's shapes.

---

## 1 · The one idea — the URL is state

Two ways the web shows different screens:

| | MPA (multi-page app) | SPA (single-page app) |
| --- | --- | --- |
| Navigation | full page load, new HTML from server | JS swaps the screen **in place** |
| Speed between pages | round-trip every time | instant (no reload) |
| Sharing a link | always works — each page is a URL | only if the **router** maps URLs to screens ← today |
| Server work | for every click | once, then the client drives |

React Router makes an SPA honest: **each screen gets a real URL** — shareable, bookmarkable, and the
browser back button just works. Rule of thumb: the router is *state that lives in the address bar*, and
your components render according to it.

```text
URL: /products/42   →  <Route path="/products/:id">  →  <ProductDetails id="42" />
      (browser)            (router matches)                (your component)
```

---

## 2 · Setup (5 minutes)

```bash
npm create vite@latest product-app -- --template react
cd product-app
npm install react-router-dom
npm run dev
```

Then in `src/main.jsx` — wrap the app so the router can read the URL:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

---

## 3 · Routes, Route, Link, NavLink

The whole router, in `App.jsx`:

```jsx
import { Routes, Route, Link, NavLink } from "react-router-dom";

export default function App() {
  return (
    <>
      <nav className="flex gap-4 p-4 border-b">
        {/* Link = navigation without a page reload */}
        <Link to="/">Home</Link>
        {/* NavLink = Link that knows it's the current page */}
        <NavLink to="/products" className={({ isActive }) => (isActive ? "font-bold" : "")}>
          Products
        </NavLink>
      </nav>

      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="*" element={<NotFound />} />      {/* catch-all → 404 */}
        </Routes>
      </main>
    </>
  );
}
```

| Piece | Job | Notes |
| --- | --- | --- |
| `BrowserRouter` | watches the address bar (wrap in `main.jsx`) | one per app |
| `Routes` | looks at the current URL, picks **one** child | the switchboard |
| `Route` | one URL pattern → one `element` | `:id` = a variable part |
| `Link` | navigate **without reload** | ❌ `<a href>` would full-page reload — the #1 router bug |
| `NavLink` | `Link` + "am I the active page?" | `className`/`style` receive `{ isActive }` |
| `path="*"` | matches everything else | your 404 — last in the list |

Why no `<a href>`: the browser would treat your SPA like an MPA — full reload, lost state, flash. `Link`
stops default (Day 8: `preventDefault` — the router does it for you) and updates React's view of the URL.

---

## 4 · Dynamic params — `useParams`, and `useNavigate`

`:id` is a **hole in the path**; the actual value arrives in the component:

```jsx
import { useParams, Link, useNavigate } from "react-router-dom";

const PRODUCTS = [
  { id: 1, name: "Mechanical keyboard", price: 85 },
  { id: 2, name: "USB-C hub", price: 40 },
  { id: 3, name: "Monitor arm", price: 55 },
];

function ProductDetails() {
  const { id } = useParams();                       // URL string! "/products/2" → id === "2"
  const product = PRODUCTS.find((p) => p.id === Number(id));

  const navigate = useNavigate();

  if (!product) return <p className="text-slate-500">No such product.</p>;

  return (
    <article>
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p>${product.price}</p>
      <button onClick={() => navigate("/products")} className="btn">Back to products</button>
      <button onClick={() => navigate(-1)} className="btn">Go back</button>
    </article>
  );
}
```

| Tool | Reads/writes | Everyday use |
| --- | --- | --- |
| `useParams()` | current URL values (`:id`, `:slug`, …) | fetch the one item |
| `useNavigate()` | change the URL from code | after submit, after login, "go back" |
| `navigate(-1)` | history back | escape hatch for flows |

Two habits:

- **`params` are always strings** — `Number(id)` before comparing against numeric data (Day 20 repeats this with real APIs).
- Validate: a URL is **user input** — `/products/999` must render "not found", never crash (`.find` → `undefined` → your empty/error state from Day 8 § 4).

---

## 5 · Nested routes + `Outlet` — one layout, many pages

Nav, footer, sidebar — stuff every page shares. Define a layout route once:

```jsx
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <nav className="flex gap-4 p-4 border-b">…links…</nav>
      <main className="p-4">
        <Outlet />          {/* ← the matched CHILD route renders here */}
      </main>
    </>
  );
}

<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />                 {/* "/" exactly */}
    <Route path="products" element={<Products />} />    {/* "/products" */}
    <Route path="products/:id" element={<ProductDetails />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

`Outlet` = "the child route's element goes here" — the React version of Day 9's `children` prop, matched
by URL instead of nesting in JSX. Pages no longer each import the nav; the layout owns it.

---

## 6 · Practice — the Product multi-page app

**Time:** 75–90 min · **Deliverable:** `product-app` repo — Home, Products, Product Details, 404 — via PR.

```bash
npm install react-router-dom   # in your Day 7/10-style Vite app
git switch -c feature/routes
```

### Task A — routes + layout (25 min)

1. `BrowserRouter` in `main.jsx`; `Layout` with `Outlet` (§ 5) holding the nav.
2. Four routes: `/` Home, `/products`, `/products/:id`, `*` → `NotFound`.
3. Home = a hero (Day 6 classes) with a `Link` to `/products`. NavLink gets `font-bold` when active.

### Task B — products list → details (30 min)

1. `PRODUCTS` array (6 items: `id, name, price, category, emoji`).
2. `/products` renders cards **in a grid with `Link`** to `/products/${p.id}` (Day 8's `.map` + `key`).
3. `/products/:id` reads `useParams`, **`Number(id)`s it**, finds the product; no match → friendly
   "Product not found" + a `Link` back (this is your 404-but-inside-a-real-page case).

### Task C — 404 + programmatic nav (20 min)

1. Type `/nope` in the address bar → the `*` route renders a styled NotFound with a link home.
2. On Product Details, a "Back to products" button via `useNavigate` — plus `navigate(-1)` and note the
   difference (explicit destination vs history back).
3. Stretch: `/products?category=keyboard` — read the query with `useSearchParams` and filter the grid.

```bash
git add . && git commit -m "Routes, layout with Outlet, and NavLink"
git commit -m "Products list and dynamic detail page"
git commit -m "Catch-all 404 and programmatic navigation"
git push -u origin feature/routes   # → PR → self-review → merge
```

---

## 7 · Cheat sheet

```jsx
// main.jsx
<BrowserRouter><App /></BrowserRouter>

// App.jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />                 {/* "/" exactly */}
    <Route path="products" element={<Products />} />
    <Route path="products/:id" element={<Details />} />
    <Route path="*" element={<NotFound />} />          {/* 404 catch-all */}
  </Route>
</Routes>

// navigation
<Link to="/products">Products</Link>
<NavLink className={({ isActive }) => (isActive ? "font-bold" : "")} … />

// inside a component
const { id } = useParams();          // STRING — Number(id) before comparing
const navigate = useNavigate();
navigate("/products"); navigate(-1);

// layout
<Outlet />                            // child route renders here
```

---

## 8 · Quick self-check

1. SPA vs MPA — the one-sentence difference?
2. What does the router make the URL into, conceptually?
3. Why `Link`, not `<a href>`?
4. What does `NavLink` give you that `Link` doesn't?
5. What is `:id` in a `path`, and where do you read it?
6. `useParams()` returns `"2"` — what type trap lives here, and the fix?
7. `/products/999` with no such product — which Day 8 lesson saves you?
8. What renders for a URL nobody defined, and how is that route written?
9. `useNavigate` vs `Link` — when do you need the hook?
10. `navigate(-1)` vs `navigate("/products")` — what's each doing?
11. What is `Outlet`, and which Day 9 concept is it a router version of?
12. Where does `BrowserRouter` go, and why there?

> Answers: (1) MPA: every click is a full page load from the server; SPA: one load, then JS swaps screens in place. (2) The router turns the URL into app state — screens render according to it. (3) `<a href>` triggers a full browser reload (MPA behavior) losing your app's state; `Link` updates the view in place. (4) Active-page awareness — `className`/`style` callbacks receive `isActive` for styling the current tab. (5) A dynamic segment — a variable part of the path — read via `useParams()` in the matched component. (6) Params are always strings; `Number(id)` (or `===`) before comparing to numeric data. (7) The empty/error state discipline: `.find` may return `undefined` → render "not found," never crash. (8) The catch-all: `<Route path="*" element={<NotFound />} />`, placed last. (9) When navigation happens from *code* — after a submit, after login, or a "back" button. (10) `-1` = one step back in browser history; an explicit path = a decided destination regardless of history. (11) The placeholder where the matched child route renders — the router-flavored version of Day 9's `children` prop. (12) In `main.jsx`, wrapping the whole app — it provides URL context to everything, exactly once.

**Tomorrow — Day 12:** Context API & custom hooks. Today's `Layout` renders every page — imagine passing
`user` or cart items down into each of them. Tomorrow: a shared **broadcast channel** (`createContext`,
`useContext`) and your first custom hooks (`useLocalStorage`, `useFetch`) — the cart on Day 14 will hang
off this.
