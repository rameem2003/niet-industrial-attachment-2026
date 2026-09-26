# Day 1 — HTML & CSS Refresher

**Session length:** ~2.5–3 hours
**Goal of the whole course:** Design, build and deploy a **single-page website using Tailwind CSS**.
**Goal of today:** Learn the two languages Tailwind writes for you — the structure (HTML) and the design rules (CSS) — by hand.

> **Why Day 1 exists in a Tailwind course**
> Tailwind is not "CSS that makes HTML look good". Tailwind is a **utility generator**. You still decide the
> *structure* (HTML) and you still make every *design decision* (spacing, colour, type scale, breakpoints).
> Tailwind only removes the part where you hand-write the rules.
> So this session is not throwaway theory — it is the decision-making layer. Learn it properly and Day 6 is easy.

---

## Session Plan

| Time | Block | Outcome |
| --- | --- | --- |
| 00:00–00:15 | Why HTML/CSS still matters; how Tailwind fits | Mental model set |
| 00:15–00:50 | HTML: skeleton, semantics, structure of a one-page site | `index.html` skeleton |
| 00:50–01:15 | HTML: forms, inputs, labels, validation | Contact form markup |
| 01:15–01:20 | Break | |
| 01:20–01:50 | CSS: cascade, specificity, box model, units | Understand any stylesheet |
| 01:50–02:15 | CSS: selectors, pseudo-classes, pseudo-elements | Precise targeting |
| 02:15–02:45 | CSS: Flexbox and Grid | Layout engines |
| 02:45–03:00 | CSS: positioning and `z-index` | Overlap, sticky nav |
| 03:00–03:20 | CSS: responsive design, mobile-first, media queries | One page, four widths |
| 03:20–03:40 | Bridge: plain CSS → Tailwind utility mapping | Read Tailwind docs like a sentence |
| 03:40–04:00 | Lab: build the one-page site in plain CSS | Working page, ready for Day 6 |

---

# Part 1 — The HTML Document

## 1.1 The minimum valid document

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Name — Portfolio</title>
  </head>
  <body>
    <h1>Hello, world.</h1>
  </body>
</html>
```

Line by line:

- `<!DOCTYPE html>` — tells the browser "use modern HTML5 rules", not quirks mode. Always the very first line.
- `lang="en"` — language of the content. Affects screen readers, font rendering, and browser translation prompts.
- `charset="UTF-8"` — character encoding. Without it, non-ASCII characters (smart quotes, `—`, emoji) may break. Goes first in `<head>`.
- `name="viewport"` — the single most important mobile tag. It sets the **layout viewport width** to the device width. Without it, a phone pretends to be ~980px wide and zooms out. This is the tag that makes `responsive: true` work in your HTML.
- `<title>` — required. It is the browser tab text, the bookmark name, and the first line of your Google search result.

## 1.2 The three layers

```text
HTML  →  what it is          (a heading, a list, a form, a button)
CSS   →  how it looks        (size, colour, spacing, position)
JS    →  how it behaves      (added on Day 2 onwards)
```

Keep them separate. If you find yourself writing `style="..."` attributes or `<br>` used for spacing, you have
leaked CSS or HTML concerns into the wrong layer.

---

# Part 2 — Semantic Structure

## 2.1 Generic vs semantic tags

```html
<div class="header">      → <header>
<div class="nav">         → <nav>
<div class="main">        → <main>
<div class="content">     → <article> / <section>
<div class="side">        → <aside>
<div class="footer">      → <footer>
```

Semantic tags give you three things for free:

1. **Structure** — you (and any developer) can read the outline without class names.
2. **Accessibility** — screen readers can jump between landmarks. `Ctrl+Alt+Arrow` in NVDA, the rotor in VoiceOver.
3. **Default styling** — a browser gives sensible default margins to `h1`–`h6`, `p`, `ul` that you can override.

## 2.2 The landmark tags

| Tag | What it means | Rule |
| --- | --- | --- |
| `<header>` | Introductory content for its nearest `section` | One page-level banner at the top |
| `<nav>` | Major navigation links | Every `<nav>` should be named |
| `<main>` | The unique content of the page | **Exactly one per page** |
| `<article>` | A self-contained, independently distributable piece | A blog post, a product card |
| `<section>` | A thematic grouping with a heading | Should have a heading inside |
| `<aside>` | Tangentially related content | Sidebar, pull-quote |
| `<footer>` | Info about the author/section | Page-level footer at the bottom |

`<section>` vs `<article>`: if you could paste it into a feed on its own and it still makes sense, it is an
`<article>`. If it is only meaningful as part of the page, it is a `<section>`.

## 2.3 Text content and hierarchy

```html
<h1>Samira Okonkwo</h1>
<h2>About</h2>
<p>I build things for the web.</p>
<h2>Projects</h2>
<h3>Weather App</h3>
```

Heading rules:

- **Exactly one `<h1>` per page** — the page's subject.
- Never skip a level (`h2` → `h4` breaks the outline for screen readers).
- Headings are not "big text". `<h1 style="font-size:12px">` is a wrong heading, not a small heading. Use CSS to restyle, HTML to rank.
- `<strong>` = importance, `<em>` = stress. Both are semantic. `<b>`/`<i>` are styling-only. Use the semantic pair by default.

Lists:

```html
<ul>
  <li>HTML &amp; CSS</li>
  <li>JavaScript</li>
</ul>

<ol start="4">
  <li>Fourth item</li>
</ol>
```

Use `<dl>` when the content is term/definition pairs:

```html
<dl>
  <dt>API</dt><dd>An interface for software to talk to software.</dd>
  <dt>SSR</dt><dd>Server-Side Rendering — HTML built on the server per request.</dd>
