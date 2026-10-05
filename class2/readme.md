# Day 2 — Modern JavaScript Refresher I

**Session length:** ~2.5–3 hours
**Goal of the whole course:** Design, build and deploy a **single-page website using Tailwind CSS**.
**Goal of today:** Make your Day 1 page *do something*. Variables, control flow, loops, functions, and the array methods that drive every modern UI.

> **What changed since Day 1**
> Day 1 gave you a page that says things. Today you give it **behaviour**: a nav that highlights the current
> section, a skills filter, a contact form that validates before it submits, project cards rendered from data
> instead of hand-written HTML.
>
> **How this connects to Tailwind.** Tailwind styles the page. JavaScript changes *what is on* the page — it
> adds and removes classes. Every utility class you learned on Day 1 becomes a token your JavaScript can switch
> on and off: `classList.add('hidden')`, `classList.toggle('dark')`, `classList.remove('text-slate-500')`.
> **HTML + Tailwind = what it looks like. JavaScript = what it does.** Learn both halves and you can build
> the single-page site on Day 6 with behaviour already understood.

---

## Session Plan

| Time | Block | Outcome |
| --- | --- | --- |
| 00:00–00:15 | Where JavaScript lives; the three layers | Page can be interactive |
| 00:15–00:35 | `var` / `let` / `const`, scope, hoisting, TDZ | Correct variable declarations |
| 00:35–00:55 | Operators, truthy/falsy, `===` vs `==` | Reliable conditions |
| 00:55–01:20 | **`if` / `else` / `else if`, ternary, `switch`** | Branching logic |
| 01:20–01:20 | Break | |
| 01:20–01:50 | **Loops: `for`, `for...of`, `for...in`, `while`, `break`/`continue`** | Iteration |
| 01:50–02:10 | Functions: declarations, expressions, arrow functions, `this` | Reusable logic |
| 02:10–02:40 | **`forEach` and `map`** (+ the other array methods) | Data → UI pipelines |
| 02:40–02:55 | Template literals, strings, JSON | Readable generated markup |
| 02:55–03:10 | Destructuring, spread/rest, default parameters, `??` | Modern ergonomics |
| 03:10–03:20 | Modules (`import`/`export`) and strict mode | Ready for React/Vite |
| 03:20–04:00 | Lab: interactive user-card generator + skill filter | Working interactive page |

---

# Part 1 — Where JavaScript Lives

## 1.1 The three layers

```text
HTML  →  what it is          structure      (a form, a button, a list)
CSS   →  how it looks        presentation   (Tailwind utilities)
JS    →  how it behaves      behaviour      (submit, filter, toggle, render)
```

A browser runs three separate engines on one page. JavaScript's job is to read the HTML, then change it —
or change its classes — while the user is looking at it.

## 1.2 Adding a script

```html
<!-- 1. In <head>, blocks the page until it downloads. Avoid. -->
<script src="app.js"></script>

<!-- 2. At the very end of <body>: HTML is parsed, then JS runs. Safe default. -->
<script src="app.js"></script>

<!-- 3. In <head> with defer: parallel download, runs after HTML is parsed. Best. -->
<script src="app.js" defer></script>

<!-- 4. Module: deferred + strict mode + own scope, always. -->
<script type="module" src="app.js"></script>
```

`defer` and `type="module"` both solve the same problem: **the script must not run before the HTML exists.**
If you write `document.querySelector('#nav')` and the `<nav>` has not been parsed yet, you get `null`, and then
`null.classList` throws. This is the single most common first-day JavaScript bug.

## 1.3 The three ways to get an element

```js
// CSS selector — the one you already know from Day 1
const nav = document.querySelector("nav");
const links = document.querySelectorAll("nav a");

// By id — fastest, but ties you to the markup
const form = document.getElementById("contact-form");

// Traversing — relative to another element
const hero = document.querySelector(".hero");
const heading = hero.querySelector("h1");
```

`querySelector` returns **one** element (the first match) or `null`.
`querySelectorAll` returns a **static NodeList** of every match — a snapshot taken at the moment you called it.
It is **not** live: elements added later will not appear in it. That matters constantly when you render a list
from data.

```js
const cards = document.querySelectorAll(".card");   // snapshot: 3 items
// ...later, 5 more cards get added to the DOM
console.log(cards.length);                          // still 3
```

## 1.4 The DOM is a live document object

```text
HTML file on disk          →  what you wrote
DOM (Document Object Model) →  the browser's live, in-memory tree of objects
```

JavaScript never touches your `.html` file. It mutates the **DOM**, and the browser re-renders whatever changed.
Learn these five properties and you can change any page:

| Property | What it does |
| --- | --- |
| `element.textContent` | Replaces all text, safely (no HTML parsed) |
| `element.innerHTML` | Replaces inner markup — **user input is a risk here** |
| `element.classList` | `.add()`, `.remove()`, `.toggle()`, `.contains()` |
| `element.setAttribute()` / `.getAttribute()` | Any HTML attribute, including `disabled`, `aria-*` |
| `element.style` | Inline styles (a last resort — prefer `classList` + Tailwind) |

**`textContent` vs `innerHTML`** — the security difference:

```js
userInput.textContent = "<script>alert('xss')</script>";
// Renders as visible text. Safe.

userInput.innerHTML = "<script>alert('xss')</script>";
// Executes. Never do this with data you did not write yourself.
```

Default rule: **`textContent` for anything that came from a user.** On Day 4, when you `fetch` data from an API,
this becomes a real vulnerability, not a hypothetical one.

## 1.5 `classList` — the Tailwind/JS intersection

This is where Day 6 pays off immediately. Tailwind utilities are just classes, so JavaScript toggles them like
any other class.

```js
const toggle = document.querySelector("#theme-toggle");
const root = document.documentElement;

toggle.addEventListener("click", () => {
  root.classList.toggle("dark");
  const isDark = root.classList.contains("dark");
  toggle.textContent = isDark ? "Light mode" : "Dark mode";
  toggle.setAttribute("aria-pressed", String(isDark));
});
```

```js
// Filter a list by hiding the non-matching cards
function showOnly(category) {
  document.querySelectorAll(".project").forEach((card) => {
    card.classList.toggle("hidden", card.dataset.category !== category);
  });
}
```

`classList.toggle(name, force)` is the one to memorise: the second argument adds the class when `true` and
removes it when `false`. One line does what an `if` block would need four for.

> **Do not** build class names by string concatenation: `el.className = "bg-" + color` overwrites everything and
> breaks if the colour has no utility. Use `classList` and full literal names.

---

# Part 2 — Variables, Scope and Hoisting

## 2.1 `var`, `let`, `const`

```js
var name = "Samira";   // function-scoped. Never use in new code.
let age = 26;          // block-scoped, reassignable.
const role = "Front-end developer";  // block-scoped, cannot be reassigned.
```

| | `var` | `let` | `const` |
| --- | --- | --- | --- |
| Scope | Function | **Block** | **Block** |
| Redeclarable | Yes | No | No |
| Reassignable | Yes | Yes | **No** |
| Hoisted as | `undefined` | Initialised, then live | Initialised, then live |
| Loop variables | Shared — bug | **Per-iteration — correct** | Shared — bug |

**The rule for this course: `const` by default, `let` when you must reassign, `var` never.**

## 2.2 Block scope

`let` and `const` are scoped to the nearest pair of `{}` — not to the nearest function.

