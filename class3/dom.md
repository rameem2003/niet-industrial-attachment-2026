# DOM & DOM Manipulation

**Session length:** ~2.5–3 hours
**Goal of the whole course:** Design, build and deploy a **single-page website using Tailwind CSS**.
**Goal of today:** Understand what the DOM actually is, and learn every operation you need to build, change and
delete the page while the user watches — the layer that makes JavaScript visible.

> **Where this fits**
> On Day 1 you wrote HTML. On Day 2 and Day 3 you learned to transform data. Today you connect the two: **HTML is
> what the page starts as; the DOM is what it becomes.** Every button that toggles a menu, every search box that
> filters cards, every counter in the Day 3 project — all of them are DOM manipulation.
>
> **How this connects to the rest of the course.** The DOM is the reason React exists. React (Day 7) is a layer
> that does **exactly what you will do by hand today** — it turns data into elements and updates only what
> changed. If you learn the DOM properly first, React stops being magic and becomes "the thing I was already
> doing, with better bookkeeping." Tailwind gives you the classes; the DOM is what you attach them to.

---

## Session Plan

| Time | Block | Outcome |
| --- | --- | --- |
| 00:00–00:20 | What the DOM is: HTML string → live tree of objects | Mental model |
| 00:20–00:45 | Selecting elements: `querySelector`, `querySelectorAll`, `getElementById`, `closest`, `matches` | Find anything |
| 00:45–01:05 | Reading & writing: `textContent`, `innerHTML`, `innerText` (and XSS) | Change content safely |
| 01:05–01:10 | Break | |
| 01:10–01:30 | Attributes, `dataset`, `classList`, `style`, CSS variables | Change appearance & state |
| 01:30–01:55 | Creating, inserting, removing nodes; `template`, `DocumentFragment`, `replaceChildren` | Build lists from data |
| 01:55–02:15 | Traversing the tree safely | Walk parent/child/sibling |
| 02:15–02:45 | **Events:** `addEventListener`, bubbling, delegation, `preventDefault` | React to the user |
| 02:45–03:00 | Forms in the DOM: values, `FormData`, live validation | Working forms |
| 03:00–03:15 | Performance: reflow, batching, delegation, `requestAnimationFrame` | Smooth pages |
| 03:15–04:00 | Lab: turn the Day 3 counter into a live, data-driven dashboard | Working interactive page |

---

# Part 1 — What the DOM Is

## 1.1 The one-paragraph answer

The **Document Object Model (DOM)** is the browser's live, in-memory representation of your page as a tree of
JavaScript objects. Your `.html` file on disk is just text — the browser reads that text once and builds the DOM
from it. From then on, JavaScript never touches the file; it mutates the DOM, and the browser re-renders whatever
changed.

```text
index.html (text on disk)   →   parsed once   →   DOM (tree of live objects)   →   pixels on screen
                                                    ↑
                                              JavaScript mutates THIS
```

## 1.2 HTML vs the DOM

They are not the same thing, even though they usually start identical.

```html
<!-- index.html — a string of text -->
<ul id="menu">
  <li>Home</li>
</ul>
```

After parsing, the browser has objects:

```text
document
  └── html
        ├── head
        └── body
              └── ul#menu
                    └── li → "Home"
```

Three consequences that surprise beginners:

1. **The DOM can be changed and the file is not.** Add a `<li>` in JavaScript and the file on disk is untouched.
2. **The browser fixes your HTML.** Forget to close a `<p>`, and the DOM still has a closed one. The DOM is what
   the browser understood, not what you typed.
3. **Reloading throws your changes away.** The DOM is rebuilt from the file every time. Persisting state requires
   `localStorage` or a server.

## 1.3 Everything is a node

Every box in the tree is a **node**. The ones you will touch:

| Node type | Example | Useful properties |
| --- | --- | --- |
| **Element** | `<div>`, `<li>` | `.classList`, `.style`, `.children`, `.id` |
| **Text** | the words inside an element | `.textContent`, `.nodeValue` |
| **Comment** | `<!-- note -->` | rarely touched |
| **Document** | the root object | `document.querySelector(...)` |

`document` is the entry point to everything. Your script always starts there.

## 1.4 The DOM is a Web API, and it is not JavaScript

`document`, `querySelector`, `element.addEventListener` are **not** part of the JavaScript language — they are
browser APIs that JavaScript is allowed to call, the same way `console` and `fetch` are. This is why the same
JavaScript runs in Node.js with no `document` at all. The DOM is the browser's gift to JavaScript, not part of the
language.

---

# Part 2 — Selecting Elements

You cannot change what you cannot find. This is the skill you will use more than any other.

## 2.1 The five ways to select

```js
// 1. By CSS selector — match ONE element (the first) or null. The default.
const menu     = document.querySelector("#menu");
const firstCard = document.querySelector(".card");
const email    = document.querySelector("input[type='email']");

// 2. By CSS selector — match ALL, as a NodeList. Static snapshot.
const cards    = document.querySelectorAll(".card");

// 3. By id — fastest, but ties your JS hard to the markup
const form     = document.getElementById("contact-form");   // no "#", no query syntax

// 4. By class / tag — live HTMLCollection (see 2.3)
const items    = document.getElementsByClassName("item");
const listItems = document.getElementsByTagName("li");

// 5. Relative to another element — the underused one
const heading  = card.querySelector("h3");            // search inside `card`
const closest  = event.target.closest(".card");        // nearest ancestor (or self) matching
```

**Default to `querySelector` and `querySelectorAll`.** They take any CSS selector you already know from Day 1,
so there is one syntax to remember for everything.

## 2.2 `querySelector` vs `querySelectorAll`