</dl>
```

## 2.4 The structure of our one-page site

This is the HTML skeleton we will style today and rebuild in Tailwind on Day 6. Build it exactly like this.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Portfolio of Samira Okonkwo, front-end developer." />
    <title>Samira Okonkwo — Front-End Developer</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>

    <header>
      <nav aria-label="Main">
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>

    <main id="main">
      <section class="hero">
        <h1>Samira Okonkwo</h1>
        <p>Front-end developer building fast, accessible interfaces.</p>
        <a href="#projects">See my work</a>
      </section>

      <section id="about">
        <h2>About</h2>
        <p>Three years of building things for the web...</p>
      </section>

      <section id="skills">
        <h2>Skills</h2>
        <ul>
          <li>HTML &amp; CSS</li>
          <li>JavaScript</li>
          <li>React</li>
        </ul>
      </section>

      <section id="projects">
        <h2>Projects</h2>
        <article>
          <h3>Weather App</h3>
          <p>Forecast dashboard with a five-day outlook.</p>
        </article>
        <article>
          <h3>Bike Repair Log</h3>
          <p>Offline-first tracker for maintenance intervals.</p>
        </article>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <form action="/submit" method="post">
          <div>
            <label for="name">Your name</label>
            <input type="text" id="name" name="name" autocomplete="name" required />
          </div>
          <div>
            <label for="email">Email</label>
            <input type="email" id="email" name="email" autocomplete="email" required />
          </div>
          <div>
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit">Send message</button>
        </form>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Samira Okonkwo</p>
    </footer>
  </body>
</html>
```

### What to notice in that skeleton

- **One page, four sections, in order.** "Single-page site" means navigation uses **fragment links** (`#about`,
  `#skills`) — the page does not change, the scroll position does. No new HTML files. This is why it is called
  single-page.
- **The skip link.** The very first focusable element, normally invisible, that lets a keyboard user jump past the
  nav. It is a one-line piece of markup that sets you apart from most sites.
- **`aria-label="Main"` on `<nav>`.** Two `<nav>` elements on one page become ambiguous. `aria-label` names them.
- **`class` is for JavaScript and Tailwind, not for styling.**** In hand-written CSS you would style `#about` or
  `.hero` here. On Day 6 these classes become utility strings. Either way, keep the HTML free of presentation.
- **The form is real.** `action` and `method` are filled in — it works before any JavaScript exists.

---

# Part 3 — Forms

## 3.1 Anatomy of a good field

```html
<div class="field">
  <label for="email">Email</label>
  <input type="email" id="email" name="email" autocomplete="email" required />
  <p class="hint">I will never share this.</p>
  <p class="error" role="alert"></p>
</div>
```

- **`<label for>` must match the input's `id`.** `for` links them. Clicking the label focuses the field, and screen
  readers announce the label when the field is focused. This is the single most common form accessibility failure.
- **`name` is what gets sent to the server.** `id` is for the label and DOM lookup. A field with no `name` submits nothing.
- **`id` must be unique on the page.** A duplicate `id` breaks the label association and JavaScript lookups.
- **The hint text should be linked with `aria-describedby`** when it is real help, not decoration:

```html
<input type="email" id="email" name="email" aria-describedby="email-hint" />
<p id="email-hint">I will never share this.</p>
```

## 3.2 Input types

| Type | Keyboard on mobile | Validation | Use for |
| --- | --- | --- | --- |
| `text` | default | none | names, usernames |
| `email` | `@` key, email layout | must look like an email | email addresses |
| `password` | masked | none built in | passwords (validate in JS) |
| `number` | numeric keypad | numeric | quantities, ages |
| `tel` | phone keypad | none | phone numbers |
| `url` | `.com` key | must be a URL | links |
| `search` | search key, clear button | none | search boxes |
| `date` | date picker | valid date | dates |
| `color` | colour wheel | hex value | colour pickers |
| `checkbox` | — | — | multiple options / booleans |
| `radio` | — | — | exactly one from a group |
| `hidden` | — | — | values you set from JS |
| `file` | opens picker | — | uploads |

**Rule of thumb:** if a dedicated type exists, use it. You get the right mobile keyboard and free validation for free.

## 3.3 Native validation attributes

```html
<input type="text" name="username" required minlength="3" maxlength="20" pattern="[A-Za-z0-9_]+" />
<input type="email" name="email" required />
<input type="number" name="years" min="0" max="70" step="1" />
```

| Attribute | Applies to | Effect |
| --- | --- | --- |
| `required` | any | Cannot submit empty |
| `minlength` / `maxlength` | text-ish | Character count limits |
| `pattern` | text | Regex the whole value must match |
| `min` / `max` | number, date | Range |
| `step` | number, time | Allowed increments |

`pattern` uses **JavaScript regex syntax, wrapped in slashes automatically** — so write `[A-Za-z0-9_]+`, not `/[A-Za-z0-9_]+/`.

## 3.4 Checkboxes and radios

```html
<fieldset>
  <legend>Availability</legend>

  <input type="radio" id="fulltime" name="availability" value="fulltime" checked />
  <label for="fulltime">Full time</label>

  <input type="radio" id="parttime" name="availability" value="parttime" />
  <label for="parttime">Part time</label>
</fieldset>

<fieldset>
  <legend>Skills</legend>

  <input type="checkbox" id="html" name="skills" value="html" checked />
  <label for="html">HTML</label>

  <input type="checkbox" id="css" name="skills" value="css" />
  <label for="css">CSS</label>
</fieldset>
```

- **`<fieldset>` groups related controls; `<legend>` names the group.** Radios sharing one `name` are mutually exclusive
  automatically — you never write that logic yourself.
- A radio/checkbox **must** share a `name` with its siblings. `id`s must all be unique.
- `checked` sets the default.

## 3.5 Buttons vs links

```html
<button type="submit">Send message</button>
<button type="button" data-action="preview">Preview</button>
<a href="mailto:hello@example.com">Email me</a>
```