```js
if (true) {
  let inside = "visible only here";
  var alsoInside = "leaks out";
}
console.log(alsoInside);   // "leaks out"   ← var ignores the block
// console.log(inside);    // ReferenceError ← let respects it
```

Blocks are created by `if`, `for`, `while`, `switch`, `try`, and plain `{}`. Functions are blocks too, but
functions have their own extra rules.

## 2.3 Hoisting and the temporal dead zone

JavaScript reads your file top to bottom and prepares declarations before running anything.

```js
console.log(a);   // undefined — no crash
var a = 1;

console.log(b);   // ReferenceError: Cannot access 'b' before initialization
let b = 2;
```

```text
                    var              let / const
  ─────────────────  ──────────────  ──────────────────────────────
  declared           hoisted,         hoisted, but held in the
                     value =          "temporal dead zone"
                     undefined        (unusable) until the
                                      declaration line executes
```

The TDZ exists so you cannot read a value before you have assigned one. It is a feature: it catches bugs instead
of silently giving you `undefined`.

```js
// Hoisted, usable before its line — this is why function declarations work anywhere
console.log(add(2, 3));   // 5
function add(a, b) { return a + b; }

// NOT hoisted as a value — only the variable exists
console.log(times(2, 3));  // ReferenceError
const times = (a, b) => a * b;
```

**Practical consequence:** call functions *after* they are defined when using arrow functions and `const`.

## 2.4 `const` freezes the binding, not the value

The single most misunderstood rule in JavaScript.

```js
const profile = { name: "Samira" };

profile.name = "Ada";          // ✅ fine — mutating a property
profile = { name: "Ada" };     // ❌ TypeError — reassigning the binding

const skills = ["HTML", "CSS"];
skills.push("JavaScript");     // ✅ fine
skills = [];                   // ❌ TypeError
```

`const` means "this variable will always point at this thing." It says nothing about whether the thing can change
internally. For things that must not change at all, use `Object.freeze`:

```js
const config = Object.freeze({ theme: "dark", version: 1 });
config.theme = "light";   // silently fails in sloppy mode, throws in strict mode
```

---

# Part 3 — Operators and Truthiness

## 3.1 `===` vs `==`

**Always use `===` and `!==`.** `==` coerces types before comparing, which produces results nobody wants.

```js
0 == "";          // true
0 == false;       // true
"" == false;      // true
null == undefined;      // true
null == 0;              // false
NaN == NaN;             // false  (NaN means "not a number", it equals nothing)
[] == false;           // true
[1] == 1;              // true

0 === "";         // false
null === undefined;  // false
NaN === NaN;         // false  (must use Number.isNaN)
[] === false;      // false
```

The rule: **`===` compares type first, then value.** If the types differ, the answer is immediately `false`, with
no coercion.

The one exception worth knowing:

```js
// To compare against null AND undefined in one check, == is the standard idiom
if (value == null) {   // matches null and undefined, but not 0, "", false
  return "no value";
}
```

## 3.2 Truthy and falsy

Only eight values are falsy. Everything else is truthy.

```text
FALSY                        TRUTHY
──────────────────────       ──────────────────────────
false                        "0"      ← non-empty string
0                            " "      ← whitespace is truthy
-0                           []       ← empty array is truthy
0n                           {}       ← empty object is truthy
""                           null     ← not falsy, it is nullish
null
undefined
NaN
```

```js
if (items.length) { }    // ✅ use the truthiness of a number
if (items.length > 0) { } // ✅ more explicit — prefer this when it is not obvious
```

Two traps worth internalising:

```js
[0, 1, 2].indexOf(0);         // 0  ← falsy! "not found" bugs
if ([0, 1, 2].indexOf(0)) { }  // ❌ the body never runs

if ([]) { console.log("yes"); } // logs — empty arrays are truthy
```

## 3.3 Logical operators

```js
const age = 26;

age > 18 && age < 65     // true  — AND
age < 18 || age > 65     // false — OR
!age                     // false — NOT
```

**`&&` and `||` return one of their operands, not a boolean.** This is the key to every default-value pattern you
will write for the next few years.

```js
const input = document.querySelector("#name");
const name  = input.value || "Anonymous";    // fallback when input.value is ""
const name2 = input.value && "has a value";  // returns "" — falsy, not false
```

**`??` — nullish coalescing.** `||` also replaces `0`, `""`, and `false`, which is wrong for numbers and
booleans. `??` only replaces `null` and `undefined`.

```js
const port = config.port ?? 3000;      // keeps a deliberate 0

const total = options.total || 100;    // ❌ a total of 0 becomes 100
const total2 = options.total ?? 100;   // ✅ 0 stays 0
```

**Rule:** use `||` for fallback when a falsy value is also invalid; use `??` when `0` and `""` are legitimate.

**`?.` — optional chaining.** Day 4 you will `fetch` JSON from an API and no field is guaranteed.

```js
const city = data?.address?.city;
const city2 = data.address.city;     // TypeError if data is null
const city3 = data?.address?.city ?? "Unknown";
```

**`??` and `?.` cannot be mixed with `&&` or `||` without parentheses** — the language forbids it because the
result would be ambiguous.

```js
const value = a ?? b || c;    // SyntaxError
const value2 = (a ?? b) || c; // fine
```

## 3.4 The ternary operator

```js
const status = age >= 18 ? "adult" : "minor";
```

Equivalent to:

```js
let status;
if (age >= 18) {
  status = "adult";
} else {
  status = "minor";
}
```

Use a ternary for **two** outcomes only. Chain more than two and you have written unreadable code — use `if /
else if` instead.

---

# Part 4 — `if`, `else`, and `else if`

## 4.1 The three forms

```js
// 1. if
if (score > 90) {
  console.log("A");
}

// 2. if / else — exactly one branch runs
if (isLoggedIn) {
  showDashboard();
} else {
  showLoginForm();
}

// 3. if / else if / else — first match wins, then it stops
if (score >= 90)      grade = "A";
else if (score >= 75) grade = "B";
else if (score >= 60) grade = "C";
else                  grade = "F";
```

**The evaluation order is the whole point.** JavaScript checks top to bottom and runs the **first** `if` whose
condition is truthy, then exits the chain. Order your conditions from most specific to least specific.

```js
// ❌ Wrong order: 95 is also > 60, so everyone gets "C"
if (score > 60)       console.log("C");
else if (score > 75)  console.log("B");
else if (score >= 90) console.log("A");

// ✅ Right order: narrowest first
if (score >= 90)      console.log("A");
else if (score > 75)  console.log("B");
else if (score > 60)  console.log("C");
```

## 4.2 Rules that prevent most `if` bugs

1. **Braces always.** No exceptions, not even for one line. Style consistency beats saved keystrokes.
2. **No `=` where you meant `===`.** Assigning inside a condition is legal and almost never what you meant.
   Modern ESLint flags `if (x = 5)`. To assign *and* branch on purpose, wrap it: `if ((x = 5)) { }`.
3. **Do not compare a boolean to a string.** `if (isOpen === "true")` fails when `isOpen` is a real boolean
   coming from a checkbox or an API. Write `if (isOpen)`.
4. **Guard clauses beat nesting.** Return early instead of wrapping the happy path in `else`.