```js
document.querySelector(".card");       // the FIRST match, or null
document.querySelectorAll(".card");    // ALL matches, as a NodeList (empty if none)

document.querySelectorAll(".missing").length;   // 0 — always callable
document.querySelector(".missing").value;        // 💥 TypeError: null.value
```

The `null` from `querySelector` is the single most common source of
`Cannot read properties of null`. Guard it:

```js
const toggle = document.querySelector("#theme-toggle");
if (toggle) {
  toggle.addEventListener("click", () => { /* … */ });
}
```

## 2.3 NodeList vs HTMLCollection — the difference that bites

```js
const qsa = document.querySelectorAll(".card");        // NodeList   → STATIC
const gbc = document.getElementsByClassName("card");   // HTMLCollection → LIVE
```

| | `querySelectorAll` | `getElementsByClassName` / `getElementsByTagName` |
| --- | --- | --- |
| Returns | **NodeList** | **HTMLCollection** |
| Live? | **No** — a snapshot | **Yes** — updates as the DOM changes |
| Has `.forEach`? | **Yes** | No |
| Safe to snapshot? | Yes | Loops can go infinite as items are added |

```js
const cards = document.querySelectorAll(".card");   // snapshot: 3 items
// ...5 more cards get appended to the DOM...
console.log(cards.length);                          // still 3
```

**Rule: use `querySelectorAll`.** A static snapshot is almost always what you want, and it has `forEach`.
`HTMLCollection` has no `forEach` (only `.length` and indexing), which is another reason to prefer NodeList.

To turn a NodeList into a real array when you need array methods:

```js
const list = [...document.querySelectorAll(".card")];   // spread
const list2 = Array.from(document.querySelectorAll(".card"));
list.map((card) => card.textContent);   // now all array methods work
```

## 2.4 `closest` — walk up until you find it

`closest` is the event-delegation workhorse (Part 7). Given a starting element, it returns the nearest ancestor
(including the element itself) that matches the selector, or `null`.

```js
// A click landed on an <svg> inside a <button> inside a <li class="item">
const item = event.target.closest(".item");   // the <li>, no matter how deep the click was
```

## 2.5 `matches` — does it match a selector?

```js
if (element.matches(".card.active")) { /* … */ }
```

Useful to check state before acting, without querying the document again.

---

# Part 3 — Reading and Changing Content

Once you have an element, these properties read and write what is inside it.

## 3.1 The content properties

```html
<div id="msg">Hello <strong>world</strong></div>
```

```js
const msg = document.querySelector("#msg");

msg.textContent;   // "Hello world"        — all text, tags stripped
msg.innerHTML;     // "Hello <strong>world</strong>"  — the raw markup
msg.innerText;     // "Hello world"        — visible text (respects CSS, slow)
msg.outerHTML;     // "<div id=\"msg\">Hello <strong>world</strong></div>"
```

| Property | Reads/writes | Parses HTML? | Use for |
| --- | --- | --- | --- |
| `textContent` | text only | No | **Default. Safe.** Anything from a user |
| `innerHTML` | markup | **Yes** | Trusted markup you wrote yourself |
| `innerText` | rendered text | No | Rarely — it forces a layout read and is slow |
| `outerHTML` | element + its wrapper | Yes | Replacing the element itself (rare) |

**Default rule: `textContent`.** It is faster and it cannot execute anything.

## 3.2 `textContent` vs `innerHTML` — the security line

```js
const userInput = document.querySelector("#comment").value;

output.textContent = userInput;   // renders <script>alert('xss')</script> as VISIBLE TEXT. Safe.
output.innerHTML   = userInput;   // executes it. Never do this with data you did not write.
```

This is **XSS (cross-site scripting)**. The moment you render data from a user, a URL, or an API with
`innerHTML`, you have handed them a script tag on your page. On Day 4, when you `fetch` from a real API, this
stops being hypothetical.

```js
// When you MUST build markup, do it with our own template + textContent for the data:
const li = document.createElement("li");
li.className = "item";

const name = document.createElement("span");
name.textContent = product.name;      // ✅ user data through textContent

li.append(name);
list.append(li);
```

## 3.3 Setting content with `replaceChildren`

To wipe an element and put new content in, `replaceChildren` is the modern, atomic one-liner:

```js
list.replaceChildren();                  // empty it — the clean "clear" method
list.replaceChildren(li1, li2, li3);     // replace everything with these nodes
```

`list.innerHTML = ""` also clears it, but `replaceChildren` is explicit, faster, and accepts real nodes.

## 3.4 `insertAdjacentHTML` — precise markup insertion

When you do have trusted markup and want it in an exact position:

```js
element.insertAdjacentHTML("beforeend", "<li>New item</li>");
```

The four positions:

```text
"beforebegin"  →  before the element itself
"afterbegin"   →  inside, before the first child
"beforeend"    →  inside, after the last child   ← the common one
"afterend"     →  after the element itself
```

Still never use it with user data — it parses HTML just like `innerHTML`.

---

# Part 4 — Attributes, Classes and Styles

## 4.1 Attribute methods

```html
<a id="link" href="/home" data-role="nav" hidden>Home</a>
```

```js
const link = document.querySelector("#link");

link.getAttribute("href");            // "/home"
link.setAttribute("href", "/about");  // change it
link.hasAttribute("hidden");          // true
link.removeAttribute("hidden");       // show it

link.href;                            // "/about"  ← reflected/property version for some attrs
link.id;                              // "link"
```

Two ways to reach an attribute, and they are not always the same:

- **`setAttribute(name, value)` / `getAttribute(name)`** — the general, always-works interface. Values are strings.
- **Properties like `.href`, `.id`, `.value`, `.checked`, `.disabled`** — typed, convenient, but only exist for
  specific attributes. `.checked` is a boolean; `getAttribute("checked")` is the string `""`.