- `<button>` **performs an action.** It submits, it opens a menu, it deletes something.
- `<a href>` **navigates somewhere.**
- Never fake a link with `<button onclick="location.href=...">`, and never fake a button with `<a href="#">`.
  `href="#"` also breaks keyboard and screen-reader behaviour and jumps the page to the top.
- `type="button"` on any non-submit button inside a form — otherwise it submits the form by accident.

## 3.6 Accessibility baseline for forms

```html
<form action="/submit" method="post">
  <fieldset>
    <legend>Contact details</legend>

    <div>
      <label for="name">Your name</label>
      <input type="text" id="name" name="name" autocomplete="name" required />
    </div>

    <div>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" autocomplete="email" required />
    </div>
  </fieldset>

  <button type="submit">Send message</button>
</form>
```

You now have: labels linked, groups named, types correct, autocomplete hints present, and keyboard operability
for free. This is the standard to hold yourself to for the rest of the course.

---

# Part 4 — The Cascade, Specificity and the Box Model

## 4.1 Where CSS lives

Three places, in increasing priority:

```html
<!-- 1. External file: the correct place -->
<link rel="stylesheet" href="styles.css" />

<!-- 2. Embedded (rare, small demos only) -->
<style>
  h1 { color: navy; }
</style>

<!-- 3. Inline: last resort, it outranks everything except !important -->
<h1 style="color: navy;">Samira</h1>
```

## 4.2 Anatomy of a rule

```css
.hero {
  padding: 4rem 1.5rem;
  background-color: #0f172a;
}
```

- `.hero` — the **selector** ("what to style")
- `{ }` — the **declaration block**
- `padding: 4rem 1.5rem;` — a **declaration**
- `padding` — the **property** ("what to change")
- `4rem 1.5rem` — the **value**

Read CSS aloud as: "these elements, this property, this value." That habit alone prevents most beginner bugs.

## 4.3 The cascade

When several rules target the same element, the browser resolves them in this order:

1. **Origin and importance** — normal author styles, then `!important`.
2. **Specificity** — how precisely a selector targets the element.
3. **Source order** — the rule written last wins if 1 and 2 tie.

So "last one wins" is only true when specificity is equal. This is why inline styles usually win.

## 4.4 Specificity

Read each selector as a three-digit score: **(inline, ids, classes+attributes+pseudo-classes, elements)**.

| Selector | Score | Notes |
| --- | --- | --- |
| `p` | 0-0-0-1 | weakest |
| `.card` | 0-0-1-0 | |
| `#main` | 0-1-0-0 | ids are expensive |
| `nav ul li` | 0-0-0-3 | more elements = stronger |
| `nav ul li.active` | 0-0-1-1 | |
| `#main .card:hover` | 0-1-1-0 | |
| `style="color:red"` | 1-0-0-0 | inline wins almost everything |
| `p { color: red !important; }` | beats everything except more `!important` | last resort |

**How to win without `!important`:** keep specificity flat. `0-0-1-0` everywhere. Prefer one class over
`.card .title` over `#main .card h2`. If you cannot escape nesting selectors, you have a structural problem, not a
CSS problem.

## 4.5 The box model

**Every element on the page is a box.** This is the single most important mental model in CSS.

```text
     ┌─────────────────────────────────┐  ← border
     │ ┌─────────────────────────────┐ │
     │ │ ┌───────────────────────┐   │ │  ← padding: space INSIDE the border
     │ │ │      content          │   │ │     around the content
     │ │ │  text, images,        │   │ │
     │ │ │  other boxes           │   │ │
     │ │ └───────────────────────┘   │ │
     │ └─────────────────────────────┘ │
     └─────────────────────────────────┘
       ↑ margin: transparent space OUTSIDE the border
```

```css
.box {
  width: 300px;
  padding: 20px;
  border: 2px solid #cbd5e1;
  margin: 16px;
  box-sizing: border-box;
}
```

### `box-sizing: border-box` — memorise this

By default `box-sizing: content-box`, which means `width: 300px` gives you **300px of content only**. Add 20px
padding on each side and the element is now 342px wide. This is why "why is my element bigger than I set?" is the
number one CSS beginner question.

`border-box` makes `width` mean *the whole thing, padding and border included*. Predictable math.

**Put this at the very top of every stylesheet:**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

`*` selects every element. `*::before` and `*::after` matter because pseudo-elements do **not** inherit
`box-sizing` from their parent — this is a classic mystery gap.

## 4.6 Shorthand and the four-value order

```css
/* One value: all sides */
margin: 16px;

/* Two values: top+bottom, left+right */
margin: 16px 24px;

/* Three values: top, left+right, bottom */
padding: 12px 20px 24px;

/* Four values: top, right, bottom, left — clockwise from the top */
margin: 8px 12px 16px 20px;
```

The order is **top → right → bottom → left**, like a clock face. Same convention for `padding`, `border`,
`border-radius`, and `inset`.

Common longhands:

```css
.box {
  margin-top: 8px;
  margin-right: 16px;
  margin-bottom: 24px;
  margin-left: 32px;
}
```

## 4.7 Units

| Unit | Type | Example | Notes |
| --- | --- | --- | --- |
| `px` | absolute | `font-size: 16px` | Fixed. Use for borders and hairlines |
| `rem` | relative to **root** `html` font size | `padding: 2rem` | **Default for spacing and type.** Scales with user settings |
| `em` | relative to **parent** font size | `font-size: 1.5em` | Useful for nested scaling; compounds |
| `%` | relative to parent | `width: 50%` | Widths, heights with a fixed parent |
| `vw` / `vh` | 1% of viewport width/height | `height: 100vh` | `vh` famously jumps on mobile address bars |
| `ch` | width of `0` | `width: 60ch` | Ideal for readable text measure |
| `fr` | fraction (Grid only) | `grid-template-columns: 1fr 2fr` | Fills remaining space |