```js
// ❌ Nested — the "arrow of doom"
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.customer) {
        if (order.customer.email) {
          charge(order);
          email(order.customer.email);
          log("done");
        }
      }
    }
  }
}

// ✅ Guard clauses — same logic, one indentation level
function processOrder(order) {
  if (!order) return "No order";
  if (order.items.length === 0) return "Cart is empty";
  if (!order.customer) return "No customer";
  if (!order.customer.email) return "No email address";

  charge(order);
  email(order.customer.email);
  log("done");
  return "Processed";
}
```

**Maximum nesting depth: two.** If you hit three, extract a function or early-return.

## 4.3 Combining conditions

```js
// AND — both must be true
if (user && user.isAdmin && user.token) { }

// OR — at least one must be true
if (email || phone) { }

// NOT
if (!form.checkValidity()) { }

// Ranges — use &&, not a between-operator (JS has none)
if (score >= 60 && score <= 100) { }
```

Do **not** nest `&&` inside `||` without parentheses — the precedence is correct but the reader's confidence is not.

```js
if (role === "admin" || role === "owner" && hasActiveSubscription) {
  // Reads as: admin OR (owner AND subscription) — not what most people assume
}

// Say it explicitly
if (role === "admin" || (role === "owner" && hasActiveSubscription)) { }
```

## 4.4 `switch` — many values of one variable

```js
function getStatusCode(code) {
  switch (code) {
    case 200:
      return "OK";
    case 201:
      return "Created";
    case 400:
      return "Bad Request";
    case 404:
      return "Not Found";
    case 500:
      return "Server Error";
    default:
      return "Unknown";
  }
}
```

How `switch` actually works:

1. Evaluate the expression once.
2. Compare with each `case` using **strict** `===`.
3. On a match, **run from there downward** until it hits `break` or `return`.
4. If nothing matches, run `default` if present.

**The fall-through is the trap.** Without `break`, cases stack:

```js
// ❌ 30 also returns "Small"
function size(n) {
  switch (n) {
    case 50: return "Large";
    case 30: return "Small";
  }
}

// ✅ Grouping is the *useful* form of fall-through
function plan(plan) {
  switch (plan) {
    case "pro":
    case "team":              // deliberate fall-through
      return { seats: 20, support: "priority" };
    case "free":
      return { seats: 1, support: "none" };
    default:
      return null;
  }
}
```

| Need | Use |
| --- | --- |
| Two branches | ternary |
| Two to five related conditions | `if / else if / else` |
| One variable, many exact values | `switch` |
| Many ranges or complex expressions | `if / else if` — `switch` cannot do ranges |

Add `default:` always. An unhandled input returning `undefined` from a `switch` is a bug waiting for a user to find.

---

# Part 5 — Loops

## 5.1 The four loops you need

```js
// for — count
for (let i = 0; i < 5; i++) { console.log(i); }        // 0 1 2 3 4

// for...of — values of an iterable (array, string, Map, Set)
for (const name of names) { console.log(name); }

// for...in — keys of an object
for (const key in user) { console.log(key, user[key]); }

// while — unknown number of iterations, condition checked first
let attempts = 0;
while (attempts < 3) { attempts++; }

// do...while — runs at least once
let n = 0;
do { console.log(n); n++; } while (n < 3);
```

## 5.2 Anatomy of `for`

```js
for (let i = 0; i < 5; i++) {
  //      │      │      │
  //      │      │      └── 4. update, run after each iteration
  //      │      └───────── 3. condition — false means stop
  //      └──────────────── 2. body, run each iteration
  └──────────────────────── 1. initialise, run once
}
```

**Off-by-one errors** come from mixing `<` and `<=`:

```js
arr.length        // 3 for a 3-item array
i <= arr.length   // ❌ runs 4 times, last index is undefined
i < arr.length    // ✅ runs 3 times
```

## 5.3 `for...of` vs `for...in`

This is the most important distinction in the section.

```js
const skills = ["HTML", "CSS", "React"];

// for...of → VALUES
for (const skill of skills) console.log(skill);
// "HTML", "CSS", "React"

// for...in → KEYS (as strings) — for arrays this is INDICES
for (const key in skills) console.log(key);
// "0", "1", "2"
```

| | `for...of` | `for...in` |
| --- | --- | --- |
| Iterates | **Values** | **Keys** |
| Works on | Array, string, `Map`, `Set`, anything iterable | Plain objects |
| On an array | The items | The index numbers as strings |
| Type of key | — | Always a string |

```js
// for...in on an array — never do this
for (const i in skills) console.log(typeof i);   // "string" every time

// for...of on an object — throws, objects are not iterable
for (const v of { a: 1 }) { }   // TypeError
```

```js
// ✅ Correct usage of each
for (const skill of skills) {
  console.log(skill);
}

for (const key in user) {
  if (Object.hasOwn(user, key)) {     // skip inherited keys
    console.log(key, user[key]);
  }
}
```

Prefer `Object.entries()` — it gives you both at once, correctly:

```js
for (const [key, value] of Object.entries(user)) {
  console.log(key, value);
}
```

## 5.4 `break` and `continue`

```js
for (const n of numbers) {
  if (n === 0) continue;   // skip to the next iteration
  if (n > 100) break;       // leave the loop entirely
  console.log(n);
}
```

Order matters — test `break` conditions before `continue` conditions when both could apply.

```js
// labelled break — escape nested loops (rare; prefer a helper function)
outer: for (const row of matrix) {
  for (const cell of row) {
    if (cell === target) break outer;
  }
}
```

## 5.5 The `let` closure trap

Why `let` exists in `for` loops at all:

```js
// ❌ var — all three closures print 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}

// ✅ let — a fresh binding per iteration: 0, 1, 2
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}
```

You will hit this for real when you write event listeners in a loop — a very common pattern for the project
cards on your one-page site:

```js
// ❌ every button reports "card 2"
cards.forEach(function (card, index) {
  button.addEventListener("click", () => alert(card.dataset.title + index));
});

// ✅ let captures the correct value
cards.forEach(function (card, index) {
  const title = card.dataset.title;
  button.addEventListener("click", () => alert(title));
});
```

The same trap applies to `var` inside a `forEach` callback — there is no `let` binding at all, so you need an
explicit local `const`.

## 5.6 When to reach for a real loop

You will write traditional `for` loops far less than you expect. Decision table:

| Situation | Use |
| --- | --- |
| Iterate an array to **build** a new array | `map` |
| Iterate an array to **do something** (log, add class, call API) | `forEach` |
| Iterate an array to **keep some** | `filter` |
| Iterate an array to **stop early** on a match | `for...of` + `break`, or `find` |
| Iterate an array to **accumulate** one value | `reduce` |
| Iterate an array for a **plain index count** | `for` |
| Iterate object keys | `Object.entries()` |

The one place a classic `for` wins is when you need the index *and* want to `break` — `map` and `filter` always
visit every element.

---

# Part 6 — Functions

## 6.1 Three declarations, one behaviour difference

```js
// 1. Function declaration — hoisted and fully usable before its line
function add(a, b) {
  return a + b;
}

// 2. Function expression — the variable exists, the value does not, until the line runs
const add = function (a, b) {
  return a + b;
};

// 3. Arrow function — expression form, concise, lexical `this`
const add = (a, b) => {
  return a + b;
};
```

| | Declaration | Expression | Arrow |
| --- | --- | --- | --- |
| Hoisted | **Yes, completely** | No (value only) | No (value only) |
| `this` | Dynamic | Dynamic | **Lexical** |
| `new` usable | Yes | Yes | **No** |
| `prototype` | Has one | Has one | **None** |
| `arguments` | Yes | Yes | **No** |