**Rule:** use the property (`el.value`, `el.checked`, `el.disabled`) when one exists. Use
`get/setAttribute` for everything else (including `aria-*`).

```js
toggle.setAttribute("aria-pressed", String(isOn));   // ARIA has no property form
```

## 4.2 `dataset` — your own `data-*` attributes

`data-*` attributes are the standard way to attach custom state to an element. `element.dataset` is a live object
view of them.

```html
<button data-filter="tech" data-count="12">Tech</button>
```

```js
const btn = document.querySelector("[data-filter]");

btn.dataset.filter;             // "tech"
btn.dataset.count;              // "12"  ← always a STRING
btn.dataset.count = "13";       // writes data-count="13"
btn.dataset.newKey = "x";       // writes data-new-key="x" (camelCase → kebab-case)
```

Naming translation:

```text
data-user-id   →  element.dataset.userId     (kebab-case in HTML, camelCase in JS)
data-filter    →  element.dataset.filter
```

**Remember values are strings.** `if (btn.dataset.count === 5)` is always false; compare with `Number(...)` or
against `"5"`.

## 4.3 `classList` — the Tailwind intersection

This is where Day 6 pays off. Tailwind utilities are classes, so JavaScript toggles them like any other class.

```js
const el = document.querySelector(".card");

el.classList.add("hidden");
el.classList.remove("hidden");
el.classList.toggle("hidden");              // add if absent, remove if present
el.classList.toggle("hidden", isHidden);   // add when true, remove when false — the powerful form
el.classList.contains("active");            // true / false
el.classList.replace("text-sm", "text-lg");
```

`classList.toggle(name, force)` is the one to memorise — one line replaces an `if` block:

```js
// ❌ four lines
if (isOpen) card.classList.add("hidden");
else card.classList.remove("hidden");

// ✅ one line
card.classList.toggle("hidden", !isOpen);
```

> **Never** build class names by string concatenation: `el.className = "bg-" + color` overwrites every class and
> breaks if the utility does not exist. Use `classList` with full literal names, exactly as you wrote them in the
> HTML.

`el.className` is the raw string of all classes — readable, but it replaces everything when written. Prefer
`classList`.

## 4.4 `style` and CSS custom properties

```js
el.style.color = "red";                 // sets inline style
el.style.backgroundColor = "salmon";    // camelCase: background-color → backgroundColor
el.style.setProperty("--progress", "60%");
el.style.removeProperty("color");
```

Inline styles win over stylesheets and are hard to maintain. **Prefer toggling a Tailwind class** and let the
stylesheet do the work.

The exception is **CSS custom properties (variables)**, which are the intended way to pass values from JS to CSS:

```js
// JS computes a value; CSS uses it
el.style.setProperty("--delay", `${index * 60}ms`);
el.style.setProperty("--progress", `${percent}%`);
```

```css
.bar { transform: scaleX(var(--progress, 0)); transition: transform 0.3s; }
.skill { transition-delay: var(--delay, 0ms); }
```

This is exactly how the Day 3 counter feeds its numbers and how you would stagger a list animation.

---

# Part 5 — Creating, Inserting and Removing Nodes

This is the part that turns data into UI. It is the manual version of React's render.

## 5.1 Create and insert

```js
// 1. Create
const li = document.createElement("li");
li.className = "item";
li.textContent = "New item";

// 2. Insert — the modern methods
list.append(li);        // add as the LAST child
list.prepend(li);       // add as the FIRST child
sibling.before(li);     // insert before `sibling`
sibling.after(li);      // insert after `sibling`
target.replaceWith(li); // replace `target` with `li`
target.remove();        // remove `target` from the DOM
```

`append`, `prepend`, `before`, `after` and `replaceWith` all accept **multiple arguments and plain strings**:

```js
list.append(li1, li2, "some text");   // all of it, in order
```

The older methods you will still see in existing code:

```js
parent.appendChild(child);              // like append, but one node only, no strings
parent.insertBefore(child, reference);  // like before, but from the parent's side
parent.removeChild(child);              // like child.remove()
```

Prefer the modern five. They read better and take multiple nodes.

## 5.2 The build-from-data pattern (the real job)

```js
const products = [
  { name: "Headphones", price: 89.99 },
  { name: "Keyboard", price: 129.0 },
];

const grid = document.querySelector("#product-grid");
grid.replaceChildren();                       // 1. clear

products.forEach((product) => {               // 2. one node per item
  const card = document.createElement("article");
  card.className = "rounded-2xl border p-6";

  const title = document.createElement("h3");
  title.textContent = product.name;           // 3. user data via textContent

  const price = document.createElement("p");
  price.textContent = `$${product.price.toFixed(2)}`;

  card.append(title, price);                  // 4. assemble
  grid.append(card);                          // 5. attach
});
```

That is the whole idea, and it is **exactly what React does for you on Day 7** — create elements, set their
content, attach them. Learn it here so React's `map(...)` returning JSX looks familiar.

## 5.3 `DocumentFragment` — the performance version

Appending a node to the live DOM forces the browser to do work. Append 100 nodes one by one and it does that
work 100 times. A **`DocumentFragment`** is an invisible container: you build everything inside it, then attach
it in **one** operation.

```js
const fragment = document.createDocumentFragment();

products.forEach((product) => {
  const card = document.createElement("article");
  card.textContent = product.name;
  fragment.append(card);        // appended to the fragment, NOT the page — no layout yet
});

grid.replaceChildren(fragment); // one live insertion for all 100 cards
```

Rule of thumb: **more than ~20 nodes? Build in a fragment (or in one `<template>`) and insert once.**

## 5.4 `<template>` — reusable markup in HTML

A `<template>` holds HTML that is **not rendered** until you clone it. It is the HTML-first way to build repeated
cards.