**Rule for this course:** use `rem` for anything spacing-related and `px` for borders. `rem` respects the user's
browser font-size preference, which is an accessibility requirement. Tailwind's `p-4`, `mt-8`, `text-lg` are all
`rem`-based for exactly this reason.

## 4.8 Colour

```css
.hero {
  color: #0f172a;
  background-color: rgb(248 250 252);
  background-color: hsl(210 40% 98%);
  border: 1px solid currentColor;
}
```

- **Hex** — `#0f172a`. `RRGGBB`, or `#FFF` shorthand.
- **`rgb(r g b)`** — modern syntax, space separated. Legacy: `rgb(15, 23, 42)`.
- **`hsl(h s% l%)`** — hue/saturation/lightness. This is the one to learn for building and adjusting themes,
  because you can change lightness without changing hue.
- **`currentColor`** — inherits the element's own `color`. Makes borders follow text automatically.

### The one accessibility rule for colour

```text
contrast ratio = (lighter colour + 0.05) / (darker colour + 0.05)
```

- **4.5:1** or higher — normal body text (WCAG AA)
- **3:1** or higher — large text (24px+, or 19px bold) and UI borders

Always give *body text* a foreground `color`. Body text defaults to near-black but links do **not** get a colour
automatically — unstyled links are easy to miss. Always style `a`.

---

# Part 5 — Selectors

## 5.1 The selector list

```css
h1,
h2,
h3 {
  line-height: 1.2;
}
```

Comma = "any of these". Note the specificity of the whole list is the **highest** selector in it, not the average.

## 5.2 Combinators

```css
/* Descendant — any depth */
nav a { text-decoration: none; }

/* Child — direct parent only */
nav > ul { display: flex; }

/* Adjacent sibling — the very next element */
h2 + p { margin-top: 0; }

/* General sibling — every following element */
h2 ~ p { color: #475569; }
```

`h2 + p` is the one you will use most: "remove the top margin of a paragraph that directly follows a heading" is
the standard rhythm fix.

## 5.3 Class, id and attribute selectors

```css
.card { }                              /* class */
#main { }                              /* id — one per page, very high specificity */
a[href^="mailto:"] { }                 /* starts with */
input[type="email"] { }                /* exact match */
input:not([type="hidden"]) { }         /* anything but */
.project[data-status="live"] { }       /* attribute value = state. This is how JS hooks into CSS */
```

`[data-status="live"]` is worth memorising: it lets JavaScript set `data-status="live"` and CSS reacts. Tailwind
encourages exactly this pattern.

## 5.4 Pseudo-classes — states

```css
a:hover { }        /* pointer is over it */
a:focus-visible { }/* keyboard focus ring — use this, not bare :focus */
button:active { }  /* being pressed */
input:focus { }    /* field has keyboard focus */
input:disabled { } /* not editable */
input:required { } /* has the required attribute */
li:nth-child(2) { }      /* 2nd element of its parent */
li:nth-child(odd) { }    /* 1st, 3rd, 5th */
li:nth-child(2n + 1) { } /* same as odd, with maths */
li:last-child { }
p:empty { }        /* no children at all */
```

`:focus-visible` over `:focus` — it only shows the ring for keyboard users, so mouse users do not get a
double-outline on click. Remember the fallback:

```css
a:focus { outline: none; }
a:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
```

## 5.5 Pseudo-elements — generated content

```css
p::before { content: "→ "; }
p::after { content: ""; }

.hero {
  background: #0f172a;
  color: #f8fafc;
}

.hero::after {
  content: "";
  display: block;
  width: 64px;
  height: 4px;
  margin-top: 24px;
  background: #38bdf8;
}
```

- `content` is **required** on `::before`/`::after` — they generate a box, and without `content` the box does not exist.
- `::selection` styles highlighted text. `::placeholder` styles input placeholders.
- Never put meaningful text in `::before`/`::after` — screen readers and search engines often skip it.
- `::before` is always the first child; `::after` is always the last child.

## 5.6 Inheritance and the cascade in practice

```css
body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #1e293b;
}
```

Set typography **once on `body`** and every element inherits it. Inheritance passes down the tree; only
*inheritable* properties are inherited (typography, colour, list styles — but **not** `margin`, `padding`,
`border`, `width`, or `background`).

---

# Part 6 — Flexbox

Flexbox lays out **one dimension at a time**: a row or a column. Grid (Part 7) handles two dimensions.

## 6.1 The two axes

```text
main axis   →  the direction set by flex-direction
cross axis  ↓  always perpendicular to it
```

| `flex-direction` | Main axis | Cross axis |
| --- | --- | --- |
| `row` (default) | horizontal → | vertical ↓ |
| `row-reverse` | horizontal ← | vertical ↓ |
| `column` | vertical ↓ | horizontal → |
| `column-reverse` | vertical ↑ | horizontal → |

**This is why the two most common bugs happen:** using `justify-content` when you meant `align-items`.

- `justify-content` → **main** axis distribution
- `align-items` → **cross** axis alignment

## 6.2 The complete property set

```css
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
```

### `justify-content` — main axis distribution

```text
flex-start | flex-end | center | space-between | space-around | space-evenly
```

```text
space-between  space-around  space-evenly
[1]_____[2]_____  [1]___[2]___  [1]__[2]__[3]__

space-between  → first item at the start, last at the end, even gaps between
space-around   → equal space around each item (half-size gaps at the edges)
space-evenly   → equal space everywhere, including the edges
```

### `align-items` — cross axis alignment

`flex-start` · `flex-end` · `center` · `stretch` (default) · `baseline`

- `stretch` (default) — children fill the cross axis. It is why a `<button>` in a flex row becomes as tall as the
  tallest item. Use `align-items: center` to stop that.
- `baseline` — align text baselines. Use it any time a heading sits next to a paragraph and you want them to sit on
  the same line.

### `flex-wrap`

