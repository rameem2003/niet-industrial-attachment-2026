# Day 6 — Tailwind CSS + Mini Static Project

**Session length:** ~2.5–3 hours
**Goal of today:** Stop writing (most) CSS and start writing *classes*. Tailwind is utility-first CSS: the stylesheet you get for free, so every page from Day 6 to the capstone styles faster and stays consistent — and today's project is your **first graded mini-project**, pushed to GitHub with the Day 5 workflow.

> **What changed since Day 5.** Git gave you branches, commits, and pull requests. Today's build goes through
> that loop: `feature/` branch → small commits → push → PR → merge. And from today, Tailwind is the styling
> for everything: Day 10's fetch page, the React days (same classes, inside `className`), the capstone.
>
> **How this connects to React (Day 7).** React components still look almost exactly like this — but the
> markup lives in JSX and the class attribute is spelled `className`. Learn the utilities today and every
> React screen later is "same classes, different container."
>
> This project lands in the **weekly mini-project grade** (Days 6, 14, 24, 30 = 40% of the course).

---

## 1 · The one idea — utility-first CSS

| Traditional CSS | Tailwind |
| --- | --- |
| Write a class in `styles.css`, name it, scroll back to HTML | Put the styles directly on the element as classes |
| Naming tax: `.user-card-header-title` | No names to invent |
| Unused CSS piles up | Each utility exists once, reused everywhere |
| Your vocabulary: inventing names | Your vocabulary: reading styles off the tag |

```html
<!-- ❌ Day 1 style: two places to look -->
<p class="card-meta">Front-end student</p>
<!-- .card-meta { font-size: 0.75rem; color: #64748b; } ...and 200 more rules in styles.css -->

<!-- ✅ Tailwind: one place -->
<p class="text-xs text-slate-500">Front-end student</p>
```

`text-xs` = font-size utility, `text-slate-500` = color utility, `p-4` = padding utility, `flex` = display
utility. Every utility does ONE job; classes compose into a design.

---

## 2 · Setup with Vite (10 minutes)

```bash
npm create vite@latest tailwind-landing -- --template vanilla
cd tailwind-landing
npm install
npm install tailwindcss @tailwindcss/vite
npm run dev        # dev server on http://localhost:5173
```

Wire the plugin into `vite.config.js`:

```js
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

And replace the contents of `src/style.css` with:

```css
@import "tailwindcss";
```

That's it. `text-sm` works the moment it's typed — no build dance, no purge config.

> 📦 **Older tutorials (Tailwind v3)** use `tailwind.config.js` + `@tailwind` directives + PostCSS and
> `npm install -D tailwindcss@3 postcss autoprefixer`. We're on **v4 (CSS-first)**: the import above is the
> whole "config". If a tutorial demands `tailwind.config.js`, either follow its v3 install or translate:
> the utility *classes* are identical across versions.

---

## 3 · The utilities you will reach for every day

**Spacing / sizing** — the number scale is `× 0.25rem` (4 = 1rem, 8 = 2rem... paddings, margins, gaps, widths all share it):

| Class | Means | Class | Means |
| --- | --- | --- | --- |
| `p-4` / `px-4` / `py-2` / `pt-3` | padding (all / left-right / top-bottom / top) | `mt-4`, `mx-auto` | margin-top; center a block |
| `gap-4`, `gap-x-2` | flex/grid spacing between items | `w-full`, `max-w-md`, `w-12 h-12` | width / max-width / fixed square |

**Typography:**

| Class | Means |
| --- | --- |
| `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` `.text-4xl` | font sizes (~0.875rem → 2.25rem) |
| `font-medium` `font-semibold` `font-bold` | weights |
| `text-slate-500` `text-white` | text color |
| `leading-relaxed` | line-height |
| `text-center` | alignment |

**Color** — most colors come in 50→950 shades (`sky-50` pale … `sky-950` darkest); `bg-*` for backgrounds,
`text-*` for text, `border-*`, `ring-*`. Common picks for a card-based UI:

```text
slate  → neutral grays (bg-slate-100 page, bg-slate-800 dark surfaces)
sky    → primary (bg-sky-600 buttons, ring-sky-500 focus)
green / rose → success / danger (badges)
```

**Layout:**

```html
<div class="flex items-center justify-between gap-4">…</div>       <!-- toolbar row -->
<div class="grid grid-cols-3 gap-6">…</div>                        <!-- 3 columns of cards -->
<div class="grid place-items-center min-h-screen px-4">…</div>     <!-- centered page shell -->
```

**Decoration:** `rounded-lg` / `rounded-2xl` / `rounded-full`, `border`, `border-slate-300`,
`shadow-sm`/`shadow-md`/`shadow-lg`, `ring-4 ring-sky-500` (focus rings / avatar trim),
`transition`, `duration-200`.

---

## 4 · The Day 1 profile card, rebuilt in Tailwind

One file, zero CSS of your own:

```html
<!doctype html>
<html lang="en">
<body class="bg-slate-100 dark:bg-slate-900 min-h-screen grid place-items-center px-4">
  <article class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
    <img class="w-24 h-24 rounded-full mx-auto ring-4 ring-sky-500"
         src="https://i.pravatar.cc/150?img=12" alt="Samira's photo" />

    <h1 class="mt-4 text-2xl font-bold text-slate-800 dark:text-white">Samira Haque</h1>
    <p class="text-sm text-slate-500 dark:text-slate-400">Front-end student · Dhaka</p>

    <div class="mt-5 flex justify-center gap-3">
      <button class="px-4 py-2 rounded-lg bg-sky-600 text-white font-medium
                     hover:bg-sky-700 transition">Follow</button>
      <button class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                     text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition">Message</button>
    </div>
  </article>
</body>
</html>
```

Read the card out loud: white surface (`bg-white`), big soft corners (`rounded-2xl`), a shadow (`shadow-lg`),
padding (`p-6`), fixed width (`max-w-sm w-full`), centered text. Every decision is on the tag.

---

## 5 · Responsive: `sm:` `md:` `lg:` — mobile-first

**No prefix = phone.** Add a prefix to change at bigger widths:

```html
<div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:p-12">…</div>
```

| Prefix | Fires at | Device vibe |
| --- | --- | --- |
| (none) | always | phone — the baseline |
| `sm:` | ≥ 640px | large phone |
| `md:` | ≥ 768px | tablet |
| `lg:` | ≥ 1024px | laptop |
| `xl:` | ≥ 1280px | desktop |

The classic product grid: stacked on a phone, three columns on a laptop:

```html
<section class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">…</section>
```

Design phone-first, then *allow* more at each breakpoint. Building desktop-first and "fixing" phones later
is always the harder way around.

---

## 6 · State variants: `hover:` `focus:` `dark:`

```html
<button class="bg-sky-600 hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 px-4 py-2">
  Follow
</button>
```

`hover:bg-sky-700` only applies on hover; `focus:ring-2` shows a keyboard-focus ring (real accessibility).

**Dark mode** — `dark:` classes respond to a `dark` class on `<html>`. In v4, declare the class strategy
once in `src/style.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Then a tiny toggle:

```js
const toggle = document.querySelector("#dark-toggle");
toggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  // bonus: remember the choice across reloads
  const dark = document.documentElement.classList.contains("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
});

// on load:
// document.documentElement.classList.toggle("dark", localStorage.getItem("theme") === "dark");
```

Then every surface gets a dark twin: `bg-white dark:bg-slate-800`, `text-slate-800 dark:text-white`,
`border-slate-300 dark:border-slate-600`, button `hover:bg-slate-50 dark:hover:bg-slate-700`.

---

## 7 · Reuse without `@apply` — components first

Before reaching for CSS-grouping tools, extract **HTML**: a card that repeats is a `card` block you copy
(or, from Day 7, a React component where the classes live once). `@apply` exists for the rare moments a
class-set becomes genuinely unwieldy:

```css
/* @apply (optional) — group utilities into your own semantic class */
.btn-primary {
  @apply bg-sky-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-sky-700 transition;
}
```

Rule for this course: `@apply` only for repeated button/label/badge patterns — helpers, not stylesheets.

---

## 8 · Project — Landing Page (graded)

**Time:** 60–90 min · **Deliverable:** public GitHub repo `tailwind-landing`, merged via PR, with README.

Brief — all Tailwind, near-zero custom CSS:

1. **Profile card** (from § 4) as the first component.
2. **Nav bar** — logo or name left, 3–4 links right, collapses to a stacked column on mobile
   (`flex-col sm:flex-row`).
3. **Hero** — big heading (`text-4xl md:text-5xl font-bold`), sub-line, primary CTA button, light
   background block.
4. **Features / cards section** — `.map`-style row of 3–6 cards in
   `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; icon-ish emoji ok; hover lift (`hover:shadow-md`).
5. **Dark-mode toggle** in the nav (§ 6) — *every* section readable in both themes.
6. **Footer** with your name + GitHub link.

Workflow (Day 5 skills on purpose):

```bash
git switch -c feature/landing        # build section by section
git add . && git commit -m "Add hero section"
git commit -m "Add feature cards grid"
git push -u origin feature/landing   # → open PR → self-review → merge
git switch main && git pull && git branch -d feature/landing
```

**Self-review before merge:** phone width ok at 360px? dark mode complete (no white on dark)? keyboard
focus visible (`focus:ring`)? text contrast on both themes? README with screenshot + classes you're proud of?

---

## 9 · Cheat sheet

```text
Layout      flex, grid, grid-cols-3, gap-4, items-center, justify-between, place-items-center
Spacing     p-4, px-4, py-2, mt-4, mb-2, mx-auto, w-full, max-w-md, min-h-screen
Type        text-sm/lg/xl, font-bold, text-slate-500, text-center, leading-relaxed
Color       bg-sky-600, bg-white, text-white, border-slate-300
Shape       rounded-lg, rounded-2xl, rounded-full, border, shadow-md, transition
Responsive  sm: md: lg: xl:  (no prefix = phone; prefixes are min-width)
States      hover:bg-…, focus:ring-2, dark:bg-…
Dark v4     @custom-variant dark (&:where(.dark, .dark *));  + .dark class on <html>
```

---

## 10 · Quick self-check

1. What does each digit mean in `p-4`, `w-64`, `gap-2`?
2. What's the mobile-first rule, in one sentence?
3. Where do you put the styles for "pale on phone, three columns on laptop"?
4. How do you make `dark:` work with a toggle instead of the OS setting?
5. Where's the *one* place styles live with Tailwind — and what replaces `.card-meta` naming?
6. What's `@custom-variant dark` doing, and which repo file/line is it in?
7. Your buttons everywhere: why prefer copied HTML / components over five `@apply` rules?
8. What does this project's PR prove you can do?

> Answers: (1) × 0.25 rem — `p-4` = 1rem, `w-64` = 16rem, `gap-2` = 0.5rem. (2) Write the phone design with no prefix; use `sm:`/`md:`/`lg:` *min-width* prefixes to *change* things as the screen grows. (3) On the element itself, stacked: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. (4) Tell Tailwind the class strategy via `@custom-variant dark (&:where(.dark, .dark *));` then toggle the `dark` class on `<html>`. (5) On the element as utility classes; a repeating `card` becomes a copyable block/component, not a named CSS class. (6) It tells Tailwind v4 that `dark:` should target elements under a `.dark` ancestor instead of only OS preference — in `src/style.css`. (7) Duplication you can see is usually healthier than indirection you have to chase; components make the classes live in exactly one place. (8) Branch → small commits → push → PR → review → merge — the full Day 5 loop on Day 6's product.

**Tomorrow — Day 7:** React. The Tailwind classes stay, the markup moves inside JavaScript as JSX, and
`document.querySelector`-style DOM building from Day 4 is history. Bring this repo — it becomes UI you
almost reuse as-is.