```html
<template id="card-template">
  <article class="card">
    <h3 class="card__title"></h3>
    <p class="card__price"></p>
  </article>
</template>
```

```js
const template = document.querySelector("#card-template");
const grid = document.querySelector("#product-grid");

products.forEach((product) => {
  const node = template.content.cloneNode(true);   // deep clone — content, not the template itself
  node.querySelector(".card__title").textContent = product.name;
  node.querySelector(".card__price").textContent = `$${product.price}`;
  grid.append(node);
});
```

`template.content` is a `DocumentFragment`, so cloning it is cheap. Use `.textContent` on the cloned parts — the
structure is trusted markup, the data is not.

## 5.5 Removing elements

```js
el.remove();                                  // remove one element
el.replaceChildren();                         // remove all children (keep the parent)
parent.innerHTML = "";                        // also clears, but re-parses — prefer replaceChildren

// Remove every .card
document.querySelectorAll(".card").forEach((card) => card.remove());
```

**Event listeners attached to a removed element are eligible for garbage collection with it** — you do not need
to remove them manually in the modern DOM. (Unless you attached the listener to `document` or `window`, as in
event delegation; those you should clean up if the whole feature goes away.)

---

# Part 6 — Traversing the Tree

You often have one element and need its relatives.

## 6.1 The navigation properties

```js
el.parentElement;          // the parent (skips the document)
el.children;               // element children ONLY (no text/comment) — HTMLCollection
el.childNodes;             // ALL child nodes, including whitespace text nodes — NodeList
el.firstElementChild;      // first child element
el.lastElementChild;       // last child element
el.previousElementSibling; // previous element sibling
el.nextElementSibling;     // next element sibling

// The "old" versions that include text nodes — avoid:
el.firstChild; el.lastChild; el.previousSibling; el.nextSibling;
```

**Element vs node:** always prefer the `Element` versions. `childNodes` includes the whitespace between tags (a
text node of `"\n  "`), which is why `childNodes[0]` is often not what you expect.

```html
<ul id="list">
  <li>One</li>
  <li>Two</li>
</ul>
```

```js
list.childNodes;              // [text, li, text, li, text]  ← 5 nodes
list.children;                // [li, li]                    ← 2 elements  ✅
```

## 6.2 Combining with `closest`, `matches`, `contains`

```js
// Walk up to the nearest .card, then down to its title
const title = event.target.closest(".card")?.querySelector(".title");

// Does `container` hold `node`?
container.contains(node);     // true / false — includes the node itself

// Sibling helpers
el.nextElementSibling?.classList.add("active");
```

## 6.3 A practical traversal — highlight the active nav item

```js
function setActive(link) {
  document.querySelectorAll("nav a").forEach((a) => {
    a.classList.toggle("text-sky-400", a === link);
    a.setAttribute("aria-current", a === link ? "page" : "false");
  });
}
```

---

# Part 7 — Events

Everything so far changed the page on load. Events make it respond.

## 7.1 `addEventListener` — the only method you need

```js
const button = document.querySelector("#save");

function handleSave(event) {
  // `event` describes what happened
  console.log(event.type);        // "click"
  console.log(event.target);      // the element that was clicked
}

button.addEventListener("click", handleSave);
button.removeEventListener("click", handleSave);   // must pass the SAME function reference
```

`removeEventListener` only works with a **named** function reference:

```js
button.addEventListener("click", () => save());       // ❌ cannot be removed — anonym

const onClick = () => save();
button.addEventListener("click", onClick);
button.removeEventListener("click", onClick);          // ✅
```

**Never use `onclick="..."` attributes or `el.onclick = fn`.** They allow only one handler and mix concerns;
`addEventListener` allows many and keeps behaviour in JavaScript. (On Day 1 we also learned never to fake a link
with a button — the same "keep the layers separate" rule.)

## 7.2 The `event` object — the essentials

```js
element.addEventListener("click", (event) => {
  event.target;          // the element that was ACTUALLY clicked (may be a deep child)
  event.currentTarget;   // the element the listener is attached to
  event.type;            // "click", "input", "submit", ...
});
```

**`target` vs `currentTarget` is the single most important event concept.** `target` is where the event
originated (deepest point); `currentTarget` is where the handler is running. They are the same only when the click
lands exactly on the element the listener is on.

```html
<button id="btn"><span>Save</span></button>
```

```js
document.querySelector("#btn").addEventListener("click", (e) => {
  e.target;         // <span> — where the click actually happened
  e.currentTarget;  // <button> — where this listener is attached
});
```

## 7.3 Bubbling and capturing

Events **bubble**: an event fires on the deepest element, then on each ancestor up to `document`.

```text
click on <span>  →  span → button → div.card → div#app → body → html → document
```

This is why a click on a small inner element still triggers a listener on its parent — the basis of **event
delegation** (7.4).

The full journey has three phases:

```text
1. Capturing  →  document → … → down to the target   (rarely used)
2. Target     →  the element itself
3. Bubbling   →  back up to document                  (the default)
```

`addEventListener(type, fn, options)` — pass `{ capture: true }` to listen during the capture phase instead.

## 7.4 Event delegation — the pattern that saves your life

Instead of adding a listener to every item, add **one** to a common ancestor and decide from `event.target` which
child was involved. This handles items that do not exist yet — the killer feature when you render lists from data.

```js
// ❌ a listener per card — dies the moment you re-render the list
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => open(card));
});
```

```js
// ✅ one listener on the container, survives any re-render
const grid = document.querySelector("#product-grid");

grid.addEventListener("click", (event) => {
  const card = event.target.closest(".card");   // walk up to the card
  if (!card) return;                            // click was on the gap — ignore it
  open(card);
});
```