`nowrap` (default) · `wrap` · `wrap-reverse`. Flex items **shrink** to fit on one line by default; `wrap` is what
lets a nav reflow to two lines on a small screen.

### `flex` — the shorthand that controls growth

```css
.sidebar { flex: 1 1 auto; }
.content { flex: 2 1 auto; }
.sidebar { flex-grow: 1; }
.content { flex-grow: 2; }
.sidebar { flex-shrink: 0; }
```

`flex: grow shrink basis`. `flex: 1` = `1 1 0%` (equal columns, basis ignored). `flex: 0 0 200px` = fixed 200px,
never grows, never shrinks.

## 6.3 Centering — the two axes at once

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

This is the most-used Flexbox snippet in existence. `place-items: center` in Grid does the same in one line.

## 6.4 Practical build: nav and skills

```css
nav ul {
  display: flex;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skills li {
  padding: 8px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
}
```

Note `gap` instead of margins. `gap` does not add space around the edges of the container, so wrapping stays
symmetric. It is also why we reset the `ul` padding and `list-style` — browsers add 40px of indent by default and we
want our own spacing.

## 6.5 Flexbox trap

```text
Symptom: my child is squashed to a weird width.
Cause:   the child has no width, and flex-shrink: 1 squeezes it.
Fix:     give the child flex: 0 0 auto, or a width, or min-width: 0.
```

Also: `min-width: 0` on a flex child is required before `overflow: hidden` can work, because `min-width: auto` is the
default and prevents shrinking below content size.

---

# Part 7 — CSS Grid

Grid is for **two-dimensional** layout: rows *and* columns at once.

## 7.1 Columns and rows

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

- `1fr` = one share of the **free** space. Three `1fr` columns are always exactly equal.
- `repeat(3, 1fr)` is shorthand for `1fr 1fr 1fr`.
- `gap` accepts `row-gap column-gap`, or a shorthand `gap: 24px 32px`.

## 7.2 Mixed units — the responsive pattern

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}
```

This is the single most useful Grid line you will write. Read it as: "make as many columns as will fit, each at
least 260px, and share the rest equally."

**No media queries required.** At 1200px you get 4 columns; at 800px, 2; at 380px, 1. One rule, fully responsive.

- `auto-fit` — collapse empty tracks to zero.
- `auto-fill` — keep empty tracks, so items do not stretch.

## 7.3 `minmax()`, explicit tracks and line placement

```css
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-areas:
    "sidebar main"
    "footer  footer";
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

.hero {
  grid-column: 1 / -1;
  grid-row: span 2;
}
```

- `grid-template-areas` gives you named regions — you draw the layout in the stylesheet like a picture, and it is
  genuinely easier to read than numbered lines. The **strings must have the same number of words in every row** and
  each area must be rectangular.
- `1 / -1` means "from the first line to the last line" — the full row width. The most common Grid shorthand there is.
- `grid-column: 1 / 3` starts at line 1 and ends at line 3, so it spans 2 tracks. Lines and tracks are numbered
  differently and this trips everyone up once.

## 7.4 Centering in Grid

```css
.center {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
```

`place-items` is shorthand for `align-items` + `justify-items`. And the two-verb version for tracks:

```css
.center {
  display: grid;
  place-content: center;
}
```

`place-items` positions the **items inside** their cells. `place-content` positions the **tracks** inside the
container. Use `place-items` almost always.

## 7.5 Flexbox or Grid?

| Use | When |
| --- | --- |
| **Flexbox** | One direction. A nav bar, a row of buttons, a badge group, a card footer, centring one thing. |
| **Grid** | Rows *and* columns. A page layout, a card grid, a form with label/input pairs, an article with a sidebar. |

Rule of thumb: if you can describe the layout as "these things in a row" → Flexbox. "This next to that, and this
underneath it" → Grid. They compose freely: a Grid for the page, Flexbox inside each cell.

---

# Part 8 — Positioning and `z-index`

## 8.1 The five position values

| Value | Behaviour | Use for |
| --- | --- | --- |
| `static` | The default. Ignores `top`/`left`. | Everything, until you need positioning |
| `relative` | Shifts from its normal spot. **Becomes the containing block for absolute children.** | Nudges, badges, anchors |
| `absolute` | Removed from flow. Positioned against the nearest positioned ancestor. | Overlays, tooltips, icons inside a button |
| `fixed` | Positioned against the **viewport**. Ignores scrolling. | Sticky headers, modals, floating chat buttons |
| `sticky` | Normal flow until a threshold, then sticks. | Section headers, table headers, sidebars |

## 8.2 The containing block — the rule that explains everything

An `absolute` element is positioned against **the nearest ancestor that is not `static`**. If there is no such
ancestor, it falls back to the initial containing block (roughly the page/viewport). This is the entire reason
"my absolutely-positioned element went to the top-left of the page" happens.

```css
.card {
  position: relative;
  padding: 24px;
}

.card__badge {
  position: absolute;
  top: 12px;
  right: 12px;
}
```

Add `position: relative` to `.card` and the badge positions against the card. Remove it and the badge flies to the
page corner.

## 8.3 Centring an absolute element

```css
.modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}
```

`inset: 0` is shorthand for `top: 0; right: 0; bottom: 0; left: 0;` — stretch to all four edges, then centre the
content with Grid. The other classic is translate:

```css
.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

`transform` is the only way to move an element **without** affecting layout. Animating `left` triggers layout on
every frame; animating `transform` does not. Prefer `transform`.

## 8.4 `z-index` and stacking contexts

`z-index` only compares elements **inside the same stacking context**. A stacking context is created by:
`position` with a `z-index` other than `auto`, `position: fixed`/`sticky`, `transform`, `filter`, `opacity < 1`,
`mix-blend-mode`, and `will-change`.

Practical rules:

1. Use **small numbers**: `1`, `10`, `100`, `1000`. Nobody needs `99999`.
2. `z-index` needs `position` other than `static` to do anything (except flex/grid children, which can use
   `z-index` without `position`).