```js
// Block body — multiple statements needs braces and explicit return
const toFull = (first, last) => {
  const middle = " ";
  return first + middle + last;
};

// Expression body — implicit return, no braces
const toFull = (first, last) => `${first} ${last}`;

// Single parameter: parens optional
const double = x => x * 2;
```

**The `this` difference, concretely:**

```js
const timer = {
  seconds: 0,
  startRegular() {
    setInterval(function () {
      this.seconds += 1;          // ❌ `this` is the interval callback, not `timer`
      console.log(this.seconds);  // NaN
    }, 1000);
  },
  startArrow() {
    setInterval(() => {
      this.seconds += 1;          // ✅ `this` is `timer`, captured lexically
      console.log(this.seconds);  // 1, 2, 3
    }, 1000);
  },
};
```

A regular function's `this` depends on **how it is called**. An arrow function's `this` is fixed to wherever it
was **written**. That single rule explains every `this` bug you will ever have.

```js
const button = document.querySelector("#menu");

// ❌ detached — called with no receiver, so `this` is undefined
const handler = button.addEventListener;
handler("click");

// ✅ bound — call it as a method of `button`
button.addEventListener("click", function () { this.classList.toggle("open"); });

// ✅ or bind it explicitly
const open = function () { this.classList.add("open"); }.bind(button);
```

Use a regular function for object methods, event handlers needing `this`, and constructors. Use an arrow for
callbacks, `map`/`filter` callbacks, and anything that should inherit `this`.

## 6.2 Parameters, `arguments` and defaults

```js
function greet(name, title = "Engineer") {
  return `Hello ${name}, ${title}`;
}

greet("Samira");               // "Hello Samira, Engineer"
greet("Samira", "Developer");  // "Hello Samira, Developer"
```

**Default parameters only apply when the argument is `undefined`** — passing `null` or `""` keeps that value.

```js
function count(items = []) {
  return items.length;
}
count();        // 0  ✅
count(undefined) // 0  ✅
count(null);    // 💥 TypeError — default did not apply
```

The `= []` pattern matters: a default parameter lets you call the function with no arguments at all, instead of
crashing.

Arrow functions have **no `arguments`**. If you need it, use a rest parameter:

```js
function logAll() {
  console.log(arguments.length);   // 3
}
const logAll = (...args) => {
  console.log(args.length);        // 3
};
```

## 6.3 Named arguments (ES6, worth knowing)

```js
function render({ title, subtitle = "Untitled", tags = [] }) {
  return `${title} — ${subtitle} (${tags.length})`;
}

render({ title: "Weather App", tags: ["react", "api"] });
```

Destructuring in the parameter list — the same syntax you will use for React props on Day 7. Master it here.

---

# Part 7 — `forEach` and `map`

These two are the backbone of every data-driven UI you will build. Learn the difference properly and the rest of
the array methods become obvious.

## 7.1 The mental model

```text
forEach  →  "do this for each item"           →  returns undefined
map      →  "turn each item into a new item"  →  returns a NEW array
```

Think of a **pipeline**:

```js
rawData  →  filter()  →  map()  →  map()  →  forEach()  →  the DOM
            keep        reshape   reshape    do the thing
```

**Everything before `forEach` builds data. `forEach` performs the side effect.** That single rule keeps you from
writing side effects inside `map`.

## 7.2 `forEach` — side effects, one item at a time

```js
const skills = ["HTML", "CSS", "JavaScript"];

skills.forEach(function (skill, index, array) {
  console.log(`${index}: ${skill}`);
});
// 0: HTML
// 1: CSS
// 2: JavaScript
```

Signature: `callback(element, index, array)`. You rarely need the third argument — it exists mostly for
`array.slice.call(...)` tricks you will never use.

### The real job: reacting to each item

```js
document.querySelectorAll(".skill").forEach(function (chip, index) {
  chip.style.setProperty("--delay", `${index * 60}ms`);
});
```

```js
// Update the character count as the user types
const input  = document.querySelector("#message");
const output = document.querySelector("#count");

input.addEventListener("input", function (event) {
  output.textContent = `${event.target.value.length} / 500`;
});
```

### Three things `forEach` cannot do

**1. It cannot `break` or `continue`.** There is no way to stop early — that is a hard API limitation, not an
oversight.

```js
// ❌ silently does nothing — break outside a loop is a syntax error
skills.forEach(s => { if (s === "CSS") break; });

// ✅ use for...of
for (const s of skills) { if (s === "CSS") break; }

// ✅ or findIndex
skills.findIndex(s => s === "CSS");
```

**2. It returns `undefined`.** Chaining fails:

```js
skills.forEach(...).filter(...);   // TypeError: Cannot read properties of undefined
```

**3. An empty array does nothing.** `forEach` on `[]` never calls your callback — so a validation function built
with `forEach` that only reports errors will stay silent. Return a result, or use `some`/`every`.

## 7.3 `map` — transform, return a new array

```js
const skills = ["HTML", "CSS", "JavaScript"];

const upper = skills.map((skill) => skill.toUpperCase());
console.log(upper);    // ["HTML", "CSS", "JAVASCRIPT"]
console.log(skills);   // ["HTML", "CSS", "JavaScript"]  ← unchanged
```

`map` is pure with respect to the source array: **same length, new array, original untouched.**

### The three `map` mistakes

**Mistake 1 — forgetting to `return`.** `map` returns the *results* of your callback. A callback that logs
instead of returning produces an array of `undefined`.

```js
// ❌ ["undefined", "undefined", "undefined"]
skills.map((s) => console.log(s));

// ❌ same problem, the braces are hiding it
skills.map((s) => { console.log(s); });

// ✅
skills.map((s) => s.toUpperCase());
skills.map((s) => { return s.toUpperCase(); });
```

**Mistake 2 — returning nothing useful inside a template literal.** This one is subtle and costs real time.

```js
// ❌ works, but you cannot chain afterwards
skills.map((s) => { console.log(`<li>${s}</li>`); });

// ✅ return the markup
skills.map((s) => `<li class="chip">${s}</li>`);
```

**Mistake 3 — passing a function that receives an index.**

```js
["1", "2", "3"].map(parseInt);
// [1, NaN, NaN]

// Why: map calls fn(element, index, array)
// parseInt("1", 0)   → 1
// parseInt("2", 1)   → parses "2" in base 1 → NaN
// parseInt("3", 2)   → parses "3" in base 2 → NaN

// ✅ wrap it so the index never arrives
["1", "2", "3"].map((s) => parseInt(s, 10));
```

### `map` on things that are not arrays

```js
// ❌ strings and NodeLists have no .map
"abc".map(...)
document.querySelectorAll(".card").map(...)   // TypeError

// ✅ convert first
[..."abc"].map((ch) => ch.toUpperCase());
Array.from(document.querySelectorAll(".card")).map(...);
```

Spread on a string splits by code point, which also handles emoji correctly:

```js
"👍".length;              // 2 (UTF-16 units)
[..."👍"].length;         // 1 (code points)  ✅
```

## 7.4 The comparison table