**Rules for delegation:**
1. Attach to a container that stays on the page.
2. Use `event.target.closest(selector)` to find the relevant child.
3. **Always guard for `null`** — a click on the container itself (or a child that does not match) yields `null`.

Delegation is why a Day 3-style filter keeps working after you rebuild the grid.

## 7.5 `preventDefault` and `stopPropagation`

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();     // stop the browser's default action (reloading the page)
  saveData();
});
```

| Method | What it stops |
| --- | --- |
| `event.preventDefault()` | The browser's **default behaviour** (form submit, link navigation, checkbox toggle) |
| `event.stopPropagation()` | The event **bubbling** to ancestors |

Use `preventDefault` constantly (forms, links). Use `stopPropagation` **rarely** — it breaks delegation and
usually signals a layout problem. Prefer structuring your selectors so you do not need it.

## 7.6 The events you will actually use

| Event | Fires when | Typical use |
| --- | --- | --- |
| `click` | element is clicked | buttons, toggles, delegation |
| `input` | value changes **as you type** | live search, character count |
| `change` | value is committed (blur / select) | `<select>`, checkboxes |
| `submit` | a form is submitted | save, validate (always `preventDefault`) |
| `keydown` / `keyup` | a key is pressed / released | shortcuts, Enter to submit |
| `focus` / `blur` | gains / loses focus | inline validation |
| `scroll` | the page scrolls | sticky effects (throttle it) |
| `load` | page and assets finished | start animations |
| `DOMContentLoaded` | HTML parsed, before images | run DOM setup |

```js
// Live search — fires on every keystroke
search.addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  filterCards(query);
});
```

## 7.7 Keyboard accessibility

A `<button>` gives you Enter/Space and focus for free. If you must make a non-button interactive, you now owe
the user keyboard support — which is exactly why Day 1 said "never fake a button with a `<div>`."

```js
// If you ever attach click to a <div>, you must also handle keyboard:
div.setAttribute("role", "button");
div.setAttribute("tabindex", "0");
div.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate();
  }
});
```

The lesson: use the real element and skip all of this.

---

# Part 8 — Forms and Inputs in the DOM

Forms are where the DOM touches real user data.

## 8.1 Reading values

```js
const input = document.querySelector("#email");
input.value;            // the current text — a string
input.value = "";       // clear it

const checkbox = document.querySelector("#agree");
checkbox.checked;       // boolean

const select = document.querySelector("#category");
select.value;           // the selected option's value
select.selectedOptions; // the (usually one) selected <option>
```

`value` is **always a string**, even for `type="number"`. Convert before arithmetic:

```js
const qty = Number(input.value) || 0;   // "" → NaN → 0
```

## 8.2 `FormData` — collect a whole form at once

Writing one `querySelector` per field gets old. `FormData` reads every named field in one go.

```html
<form id="signup">
  <input name="email" type="email" required />
  <input name="age" type="number" />
  <input name="newsletter" type="checkbox" />
</form>
```

```js
const form = document.querySelector("#signup");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const values = Object.fromEntries(data);   // { email, age, newsletter }

  console.log(values);         // newsletter is "on" when checked
});
```

`FormData` only sees fields with a `name` — the same rule as Day 1 ("id is for labels, name is for the server").

## 8.3 Live validation

```js
const email = document.querySelector("#email");
const error = document.querySelector("#email-error");

email.addEventListener("input", () => {
  const valid = email.checkValidity();        // uses HTML5 rules (type, required, pattern)
  error.textContent = valid ? "" : "Enter a valid email";
  error.classList.toggle("hidden", valid);
  email.setAttribute("aria-invalid", String(!valid));
});
```

The browser's own `input.checkValidity()`, `input.setCustomValidity(msg)`, and `form.reportValidity()` save you
from re-implementing `required`, `type="email"` and `pattern`. Prefer them; they are accessible by default.

---

# Part 9 — Performance and Best Practices

A DOM operation is cheap. Hundreds of them in a loop, each forcing the browser to recalculate the page, is not.

## 9.1 Reflow and repaint

- **Reflow (layout):** the browser recalculates positions/sizes. Triggered by adding elements, changing
  dimensions, reading `offsetHeight`, `getBoundingClientRect()`, etc.
- **Repaint:** pixels are redrawn (colour changes) without re-layout.

**Layout thrashing** is the killer: reading a layout property and then writing, over and over, forces a reflow each
time.

```js
// ❌ read → write → read → write … a reflow per item
items.forEach((item) => {
  const width = item.offsetWidth;              // READ  → forces layout
  item.style.width = width + 10 + "px";        // WRITE → invalidates layout
});
```

```js
// ✅ batch all reads, then all writes
const widths = items.map((item) => item.offsetWidth);   // phase 1: reads
items.forEach((item, i) => {                            // phase 2: writes
  item.style.width = widths[i] + 10 + "px";
});
```

**Rule: read everything, then write everything.** Never mix.

## 9.2 Build off-DOM, insert once

```js
// ❌ 100 insertions, 100 potential reflows
items.forEach((i) => grid.append(makeCard(i)));

// ✅ build in a fragment, one insertion
const fragment = document.createDocumentFragment();
items.forEach((i) => fragment.append(makeCard(i)));
grid.append(fragment);
```

## 9.3 Throttle high-frequency events

`scroll`, `resize` and `mousemove` fire dozens of times a second. Wrap the handler so it runs at most once per
frame:

```js
let ticking = false;

window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    doExpensiveThing();
    ticking = false;
  });
});
```

For input, **debounce** instead — wait until the user pauses:

```js
let timer;
search.addEventListener("input", (event) => {
  clearTimeout(timer);
  timer = setTimeout(() => runSearch(event.target.value), 300);
});
```

Debounce delays until the typing stops; throttle caps the rate. Search uses debounce; scroll uses throttle.

## 9.4 Prefer classes, cache lookups, delegate

```js
// Cache elements you use repeatedly
const grid = document.querySelector("#product-grid");   // once
// ...use `grid` many times, not document.querySelector("#product-grid") each time