3. If a child refuses to rise above a sibling, the *parent* has a low `z-index` or a transform — fix the parent, not
   the child.

## 8.5 Sticky navigation

```css
header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}
```

Three requirements: `position: sticky`, a threshold (`top: 0`), and the sticky element must not be inside a parent
with `overflow: hidden`/`auto` — that is the number one cause of "sticky doesn't work".

---

# Part 9 — Responsive Design

## 9.1 Mobile-first

Write the **smallest** screen's CSS as your base, then add complexity upward.

```css
/* Base = mobile. No query needed. */
.hero {
  padding: 48px 20px;
  text-align: center;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

/* From 768px up */
@media (min-width: 768px) {
  .hero { padding: 96px 32px; text-align: left; }
  .layout { grid-template-columns: 260px 1fr; }
}

/* From 1024px up */
@media (min-width: 1024px) {
  .layout { gap: 48px; }
}
```

**Always `min-width`, never `max-width`.** `min-width` means "and up", which matches how you add complexity. Desktop-first with `max-width` means starting with everything and removing — and you always miss a breakpoint.

Breakpoints (Tailwind's defaults, since Day 6):

| Prefix | Min width | Typical device |
| --- | --- | --- |
| *(none)* | 0 | Mobile |
| `sm:` | 640px | Large phone, small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Large desktop |

Design mobile-first, but **test on 375px, 768px, 1280px**. Also test **320px** if you can — that is where overflow bugs appear.

## 9.2 Responsive units

```css
h1 { font-size: clamp(2rem, 5vw + 1rem, 4rem); }
.container { width: min(1200px, 100% - 2rem); margin-inline: auto; }
```

- **`clamp(min, preferred, max)`** — fluid type with hard limits. `1rem` at 320px, scaling smoothly, capped at
  `4rem`. This is responsive typography without a single media query.
- **`min()` / `max()`** — the container line is the standard modern pattern: full width minus gutters, capped at
  1200px, centred. `margin-inline: auto` centres it.

## 9.3 Images and media

```css
img,
video {
  display: block;
  max-width: 100%;
  height: auto;
}
```

Always set a real `width`/`height` on `<img>` (or `aspect-ratio` in CSS) to prevent layout shift while loading, and
always write a descriptive `alt`.

- `alt=""` — the image is decorative, or its meaning is already in the text. Correct and desirable.
- `alt="A bar chart showing 40% year-over-year growth"` — the image carries information. Required.
- Missing `alt` entirely — screen readers announce the filename. Always write something.

## 9.4 Accessibility and motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Some people get motion-induced nausea from animation. One media query respects that setting. Tailwind ships
`motion-reduce:` and `motion-safe:` for exactly this.

---

# Part 10 — The Bridge to Tailwind

Here is the payoff for the whole session. Every decision you just learned by hand has a utility equivalent.

## 10.1 Concept mapping

| Plain CSS concept | Tailwind equivalent | What you still decide |
| --- | --- | --- |
| `<link rel="stylesheet">` | The `@import "tailwindcss";` line | Nothing — the framework does it |
| `styles.css` file | `class="..."` on the element | The class list |
| `.hero { }` rule | `class="bg-slate-900 text-white"` | Which utilities |
| `padding: 16px` | `p-4` | The value |
| `margin: 16px 0` | `my-4` | The value |
| `font-size: 18px` | `text-lg` | The scale step |
| `#0f172a` | `bg-slate-900` | Which shade |
| `display: flex` | `flex` | Nothing |
| `justify-content: center` | `justify-center` | Nothing |
| `@media (min-width: 768px)` | `md:` prefix | The breakpoint |
| `&:hover` | `hover:` prefix | Nothing |
| `@apply` | a `@apply` block in CSS | Rarely needed |

## 10.2 Spacing scale (the numbers you already chose)

Tailwind's spacing scale is built on `rem`. `1` = `0.25rem` = **4px**.

| Class | Value | px |
| --- | --- | --- |
| `0` | `0rem` | 0 |
| `1` | `0.25rem` | 4 |
| `2` | `0.5rem` | 8 |
| `3` | `0.75rem` | 12 |
| `4` | `1rem` | 16 |
| `5` | `1.25rem` | 20 |
| `6` | `1.5rem` | 24 |
| `8` | `2rem` | 32 |
| `10` | `2.5rem` | 40 |
| `12` | `3rem` | 48 |
| `16` | `4rem` | 64 |
| `20` | `5rem` | 80 |
| `24` | `6rem` | 96 |

Use these numbers. An arbitrary value like `p-[13px]` works, but it means you have abandoned the scale and now
own the responsibility of keeping the design coherent.

## 10.3 Side-by-side translation

```css
/* styles.css — plain CSS */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 64px 24px;
  background-color: #0f172a;
  color: #f8fafc;
}

@media (min-width: 768px) {
  .hero { padding: 96px 32px; }
}

.hero__title { font-size: 40px; line-height: 1.2; margin: 0; }
```

```html
<!-- Tailwind — same decisions, no stylesheet -->
<section class="flex flex-col items-start justify-between gap-4 bg-slate-900 px-6 py-16 text-slate-50 md:flex-row md:px-8 md:py-24">
  <h1 class="text-4xl md:text-5xl font-bold leading-tight m-0">Samira Okonkwo</h1>
  <a href="#projects" class="rounded-lg bg-sky-400 px-5 py-2.5 font-medium text-slate-900 hover:bg-sky-300">See my work</a>
</section>
```

Same layout. Same decisions. No class-name invention, no `styles.css`, no specificity battles. That is the whole value proposition — and it only works if you own the concepts from Parts 4 to 9.

## 10.4 Utility order that Tailwind expects

Tailwind has no cascade surprises if you order classes the way the framework generates them. From outermost to
innermost:

```text
layout (flex, grid, block)
  → position (relative, absolute)
    → size (w-, h-, p-, m-)
      → typography (text-, font-)
        → colour (bg-, text-{colour})
          → border & effects (rounded, shadow, ring)
            → states (hover:, focus:, md:, dark:)
```

When two utilities conflict, the **later one in the class attribute** wins, not the longer name. So
`p-4 p-8` applies `p-8`. If that surprises you, it is the cascade again — and now you know why.

## 10.5 Setup preview (details on Day 6)

```bash
npm create vite@latest my-site -- --template react
cd my-site
npm install
npm install tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

```html
<div class="flex items-center justify-center gap-4 rounded-xl border border-slate-200 p-6">
  <span class="text-2xl">✅</span>
  <p class="text-slate-700">Tailwind is working.</p>
</div>
```

Note the same `flex items-center justify-center gap-4` from Part 6. That is the session paying off.

---

# Lab — Build the One-Page Site in Plain CSS

**Time:** 60 minutes. **Deliverable:** `index.html` + `styles.css` in this folder.

## Lab 1 — Structure (15 min)

1. Create `index.html` and `styles.css` in `class1/`.
2. Build the skeleton from Part 2.4 exactly: header + nav, hero, about, skills, projects, contact, footer.
3. One `<h1>`, one `<main>`, no heading-level skips.
4. Add the skip link and `aria-label` on the nav.
5. All nav links point at `#` fragments that match section `id`s.
6. Validate at [validator.w3.org](https://validator.w3.org/) — aim for zero errors.

## Lab 2 — Box model & typography (15 min)

1. Put the `box-sizing: border-box` reset at the top of `styles.css`.
2. Reset `body` margin to `0`.
3. Set `font-family`, `line-height` and `color` once on `body`; let everything inherit.
4. Set `max-width` + centred `margin-inline: auto` on `main` — the container pattern.
5. Style `h1`–`h3` with explicit `margin` and `line-height` (a type scale).
6. Give every `<section>` vertical padding of `4rem` and horizontal padding of `1.5rem`.

## Lab 3 — Layout (15 min)

1. **Nav:** `display: flex`, `gap: 24px`, `justify-content: space-between`, `align-items: center`.
2. **Header:** `position: sticky; top: 0; z-index: 100;` plus a background and bottom border.
3. **Hero:** Flexbox, `flex-direction: column` on mobile, `row` at `min-width: 768px`, centred vertically.
4. **Skills:** Flexbox with `flex-wrap: wrap` and pill-styled `<li>`s (`border-radius: 9999px`).
5. **Projects:** Grid with `repeat(auto-fit, minmax(260px, 1fr))` — verify it goes 2 columns at 1200px, 1 at 380px.
6. **Contact form:** Grid with `grid-template-columns: 140px 1fr` on desktop, `1fr` on mobile.

## Lab 4 — Responsive & polish (15 min)

1. Mobile-first: no `max-width` queries anywhere.
2. Add `md:`-equivalent media queries at 768px and 1024px. Minimum three of them.
3. `img, video { display: block; max-width: 100%; height: auto; }`
4. Hover state on the nav links and the submit button.
5. `:focus-visible` outline on every interactive element.
6. Body text contrast at **4.5:1** or better. Check with
   [webaim.org/contrast-checker](https://webaim.org/resources/contrast-checker/).
7. `prefers-reduced-motion` block at the bottom.

## Self-review before you move on

- [ ] Can I delete any single `styles.css` rule without breaking the layout? If not, I have a specificity problem.
- [ ] Does the page have **zero** horizontal scrollbars at 320px?
- [ ] Does every interactive element show a visible focus ring?
- [ ] Can I complete the contact form with keyboard only?
- [ ] Is there exactly one `<h1>`? Are heading levels in order?
- [ ] Do all six nav links scroll to the right section?
- [ ] Does the sticky header stay pinned while scrolling?
- [ ] Does it still look intentional at 1920px? (Use a max-width container so it does not stretch.)

## Push it

```bash
git add class1
git commit -m "Day 1: one-page site with semantic HTML and plain CSS"
git push
```

---

# Homework

**1. Convert one section to CSS Grid (30 min).**
Take the projects section and rebuild it with `grid-template-areas` instead of `repeat(auto-fit, ...)`. Name the
areas. Make it responsive: single column on mobile, two columns on desktop, via one media query.

**2. Write the Tailwind version before Day 6 (45 min).**
Create `tailwind-preview.html` — one file, no build step. Paste the Tailwind CDN script into the `<head>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Rewrite the hero, nav and projects sections using only utility classes. Keep the same HTML, strip `styles.css`
entirely. This is the exact exercise that makes Day 6 click — and seeing the file shrink from ~200 lines of CSS to
~2 lines of HTML is the moment Tailwind stops being a mystery.

**3. Accessibility audit (30 min).**
Run [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) in Chrome DevTools → Audits, category
**Accessibility**. Fix everything it reports. Re-run until the score is 95+.

**4. Reading (20 min).**
MDN: [The Cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Introduction) and
[CSS Box Model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model).
Do not read them passively — after each section, open DevTools on your `index.html` and reproduce what you just read.

---

# Checkpoint Quiz

Answer these before Day 2. If any of them takes more than a minute, review that section.

1. Why must `<!DOCTYPE html>` be the first line?
2. What does the viewport meta tag actually do?
3. `box-sizing: border-box` changes what? Why is it the default everyone applies?
4. You set `width: 200px` and `padding: 20px`. How wide is the element? Why?
5. Specificity of `#main .card a:hover` — give it as `inline-id-class-element`.
6. When does specificity *not* matter?
7. `justify-content` vs `align-items` — which axis is which?
8. What is the value of `flex: 1` expanded? And what does `1fr` mean in Grid?
9. Explain `repeat(auto-fit, minmax(260px, 1fr))` in a sentence.
10. An `absolute` element ignores `top: 20px`. What is wrong and what do you add?
11. Why does `position: sticky` sometimes not work? Name two causes.
12. Why write `min-width` queries instead of `max-width`?
13. `p-[13px]` vs `p-3` — what is the tradeoff?
14. In `class="p-4 p-8"`, which padding applies and why?
15. What does `alt=""` mean, and when is it correct?
16. Why does `a:hover` work but `a:hover { }` alone on an unstyled page look broken?

<details>
<summary>Answers</summary>

1. Switches the browser out of quirks mode into standards mode.
2. Sets the layout viewport to the device width so the page renders at real CSS pixel size instead of being zoomed out to ~980px.
3. It makes `width` include padding and border. Default `content-box` makes `width` mean content only, so total size surprises you.
4. 240px under the default `content-box`; 200px with `border-box`.
5. `0-1-2-1` — inline 0, id 1 (`#main`), classes/attrs/pseudo-classes 2 (`.card`, `:hover`), elements 1 (`a`).
6. When the declarations are in different cascade origins (author vs user-agent vs inline) or when the properties are different — specificity only breaks ties on the *same* property.
7. `justify-content` distributes along the **main** axis; `align-items` aligns along the **cross** axis. Main axis is set by `flex-direction`.
8. `flex: 1 1 0%` — grow 1, shrink 1, basis 0%. `1fr` = one share of the container's free space.
9. Make as many equal columns as fit, each at least 260px wide, sharing whatever space remains. It reflows with no media queries.
10. No positioned ancestor exists, so it is positioned against the initial containing block. Add `position: relative` to the parent you want it to anchor to.
11. A parent has `overflow: hidden`/`auto`/`scroll`; or `top`/`left` was never set; or the sticky element is a `<table>` row/cell, which is unsupported.
12. Mobile-first means starting with the smallest screen and adding complexity upward, which is `min-width` ("and up"). `max-width` forces you to start with everything and subtract.
13. `p-[13px]` gives an exact value but abandons the 4px scale, so spacing stops looking consistent. `p-3` (12px) is close and stays on the scale.
14. `p-8` — same specificity, so the later one in the source order wins. This is the cascade, not a Tailwind rule.
15. The image is decorative or its information is already in the text; the screen reader should skip it. Correct for spacers, dividers, background textures.
16. Because unstyled anchors are the same colour as body text and only underline on hover. The colour contrast issue is separate from the pseudo-class working.

</details>

---

# Common Mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Page is 980px wide on a phone | Missing viewport meta tag | Add it as the first tag in `<head>` |
| Element wider than the `width` I set | `content-box` default | Add the `border-box` reset |
| `justify-content: center` did not centre it vertically | Wrong axis | Use `align-items: center` for cross axis |
| `position: absolute` jumped to the page corner | No positioned ancestor | Add `position: relative` to the parent |
| `position: sticky` has no effect | Parent has `overflow: hidden`, or no `top` set | Remove the overflow, set `top: 0` |
| `z-index: 999` still loses | Different stacking contexts | Raise the parent, not the child |
| Clicking a label does not focus the field | `for` does not match `id` | Make them identical strings |
| Form submits but arrives empty | Missing `name` on the input | `id` is for labels; `name` is for the server |
| Media query never fires | `max-width` set where `min-width` was needed, or px/em mixup | Use `min-width` and consistent units |
| Last class "not working" | Same-property conflict, later wins | Reorder, or split into two elements |
| Text unreadable on a background | No `color` set on the block | Set both foreground and background |
| Mobile page scrolls sideways | Fixed-width element (e.g. `width: 900px`) | Use `max-width: 100%` or a fluid width |
| Keyboard focus invisible | Focus ring removed with `outline: none` and never replaced | Use `:focus-visible` with a visible outline |

---

# Cheat Sheet

```css
/* Reset */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }

/* Container */
.container { width: min(1200px, 100% - 2rem); margin-inline: auto; }

/* Fluid type */
h1 { font-size: clamp(2rem, 5vw + 1rem, 4rem); line-height: 1.1; }

/* Sticky header */
header { position: sticky; top: 0; z-index: 100; }

/* Flex row, centred */
.row { display: flex; align-items: center; justify-content: center; gap: 16px; }

/* Wrap and space evenly */
.wrap { display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; }

/* Responsive auto grid */
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }

/* Centred card */
.card { display: grid; place-items: center; min-height: 100vh; }

/* Media reset */
img, video { display: block; max-width: 100%; height: auto; }

/* Visible focus */
:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }

/* Pill */
.pill { padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 9999px; }

/* Anchor inside a positioned card */
.card { position: relative; }
.card__badge { position: absolute; top: 12px; right: 12px; }

/* Centred overlay */
.overlay { position: fixed; inset: 0; display: grid; place-items: center; }

/* Mobile-first breakpoint */
@media (min-width: 768px) { }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# Reference

- [MDN Web Docs](https://developer.mozilla.org/en-US/) — the authority. Learn to read it; it is denser than any course.
- [W3C Markup Validator](https://validator.w3.org/) — paste your HTML, fix everything.
- [webaim.org/contrast-checker](https://webaim.org/resources/contrast-checker/) — verify colour contrast.
- [Can I Use](https://caniuse.com/) — check browser support before you rely on a feature.
- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools) — the single most valuable skill in this course.

---

# Tomorrow — Day 2: Modern JavaScript Refresher I

Today your page could not respond to anything. Tomorrow it can.

- `let`, `const`, block scope, and why `var` is a trap
- Arrow functions vs regular functions, and the `this` difference that bites everyone
- Template literals — the day your one-page site gets dynamic
- Destructuring — array and object patterns
- Spread and rest
- **Practice:** refactor 10 ES5 snippets into modern ES6+, then make the skills section and contact form of today's
  site interactive with vanilla JavaScript.

**Bring:** today's `index.html`, `styles.css`, and the quiz answers above.