| | `forEach` | `map` | `filter` | `reduce` |
| --- | --- | --- | --- | --- |
| Returns | `undefined` | New array, same length | New array, shorter or equal | One value of any type |
| Callback returns | Nothing | One new item | A **boolean** | Accumulator |
| Length of result | — | Same as source | ≤ source | Always 1 |
| Mutates source? | Only if you make it | **Never** | **Never** | Only if you make it |
| Use when | Side effects | Transforming | Selecting | Folding to one value |

```js
const scores = [88, 42, 95, 67, 31];

scores.forEach((s) => console.log(s));            // log each
scores.map((s) => s / 10);                          // [8.8, 4.2, 9.5, 6.7, 3.1]
scores.filter((s) => s >= 60);                      // [88, 95, 67]
scores.reduce((sum, s) => sum + s, 0);              // 323
```

## 7.5 The rest of the toolbox

```js
const scores = [88, 42, 95, 67, 31];

scores.find((s) => s > 60);        // 88     first match, or undefined
scores.findIndex((s) => s > 60);   // 0
scores.some((s) => s > 90);        // true    at least one
scores.every((s) => s > 30);       // false   all of them
scores.includes(95);               // true    exact match
scores.indexOf(95);                // 2       use only with index, see the 0 trap

const pass = scores.filter((s) => s >= 60);   // [88, 95, 67]
pass.reduce((sum, s) => sum + s, 0);          // 250
```

**`find` vs `filter`:** one result vs many. **`some`/`every` vs `filter`:** a boolean vs the items themselves. Choose
the narrowest one that answers your question — do not `filter` just to read `.length` when `some` would do.

### `reduce` — the one that looks scary

`reduce` folds an array into a single value. It takes two things: a **running accumulator** and the
**initial value**.

```js
scores.reduce(function (accumulator, currentValue, index, array) {
  return accumulator + currentValue;
}, 0);   // ← the initial value. Always pass it.
```

```js
const total = scores.reduce((sum, s) => sum + s, 0);        // number
const max   = scores.reduce((m, s) => (s > m ? s : m), -Infinity);
const bySubject = students.reduce(function (groups, student) {
  const key = student.subject;
  (groups[key] ??= []).push(student.name);
  return groups;
}, {});
```

**Always pass the initial value.** Without it, `reduce` uses the first element as the accumulator — and it
**throws a `TypeError` on an empty array**:

```js
[].reduce((a, b) => a + b);              // 💥 TypeError
[].reduce((a, b) => a + b, 0);           // ✅ 0
```

The initial value also decides the result type. `0` for sums, `""` for strings, `[]` for arrays, `{}` for
objects.

### Building a DOM from data — the real payoff

```js
const projects = [
  { title: "Weather App", tags: ["react", "api"], live: true },
  { title: "Bike Repair Log", tags: ["pwa"], live: false },
];

const container = document.querySelector("#projects");

container.replaceChildren();

projects
  .filter((project) => project.live)          // 1. filter
  .map((project) => `<article class="card">   // 2. map to markup
      <h3>${project.title}</h3>
      <ul>${project.tags.map((t) => `<li>${t}</li>`).join("")}</ul>
    </article>`)
  .forEach((html) => {                        // 3. one side effect per item
    const article = document.createElement("div");
    article.innerHTML = html;                  // safe: our own data
    container.append(article);
  });
```

Read it top to bottom: **select → reshape → act.** That is the whole pattern. On Day 7 you will write the exact
same pipeline in React, with `render` instead of `forEach` and `useState` instead of `replaceChildren`.

---

# Part 8 — Template Literals and Strings

## 8.1 Backticks

```js
const name  = "Samira";
const role  = "Front-end developer";
const count = 12;

// ❌ string concatenation — brittle, easy to break
const bio = name + " is a " + role + " with " + count + " projects.";

// ✅ template literal — readable, spans lines
const bio = `${name} is a ${role} with ${count} projects.`;
```

```js
const card = `
  <article class="card">
    <h3>${project.title}</h3>
    <p>${project.description}</p>
  </article>
`;
```

The leading newline and indentation are real characters. Strip them with `.replace(/\n\s*/g, "")` or `.trim()`, or
put the backtick on the same line as the first character.

## 8.2 Escaping