// Toggle a class instead of setting styles
el.classList.add("is-open");        // ✅ let CSS decide what "open" looks like
```

---

# Part 10 — Putting It Together: Read the Counter Project

Open `class3/index.html` — the animated counters you built earlier. Read it now with DOM eyes.

```js
// 1. SELECT — grab every element with the class "counter"
const counters = document.querySelectorAll(".counter");

// 2. CHANGE — write a new number into each one, over time, on every frame
function animateCounter(el) {
  const target = Number(el.dataset.target);   // data-target="100" → read as a string → convert
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();   // the DOM write

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();                  // guarantee the final value
  }

  requestAnimationFrame(step);
}

// 3. ACT — start every counter
counters.forEach((counter) => animateCounter(counter));
```

Every idea in this lecture is here in miniature:

- `querySelectorAll` returns a **static NodeList** (Part 2.3) so the `forEach` is safe.
- `el.dataset.target` reads a **`data-*` attribute** as a string (Part 4.2) — the `Number()` is required.
- `el.textContent` writes the number — **no `innerHTML`**, because we only ever set text (Part 3).
- `requestAnimationFrame` schedules the next frame; it is the correct timer for anything visual (Part 9.3).

**Try this next:** open DevTools, select a counter card, and watch `.textContent` tick up in the Elements panel as
it animates — that is the DOM changing live in front of you.

---

# Lab — Build a Live, Data-Driven Dashboard

**Time:** 90 minutes. **Deliverable:** `class3/index.html` extended in place (keep the counters) plus a new data
section.

You will rebuild the Day 3 product-ish data as a DOM-driven page, doing everything by hand — no framework — so
that Day 7's React feels earned.

## Lab 1 — Select and cache (10 min)

1. Add to the page a `<section id="stats">` (the four counters already there) and a
   `<section id="roster"><div id="roster-grid"></div></section>`.
2. At the top of the script, **cache** every element you will touch:
   ```js
   const counters   = document.querySelectorAll(".counter");
   const grid       = document.querySelector("#roster-grid");
   const search     = document.querySelector("#search");
   const filters    = document.querySelector("#filters");
   const emptyState = document.querySelector("#empty");
   ```
3. Log `grid` and `search`. Confirm neither is `null` before writing code that uses them.

## Lab 2 — Data and a render function (20 min)

1. Declare a `const people` array of six objects, each with `name`, `role`, `city`, `available`, `score`.
2. Write `renderPeople(list)` that:
   - `grid.replaceChildren()` first (Part 3.3).
   - Builds a `DocumentFragment`, appends one card per person (Part 5.3).
   - Sets the card's text with `textContent` only — **never `innerHTML` with people's data** (Part 3.2).
   - Adds `data-available` and `data-role` attributes with `dataset` for later filtering.
   - Toggles a `hidden` Tailwind class on the empty state depending on `list.length` (Part 4.3).
   - Appends the fragment to `grid` in **one** insert.
3. Call `renderPeople(people)`.

## Lab 3 — Filter with delegation (20 min)

1. Add filter buttons in `#filters`, each with `data-filter="all|available|frontend|backend"`.
2. Attach **one** `click` listener to `#filters` (event delegation — Part 7.4):
   ```js
   filters.addEventListener("click", (event) => {
     const button = event.target.closest("[data-filter]");
     if (!button) return;                       // guard: click missed a button
     applyFilter(button.dataset.filter);
     markActive(button);
   });
   ```
3. `applyFilter` uses `filter` (Day 3) to produce the list, then calls `renderPeople`.
4. `markActive` uses `classList.toggle(name, condition)` and sets `aria-pressed` (Parts 4.1, 4.3).
5. Explain in a comment why delegation keeps working even after `renderPeople` rebuilds every card.

## Lab 4 — Live search with debounce (15 min)

1. Attach an `input` listener to `search` (fires on every keystroke — Part 7.6).
2. Debounce it by 300ms (Part 9.3), then filter `people` by `name` or `role`, case-insensitively:
   ```js
   people.filter((p) => `${p.name} ${p.role}`.toLowerCase().includes(query));
   ```
3. The search and the active filter must **combine** — filter by the button, then by the query, in that order.
4. Show the empty state when the combined result is empty.

## Lab 5 — Counter as a summary (15 min)

1. Add a "Show totals" button that sets the four counters to values computed from `people`:
   - Total people, average score (rounded), available count, cities count.
2. Reuse `animateCounter`. Because it reads `data-target`, either update `data-target` first and re-run, or
   refactor `animateCounter(el, target)` to take the target as an argument — do whichever you can justify.
3. Make the button keyboard-accessible (`<button>`, not a `<div onclick>` — Part 7.7).

## Self-review before you move on

- [ ] Does any user-supplied value go through `innerHTML`? It must be `textContent`.
- [ ] Is every `event.target.closest(...)` result checked for `null`?
- [ ] Is there a listener on **every** card, or did I delegate to the container?
- [ ] Did I cache `grid`, `search` and `filters`, or re-query inside loops?
- [ ] Do filter + search combine, or does one reset the other?
- [ ] Does the empty state appear and disappear correctly?
- [ ] Are the cards built in a `DocumentFragment` and inserted once?
- [ ] Can I run the whole page with the keyboard only?

## Push it

```bash
git add class3
git commit -m "Day 3 (bonus): DOM-driven dashboard with delegation and live search"
git push
```

---

# Homework

**1. Rebuild a list three ways (45 min).**
Render the same `people` array three times in three containers, using: (a) `createElement` + `append`,
(b) a `<template>` + `cloneNode(true)`, and (c) `insertAdjacentHTML` with a template-literal string (only because
the data is yours — note in a comment why this would be unsafe with user data). Compare the three in a paragraph:
which was clearest, which was fastest to write, which is safest?

**2. Event delegation, proven (30 min).**
Write a `#todo-list` where a single listener on the `<ul>` handles clicks on a per-item delete `<button
data-action="delete">`. Then add new items after the listener is attached and prove deletion still works. Write one
sentence explaining why.

**3. Accessibility pass (30 min).**
Give every interactive element a visible focus ring (Day 1's `:focus-visible`), the correct `aria-pressed` or
`aria-current`, and confirm Tab + Enter drive the whole page. Fix anything you cannot reach with the keyboard.

**4. Guard the nulls (20 min).**
Add an `if (!el) return;` guard to every `querySelector` result before it is used, then delete each guard one at a
time and note which line throws. This builds the reflex for the error message you will see most in this course:
`Cannot read properties of null`.

**5. Reading (20 min).**
MDN: [Introduction to the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction),
[Event bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events), and
[`DocumentFragment`](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment). Type every example into
DevTools as you read.

---

# Checkpoint Quiz

Answer these before moving on. If any takes more than a minute, review that section.

1. What is the difference between your `.html` file and the DOM?
2. Is `document.querySelector` part of the JavaScript language? Explain.
3. `querySelector` vs `querySelectorAll` when the selector matches nothing — what does each return?
4. What is the difference between a `NodeList` and an `HTMLCollection`? Which does `querySelectorAll` return?
5. Why is `querySelectorAll(".card")` a safe snapshot to loop over, but `getElementsByClassName("card")` is not?
6. `textContent` vs `innerHTML` — which is safe with user data, and why?
7. What does `replaceChildren()` with no arguments do?
8. What is `element.dataset` and what type are its values?
9. `data-user-name` in HTML is read in JS as…?
10. What does `classList.toggle("hidden", isOpen)` do exactly?
11. Why should you prefer `classList` over `el.className = ...`?
12. Name the four modern insertion methods and where each puts a node.
13. What is a `DocumentFragment` for, and when is it worth it?
14. `el.children` vs `el.childNodes` — what is the difference?
15. `event.target` vs `event.currentTarget` — which one do you use in delegation, and why?
16. What is event delegation? Why does it survive re-rendering a list?
17. When do you need `event.preventDefault()`?
18. Why is `removeEventListener` unable to remove an inline arrow listener?
19. How do you read all fields of a form at once, and what must each field have?
20. What is layout thrashing, and what is the fix?
21. What is the difference between debounce and throttle? Which fits a search box?
22. Why does a `<div>` with a click handler need extra code that a `<button>` does not?

<details>
<summary>Answers</summary>

1. The file is static text on disk. The DOM is the browser's live tree of objects built from that text; JavaScript mutates the DOM, and reloading rebuilds it from the file.
2. No. The DOM is a browser Web API that JavaScript can call, like `console` and `fetch`. The same JavaScript in Node.js has no `document`.
3. `querySelector` → `null`. `querySelectorAll` → an empty NodeList (`length === 0`).
4. `NodeList` (from `querySelectorAll`) is **static** and has `forEach`. `HTMLCollection` (from `getElementsByClassName`/`getElementsByTagName`) is **live**, updates as the DOM changes, and has no `forEach`.
5. `querySelectorAll` takes a snapshot at call time, so adding cards later does not change it (safe). The live `HTMLCollection` grows as you add cards, so a loop over it can keep finding new items — potentially never ending.
6. `textContent` is safe: it treats the value as plain text and never parses HTML, so a `<script>` becomes visible characters. `innerHTML` parses and executes markup — XSS risk with untrusted data.
7. Removes all of the element's children, leaving it empty.
8. A live object view of the element's `data-*` attributes. All values are **strings**.
9. `element.dataset.userName` — kebab-case in HTML becomes camelCase in JS.
10. Adds the class when `isOpen` is truthy, removes it when falsy.
11. `className = ...` replaces **all** classes with the string given, wiping any you forgot; it also breaks the moment a utility name does not exist. `classList` adds/removes/toggles individual classes and cannot clobber the rest.
12. `append` → last child; `prepend` → first child; `before` → before the element; `after` → after the element.
13. An off-screen container to assemble many nodes so they can be inserted in a single live operation. Worth it when inserting roughly 20+ nodes.
14. `children` contains only element children; `childNodes` includes **all** nodes, so it also counts whitespace text nodes between tags.
15. `event.target` is where the event actually happened (the deepest element); `currentTarget` is where the listener is attached. Delegation uses `event.target.closest(selector)` to walk from the real click target up to the relevant element.
16. One listener on a stable ancestor that decides which child was involved via `event.target.closest(...)`. It survives re-rendering because the listener lives on the container, not on the (replaced) items.
17. When the browser's default action is not what you want — most commonly a form `submit` reloading the page, or a link navigating.
18. `removeEventListener` matches by function **reference**. The inline arrow at the `addEventListener` call site is a new function you no longer hold a reference to, so nothing matches.
19. `new FormData(form)` then `Object.fromEntries(...)`. Every field you want included must have a `name` attribute.
20. Reading a layout property and writing a style repeatedly, forcing a reflow on each pair. Fix: do all reads first, then all writes.
21. Debounce waits until activity stops (search box); throttle caps the rate during activity (scroll/resize). Search → debounce.
22. A `<button>` is focusable, is announced as a button, and activates on Enter/Space automatically. A `<div>` is none of these, so you must add `role`, `tabindex`, and a `keydown` handler yourself — and it is easy to miss one.

</details>

---

# Common Mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Cannot read properties of null` | `querySelector` matched nothing | Guard with `if (el) { ... }`, or verify the selector |
| Script runs but nothing happens | Script ran before the element existed | Put the script at the end of `<body>` or add `defer` |
| `querySelectorAll(...).map is not a function` | A NodeList is not an array | `[...nodeList].map(...)` or `Array.from(...)` |
| Only the first item changed | Used `querySelector` instead of `querySelectorAll` | Use `All` and `forEach` |
| Listener stops working after re-render | A listener was on each card | Delegate to the container |
| `event.target` is an inner `<span>`, not the card | `target` is the deepest element | `event.target.closest(".card")` |
| `closest(...)` result crashes | No ancestor matched → `null` | `if (!card) return;` |
| Form reloads the page | Default submit not prevented | `event.preventDefault()` in the `submit` handler |
| `removeEventListener` does nothing | Anonymous/inline handler | Store the function in a named variable |
| `dataset.count === 5` is never true | `dataset` values are strings | `Number(el.dataset.count) === 5` |
| All classes wiped when setting one | `el.className = ...` | Use `classList.add/remove/toggle` |
| A `<script>` in user text executed | Rendered with `innerHTML` | Use `textContent` |
| Page feels laggy when rendering many rows | One insertion per node | Build in a `DocumentFragment`, insert once |
| Widened layout after a fancy animation | Reading layout in a write loop | Batch reads, then writes |
| Search fires on every keystroke and stutters | No debounce | Debounce the `input` handler |
| `stopPropagation` broke delegation | Wrong tool | Reconsider the structure; usually unneeded |
| Keyboard users cannot activate a control | Faked a button with a `<div>` | Use `<button>`, or add `role`/`tabindex`/`keydown` |

---

# Cheat Sheet

```js
// ---- Select ----
const el    = document.querySelector(".card");           // first or null
const list  = document.querySelectorAll(".card");         // static NodeList
const byId  = document.getElementById("form");            // no "#"
const near  = event.target.closest(".card");              // nearest ancestor (or self), or null
if (el.matches(".active")) { }                            // does it match?
[...document.querySelectorAll(".card")]                   // NodeList → array

// ---- Read / write content ----
el.textContent = "safe";             // text only — default
el.innerHTML   = "<b>trusted</b>";   // parses HTML — never with user data
el.replaceChildren();                // clear
el.replaceChildren(a, b, c);         // replace all children
el.insertAdjacentHTML("beforeend", markup);

// ---- Attributes / classes / style ----
el.getAttribute("href");
el.setAttribute("aria-pressed", "true");
el.hasAttribute("hidden");
el.removeAttribute("hidden");
el.dataset.userId;                   // data-user-id → string
el.classList.add("active");
el.classList.remove("active");
el.classList.toggle("hidden", !isOpen);
el.classList.contains("active");
el.style.setProperty("--progress", "60%");

// ---- Create / insert / remove ----
const node = document.createElement("li");
node.textContent = "New";
parent.append(node);      parent.prepend(node);
node.before(sibling);      node.after(sibling);
node.remove();             node.replaceWith(other);
const frag = document.createDocumentFragment();   // bulk insert
const clone = template.content.cloneNode(true);   // from <template>

// ---- Traverse ----
el.parentElement;
el.children;                       // elements only
el.firstElementChild; el.lastElementChild;
el.previousElementSibling; el.nextElementSibling;
el.contains(other);

// ---- Events ----
el.addEventListener("click", handler);
el.removeEventListener("click", handler);   // same reference
el.addEventListener("click", (e) => {
  e.target; e.currentTarget;
  e.preventDefault();
});

// ---- Event delegation ----
container.addEventListener("click", (e) => {
  const item = e.target.closest("[data-action]");
  if (!item) return;
  handle(item.dataset.action);
});

// ---- Forms ----
input.value;  checkbox.checked;  select.value;
const data = Object.fromEntries(new FormData(form));  // fields need `name`
input.checkValidity();

// ---- Performance ----
const frag = document.createDocumentFragment();  // insert many, once
let ticking = false;                             // throttle scroll/resize
let timer;                                       // debounce input
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { work(); ticking = false; });
});
```

---

# Reference

- [MDN — Document Object Model (DOM)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) — the authority for every method today.
- [MDN — Introduction to the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) — read this first if the tree model is still fuzzy.
- [MDN — Events](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events) — bubbling, capturing and delegation explained with diagrams.
- [whatwg — DOM Standard](https://dom.spec.whatwg.org/) — the spec itself, for when MDN is not precise enough.
- [Chrome DevTools — Elements panel](https://developer.chrome.com/docs/devtools/dom) — inspect, edit and watch the live DOM; the fastest way to debug any selector.
- [javascript.info — Document](https://javascript.info/document) and [Events](https://javascript.info/events) — the clearest free walkthrough of the whole topic.

---

# Tomorrow

You now have every tool to build and change a page by hand: **select → create → insert → listen.** Notice how much
bookkeeping you are doing — clearing a container, rebuilding every card, re-attaching listeners, remembering to use
`textContent`. That bookkeeping is exactly what a framework removes.

- **Next session:** asynchronous JavaScript — the event loop, Promises, `async`/`await`, and `fetch` — so the data
  you render no longer has to live inside your `.js` file.
- **The one idea to carry forward:** the pipeline from Day 3 (`filter → map → forEach`) and today's
  (`createElement → append`) are the same two steps React fuses into a single `render`. When you meet `map()`
  returning elements on Day 7, you will already know what happens underneath.

**Bring:** your `class3` Lab files, working, with delegation and debounced search both functioning. And bring one
moment where the DOM surprised you — we will start there.