Inside `` ` `` or `${ }`, a literal backtick or `${` needs a backslash:

```js
const message = `He said \`hello\``;
const literal = `Use \${braces} literally`;
```

## 8.3 Strings are immutable

Strings cannot be modified. Every "change" makes a new string.

```js
let s = "hello";
s[0] = "j";        // ❌ silently ignored — strings are read-only
s = s.toUpperCase(); // the only way: reassign
```

Use `let`, not `const`, for anything you will reassign.

## 8.4 The string methods you will actually use

```js
const email = "  Samira@Example.COM  ";

email.trim();                    // "Samira@Example.COM"
email.toLowerCase();             // "samira@example.com"
email.includes("@");             // true
email.startsWith("samira");      // true
email.split("@")[1];             // "example.com"
email.replace("Samira", "Ada");  // "  Ada@example.com  " (first only)
email.replaceAll("@", "-");      // "  Samira-Example-COM  "
email.slice(0, 7);               // "  Samira"
email.at(-1);                    // " " — last char (modern; email.at(-1) fails on old Safari)
```

```js
// Splitting and joining is the workhorse
"HTML, CSS, React".split(", ");              // ["HTML", "CSS", "React"]
["HTML", "CSS", "React"].join(" • ");        // "HTML • CSS • React"
"hello world".split("");                     // ["h","e","l","l","o"," ","w",...]
[..."hello"].reverse().join("");              // "olleh"
```

Case-insensitive comparison, done correctly:

```js
const a = "Admin", b = "admin";
a.toLowerCase() === b.toLowerCase();   // ✅ true
a === b;                                // ❌ false
```

Use `.trim()` on **every** input before comparing. A user pasting from a spreadsheet brings a trailing space, and
it will break your validation in ways that look like a JavaScript bug.

---

# Part 9 — Destructuring, Spread, Rest

## 9.1 Destructuring

```js
const user = { name: "Samira", role: "Developer", city: "Lagos" };

// Object — pull values out by key
const { name, role } = user;
const { name: userName } = user;          // rename
const { country = "Nigeria" } = user;     // default
const { address: { street = "Unknown" } } = user;   // nested (throws if address is undefined)

// Array — pull by position
const [first, second, third] = ["HTML", "CSS", "React"];
const [, , thirdOnly] = ["HTML", "CSS", "React"];   // skip with holes
const [head, ...tail] = ["a", "b", "c", "d"];       // "a" and ["b","c","d"]

// Swapping without a temp variable
let a = 1, b = 2;
[a, b] = [b, a];
```

**Nesting a destructure is a silent crash waiting to happen:**

```js
const { address: { street } } = user;
// 💥 TypeError if user.address is undefined
```

Guard it when the source is not under your control:

```js
const street = user.address?.street ?? "Unknown";
```

## 9.2 Spread — expand into many

```js
// Arrays
const base = ["HTML", "CSS"];
const all  = [...base, "React"];        // ["HTML","CSS","React"]
const copy = [...base];                 // a new array

// Objects
const defaults = { theme: "light", font: "system" };
const settings = { ...defaults, theme: "dark" };   // later wins → dark

// Spreading a string or NodeList
[..."abc"];      // ["a","b","c"]
[...document.querySelectorAll("li")];  // a real array

// Function arguments — the Math.max trick
Math.max(...[3, 9, 2]);   // 9, because Math.max takes (a, b, c)
```

**Spread is one level deep.** Nested objects are shared by reference, not copied:

```js
const original = { user: { name: "Samira" }, theme: "light" };
const copy = { ...original };
copy.user.name = "Ada";    // ⚠️ original.user.name is now "Ada" too
```

```js
// ✅ deep copy
const copy = structuredClone(original);              // modern, handles Maps/Dates
const copy = JSON.parse(JSON.stringify(original));   // older fallback, loses Dates
```

**Remove a key with rest:**

```js
const { password, ...safeUser } = user;   // safeUser has everything except password
```

This is the standard pattern for logging a user object without leaking credentials — the same destructuring
pattern returns `const { id, ...rest } = props` in React.

## 9.3 Rest — collect many into one

Same `...`, different direction.

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3);   // 6

function log(level, ...messages) {
  messages.forEach((m) => console.log(`[${level}] ${m}`));
}
log("info", "server up", "port 3000");
```

```js
// Object rest — the common one
const { theme, ...everythingElse } = settings;
```

| | Spread `...x` | Rest `...x` |
| --- | --- | --- |
| Position | Right of `=` or in `{ }` | Left side of a destructuring pattern |
| Direction | Array/object → many values | Many values → array/object |
| Purpose | Copy, merge, extend | Collect, forward |

## 9.4 `??` in destructuring defaults — the safe pattern

```js
function connect({ host = "localhost", port = 3000 } = {}) {
  return `${host}:${port}`;
}

connect();                            // "localhost:3000" ✅
connect({ port: 8080 });              // "localhost:8080" ✅
connect(undefined);                   // "localhost:3000" ✅
connect({});                           // "localhost:3000" ✅

// Without the `= {}`:
function connect({ host = "localhost" }) {}
connect();                            // 💥 TypeError: cannot destructure undefined
```

The `= {}` is what makes the parameter optional. You will write this exact pattern for React component props.

---

# Part 10 — Modules and Strict Mode

## 10.1 `import` / `export`

```js
// math.js
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;
export const VERSION = "1.0.0";     // named export — curly braces

export default function calculator() {}   // default export — one per file

// app.js
import calculator, { add, sub } from "./math.js";   // default + named together
import * as math from "./math.js";                   // everything as an object
```

Two named exports on one line, or separate lines — style only.

```js
import { add, sub } from "./math.js";
import { add, sub as subtract } from "./math.js";   // rename on import
```

## 10.2 Modules are strict by default

`<script type="module">` and every `.js` file in Vite/Node run in **strict mode**. This is why:

- Assigning to an undeclared variable throws instead of creating a global.
- `this` at the top level of a module is `undefined`, not `window`.
- Deleting a variable throws.

```js
// main.js — no need for "use strict"; it is already on
```

You will write `import`/`export` from Day 6 (Vite + Tailwind) and every day after. Get used to the syntax now.

## 10.3 JSON — the bridge to data

```js
const json = '{"name":"Samira","tags":["HTML","CSS"]}';

const user = JSON.parse(json);        // string → object
const text = JSON.stringify(user);    // object → string

JSON.stringify(user, null, 2);        // pretty-printed
```

`JSON.parse` returns real objects and arrays, so `map`, `filter`, and destructuring all work on them immediately.

```js
const posts = JSON.parse('[' +
  '{"title":"A","tags":["react"]},' +
  '{"title":"B","tags":["css","api"]}' +
  ']');

posts.filter((p) => p.tags.includes("api")).map((p) => p.title);   // ["B"]
```

Full async/JSON fetching is Day 4. This is the syntax that makes it possible.

---

# Lab — Interactive User Card Generator

**Time:** 60 minutes. **Deliverable:** `class2/index.html`, `class2/app.js`, `class2/styles.css`.

Carry over Day 1's page and make it live. Every skill below uses something from today.

## Lab 1 — Variables and data (10 min)

1. Start from Day 1's `index.html` and `styles.css`.
2. Add `<script type="module" src="app.js" defer></script>` to `<head>`.
3. Create `app.js` with a `const users` array of **five** objects. Each needs `name`, `role`, `city`,
   `skills` (array), `available` (boolean).
4. Create `app.js` and declare every top-level variable with `const` — except a counter you will increment.

```js
const users = [
  { name: "Samira Okonkwo", role: "Front-end developer", city: "Lagos", skills: ["HTML", "CSS", "JS"], available: true },
  { name: "Daniel Reyes", role: "Back-end developer", city: "Manila", skills: ["Node", "MongoDB"], available: false },
];
```

## Lab 2 — `if` / `else` (10 min)

Write `renderStatus(user)` that returns a string:

- `available` is `true` → `"Available for work"`
- `available` is `false` **and** `skills.length > 2` → `"Busy, but interesting"`
- `available` is `false` and `skills.length <= 2` → `"Not looking"`

Use `if` / `else if` / `else`. Now use a **ternary** to decide whether to show the badge at all — render nothing
when `available` is `false` and the user has fewer than 2 skills.

```js
const html = user.available
  ? `<span class="badge">Available</span>`
  : "";
```

## Lab 3 — Loops (10 min)

1. Use a **`for` loop** to compute the total number of skills across all users, and write it into
   `#skill-count` with `textContent`.
2. Use **`for...of`** to build the list of all unique cities, joined with `" • "`, into `#cities`.
3. Use **`for...in`** to log every key of the **first** user object to the console.
4. Add a `for...of` loop with a `break` that stops at the first user named `"Daniel Reyes"` and reports their
   city. This is the "stop early" case `forEach` cannot handle.

## Lab 4 — `forEach` and `map` (15 min)

1. **`map`** each user to an `<article>` card of markup with `class="card"`, containing: name, role, city,
   the status from Lab 2, and the skills as `<li>` items. Use a nested `map` for the skills, joined into one
   string.
2. **`forEach`** over the resulting array: for each markup string, `createElement("a")`, set `innerHTML`, set
   `href`, and `append` it into `#user-grid`.
3. Show the count: `"3 of 5 users"`. Remember `.length` of a filtered array can be `0` — never guard with a
   truthy `if`, use `> 0`.

```js
const visible = users.filter((user) => user.skills.length > 0);
countEl.textContent = `${visible.length} of ${users.length} users`;
```

## Lab 5 — Interactivity with `classList` (15 min)

1. Add filter buttons: **All**, **Available**, **Front-end**, **Back-end**. Use `<button type="button">` with
   `data-filter` attributes.
2. On click, `forEach` over every card, `classList.toggle("hidden", !matchesFilter(card, activeFilter))`.
3. Write the matching logic with `if` / `else if`.
4. Add a **dark mode toggle** on `<html>` with `classList.toggle("dark")`, and remember the choice with
   `localStorage`.
5. Mark the active button with `aria-pressed="true"`.
6. Add a live search box: on `input`, filter by name or role, case-insensitively with
   `.toLowerCase().includes(query.toLowerCase())`.

```js
const query = searchInput.value.trim().toLowerCase();
const matches = user.name.toLowerCase().includes(query);
```

7. Empty state: when zero cards are visible, show a `<p id="empty">` with `textContent` — and hide it otherwise.

## Self-review before you move on

- [ ] Does `strictMode` reveal any error in the console? Fix every one.
- [ ] Did I use `const` everywhere except the one counter?
- [ ] Is every `if` written with `else if` **before** the broad `else`?
- [ ] Does any `map` callback return `undefined` by accident?
- [ ] Does any user-supplied value go through `innerHTML`? It must be `textContent`.
- [ ] Can I search, filter, and toggle dark mode without a page reload?
- [ ] Does the dark mode choice survive a refresh?
- [ ] Does Tab reach every button, and does Enter activate it?

## Push it

```bash
git add class2
git commit -m "Day 2: interactive user cards with control flow, loops and array methods"
git push
```

---

# Homework

**1. Refactor 10 ES5 snippets (45 min).**
Take these ten patterns and rewrite each in modern ES6+. Write down what changed and why.

```js
// 1
var name = "Samira";
function greet() { return "Hello " + name; }

// 2
var arr = [1, 2, 3];
var doubled = arr.map(function (n) { return n * 2; });

// 3
var nums = [1, 2, 3, 4, 5];
var evens = [];
for (var i = 0; i < nums.length; i++) {
  if (nums[i] % 2 === 0) evens.push(nums[i]);
}

// 4
var obj = { a: 1, b: 2 };
var keys = Object.keys(obj);

// 5
function sum() {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) total += arguments[i];
  return total;
}

// 6
var config = { host: "localhost" };
var host = config.host || "127.0.0.1";

// 7
var users = [{ first: "Samira", last: "Okonkwo" }];
users.forEach(function (u) { console.log(u.first + " " + u.last); });

// 8
function getName(user) { return user.profile.name; }

// 9
var skills = ["HTML", "CSS"];
var copy = skills.slice();

// 10
if (x == "5") { console.log("five"); }
```

Expected answers in short: `const` + template literals, arrow functions, `filter`, `Object.keys` destructure,
rest parameters, `??`, `for...of`, optional chaining `?.`, spread copy, `===`.

**2. Array methods drills (40 min).**
Starting from `const nums = [3, 7, 12, 5, 18, 1]`:

- `map` → double every number
- `filter` → keep only odd numbers
- `filter` + `map` → keep odd numbers, then square them
- `reduce` → the sum, with an initial value of `0`
- `reduce` → the largest number, with an initial value of `-Infinity`
- `find` → the first number greater than `10`
- `some` → does any number exceed `15`?
- `every` → are all numbers positive?
- `map` → convert `[1,2,3]` to `["1st","2nd","3rd"]` using the index
- `reduce` → build `{ even: [...], odd: [...] }`

Then: which of your answers could be written with a **loop**, and would the loop or the method be clearer?

**3. Build a real filter (45 min).**
Add a **sort control** (alphabetical / most skills / city) to the Lab page.

- Use `slice()` first — `sort` mutates the array it is called on. Sort a copy, never your source data.
- `[].sort()` sorts as strings: `[10, 9, 1].sort()` → `[1, 10, 9]`. Pass a comparator with
  `(a, b) => a - b` for numbers.
- The sort must not break the active filter or the search query. Filter → sort → render, in that order.

**4. Reading (20 min).**
MDN: [Indexed collections guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections)
and [Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).
After each, open DevTools and run your Lab code with `break`-points on. Step through with F10 — watching
`i` and `accumulator` change is how these become automatic.

---

# Checkpoint Quiz

1. What does `var` do that `let` does not — and why should you never use it?
2. What happens if you read a `let` variable before its declaration line? Why is that better than `undefined`?
3. `const config = { a: 1 }` — can you write `config.a = 2`? Why?
4. `0 == ""`, `0 === ""`, and `[0] == false`. Which are true?
5. Why is `if (arr.indexOf(0))` a bug?
6. When must you use `??` instead of `||`?
7. Write the `if / else if / else` that returns `"A"` for `score >= 90`, `"B"` for `> 75`, `"C"` otherwise — in
   the correct order.
8. What is the difference between `==` and `===`, in one sentence?
9. `if (role === "admin" || role === "owner" && active)` — which grouping does JS apply?
10. What does a `switch` with a matching `case` and **no** `break` do?
11. Why must `default:` be present in a `switch`?
12. `for...of` vs `for...in` — what does each iterate, and what does `for...in` return for an array?
13. Why does this print `3 3 3`?
    `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));`
14. Name three things `forEach` cannot do.
15. What does `[1,2,3].map(parseInt)` return, and why?
16. What does `[1,2,3].map(n => { console.log(n); })` return?
17. Give the pipeline that filters an array to even numbers, doubles them, then logs each. Which method does
    each step?
18. `reduce` with no initial value on `[]` — what happens?
19. `some` vs `every` — what does each return?
20. What does a regular function's `this` depend on, and what does an arrow function's depend on?
21. Why does `setTimeout(function () { this.x = 1; })` fail while the arrow version works?
22. Can you `new` an arrow function? Why?
23. In `"Hello".split("")`, what does the empty string argument do?
24. Why does `.slice()` matter before `.sort()`?
25. What does `[10, 9, 1].sort()` return, and what comparator fixes it?
26. Difference between spread and rest?
27. Why is `const copy = { ...original }` not a deep copy?
28. What does `function f({ a = 1 } = {})` protect against that `function f({ a = 1 })` does not?

<details>
<summary>Answers</summary>

1. `var` is function-scoped and hoisted as `undefined`, so it leaks out of blocks and can be read before assignment. It also shares one binding across loop iterations. `let` is block-scoped and lives in the temporal dead zone until its line runs.
2. A `ReferenceError`. `var` would give `undefined`, which is a value that looks legitimate and hides the bug. The TDZ forces you to assign before you read.
3. Yes. `const` freezes the *binding*, not the object. The variable still points at the same object, so its properties can change.
4. `0 == ""` → true. `0 === ""` → false. `[0] == false` → false (an array coerces to `"0"`, which is truthy).
5. `indexOf(0)` returns `0` when the item exists, and `0` is falsy — so a successful search looks like a failed one.
6. When `0`, `""`, or `false` are legitimate values. `||` replaces all falsy values; `??` replaces only `null` and `undefined`.
7. `if (score >= 90) return "A"; else if (score > 75) return "B"; else return "C";` — narrowest condition first, otherwise the first true branch wins and later ones never run.
8. `==` coerces both operands to a common type before comparing; `===` compares type first, then value, and never coerces.
9. `||` has *lower* precedence than `&&`, so it groups as `admin || (owner && active)`.
10. It keeps running — the cases fall through and every `case` below the match executes until a `break` or `return`. Grouping several `case` labels with no `break` is the intentional use.
11. So unmatched input gets an explicit result. Without it, the function returns `undefined`, which surfaces later as a confusing bug.
12. `for...of` iterates **values**; `for...in` iterates **keys**. For an array, `for...in` yields the index numbers **as strings** (`"0"`, `"1"`, `"2"`), and it also walks inherited properties.
13. `var` has function scope and one shared binding. All three closures see the final value of `i`, which is `3` after the loop exits. `let` creates a fresh binding per iteration, giving `0 1 2`.
14. It cannot `break` or `continue` (no early exit); it returns `undefined` (so no chaining); and an empty array never invokes the callback (so a validation built only with side effects stays silent).
15. `[1, NaN, NaN]`. `map` passes `(element, index, array)`, so `parseInt("2", 1)` tries to parse in base 1. Wrap it: `.map((s) => parseInt(s, 10))`.
16. `[undefined, undefined, undefined]`. `map` collects the callback's return values, and a callback with a block body and no `return` returns `undefined`.
17. `filter` → `map` → `forEach`. Keep even numbers (`filter(n => n % 2 === 0)`), double them (`map(n => n * 2)`), then act (`forEach(n => console.log(n))`).
18. A `TypeError: Reduce of empty array with no initial value`. Always pass the initial value — it also decides the result's type.
19. `some` returns `true` if **at least one** element satisfies the test; `every` returns `true` if **all** do. Both return a boolean.
20. A regular function's `this` depends on **how it is called** (the receiver). An arrow function's `this` is fixed to wherever the arrow was **written** — lexically inherited.
21. Inside a regular callback, `this` is whatever the timer calls it with (`undefined` here), not the object. An arrow captures the enclosing scope's `this` lexically.
22. No. Arrows have no `prototype` property, and constructors require one. (They also cannot be called with `new` at all.)
23. `""` is the separator, so it splits between every character, producing `["H","e","l","l","o"]`. `"".split("")` gives `[ ]` and `",".split(",")` gives `["",""]` — that is what an empty separator means.
24. `sort` mutates the array in place. `slice()` returns a shallow copy, so sorting the copy leaves the source array's original order intact.
25. `[1, 10, 9]` — the default comparator compares strings, so `"10"` sorts before `"9"`. Fix it with `(a, b) => a - b`.
26. **Spread** expands an array/object into individual values (used on the right of `=` or inside `{ }`). **Rest** collects many values into an array/object (used on the left of a destructuring pattern).
27. Spread copies one level deep. `copy.user` still references the same nested object as `original.user`, so mutating it affects both. Use `structuredClone` for a real deep copy.
28. The `= {}` default makes the *parameter itself* optional. Without it, calling `f()` tries to destructure `undefined` and throws a `TypeError`.

</details>

---

# Common Mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Cannot read properties of null` | Script ran before the element existed | Add `defer`, or move the `<script>` to the end of `<body>` |
| `querySelectorAll(...).map is not a function` | A NodeList is not an array | `Array.from(...).map(...)` or spread it |
| `arr.forEach(...).filter(...)` → `undefined` | `forEach` returns nothing | Order the pipeline: `filter`/`map` first, `forEach` last |
| `map` returns all `undefined` | Callback does not `return` | Return the value; watch for a block body with no return |
| `["1","2"].map(parseInt)` → `[1, NaN]` | `map` passes the index as the 2nd arg | `.map((s) => parseInt(s, 10))` |
| A `forEach` validation never fires | Empty array means no callbacks run | Use `some`/`every`, or return a boolean |
| `break` inside `forEach` does nothing | Not supported | Use `for...of`, `find`, or `findIndex` |
| `for...in` gives `"0"`, `"1"` on an array | It iterates keys | Use `for...of` |
| `this` is `undefined` in a callback | Regular function in a bare callback | Use an arrow function |
| `ReferenceError: x before initialization` | Read a `let`/`const` too early | Move the declaration above, or use a function declaration |
| "Cannot reassign const" | Mutating vs reassigning | `const` object → change properties; if you must reassign, use `let` |
| `if (arr.indexOf(x))` never runs | `0` is falsy | Use `arr.includes(x)` or check `!== -1` |
| `arr.sort()` order looks wrong | Default comparator is string-based | `.sort((a, b) => a - b)` |
| Sort reordered the source array | `sort` mutates | `.slice().sort()` |
| Data order changed after a filter | Filter returned a mutated reference | `arr.slice().filter(...)` |
| An emoji in a string has `length` 2 | UTF-16 code units | `[...str]` for code points |
| A pasted input fails validation | Leading/trailing whitespace | `.trim()` first |
| XSS in a rendered list | User data through `innerHTML` | Use `textContent` |

---

# Cheat Sheet

```js
// Variables
const x = 1;                 // block-scoped, cannot reassign
let y = 1;                   // block-scoped, reassignable

// Comparisons — always strict
if (a === b) { }
if (a !== b) { }

// Truthiness — only 8 falsy values
if (arr.length > 0) { }      // ✅ clearer than if (arr.length)

// Nullish
const port = cfg.port ?? 3000;    // keeps 0
const name = input.value || "Guest";  // replaces ""
const city = data?.address?.city ?? "Unknown";

// Branching
if (a) { } else if (b) { } else { }
const label = n >= 90 ? "A" : "B";
switch (code) { case 200: return "OK"; default: return "?"; }

// Loops
for (let i = 0; i < n; i++) { }
for (const v of values) { }
for (const [k, v] of Object.entries(obj)) { }
while (cond) { }
do { } while (cond);
for (const v of values) { if (v === stop) break; }
for (const v of values) { if (skip(v)) continue; }

// Functions
function decl(a) { return a; }          // hoisted
const expr = (a) => a;                  // lexical this
const withDefault = (a = 0) => a;
function many(...args) { return args; } // rest

// Array pipeline: select → reshape → act
list
  .filter((x) => x.active)
  .map((x) => ({ ...x, label: x.name.toUpperCase() }))
  .forEach((x) => render(x));

// Other array methods
list.find((x) => x.id === id);
list.some((x) => x.stock > 0);
list.every((x) => x.valid);
list.includes(value);
list.reduce((sum, x) => sum + x.price * x.qty, 0);
[...list].sort((a, b) => a.name.localeCompare(b.name));

// Strings
`Hello ${name}, you have ${count} messages`;
input.value.trim().toLowerCase().includes(query);
text.split(", ").join(" • ");

// Destructuring
const { name, role = "dev" } = user;
const { password, ...safe } = user;
const [first, ...rest] = list;

// Spread / rest
const merged = { ...defaults, theme: "dark" };
const copy = [...original];

// JSON
const data = JSON.parse(text);
const text = JSON.stringify(data, null, 2);

// DOM
el.textContent = "safe";        // never innerHTML with user data
el.classList.toggle("hidden", !ok);
el.setAttribute("aria-pressed", String(on));
document.querySelectorAll("li").forEach((li, i) => { /* … */ });
```

---

# Reference

- [MDN — JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) — read the "Indexed collections" and "Functions" chapters today.
- [javascript.info](https://javascript.info/) — the best free book-length resource. Chapter 4 on `if`, chapters on loops and arrays.
- [Node.js ESM docs](https://nodejs.org/api/esm.html) — how `import`/`export` resolves in Node and Vite.
- [Can I Use](https://caniuse.com/) — before relying on `??`, `?.`, `at()`, or `structuredClone`.
- Chrome DevTools Console — **the most valuable skill in this course.** `console.table()`, `console.dir()`,
  `debugger`, and stepping with F10. Use it daily.

---

# Tomorrow — Day 3: Modern JavaScript Refresher II

Today you learned to **transform** data. Tomorrow you learn to **structure** it.

- The rest of the array methods in depth: `filter`, `find`, `reduce`, `sort`, `flat`, `flatMap`
- Objects: `Object.keys/values/entries`, `assign`, spreading, immutability patterns
- Optional chaining and nullish coalescing against real API-shaped data
- Higher-order functions and basic function composition
- The event loop, call stack and callback queue — conceptual, but it explains every async bug you will hit
- **Practice:** take a JSON array of products, filter by category, reshape with `map`, compute totals with
  `reduce` — then render the result onto your one-page site with no framework.

**Bring:** your `class2` Lab files, working, with at least one feature you built yourself. And bring one
question you could not answer from the docs — we will start there.
