# Day 3 — Modern JavaScript Refresher II

**Session length:** ~2.5–3 hours
**Goal of the whole course:** Design, build and deploy a **single-page website using Tailwind CSS**.
**Goal of today:** Turn raw data into the exact shape your UI needs. You learned to *transform* data on Day 2; today you learn to *reshape, search, sort and fold* it — the four operations behind every product grid, cart total and search box you will ever build.

> **What changed since Day 2**
> Day 2 gave you behaviour: variables, conditions, loops, `forEach` and `map`. Today you go **deep on the array
> and object toolkit** that every real app is built from. A product page is not hand-written HTML — it is a JSON
> array that you `filter` by category, `map` into cards, and `reduce` into a price range.
>
> **How this connects to Tailwind.** Tailwind gives you the classes; JavaScript decides which data gets rendered
> with them. Every section of your one-page site (the projects grid, the skills strip, the contact form's
> validation) is a **data pipeline**: `rawData → filter → map → forEach → the DOM`. Master pipelines today and
> Day 6's Tailwind rebuild, Day 7's React, and Day 13's product listing all become the same five lines in a
> different costume.

---

## Session Plan

| Time | Block | Outcome |
| --- | --- | --- |
| 00:00–00:15 | Recap Day 2: `forEach` vs `map`; where pipelines start | Mental model locked in |
| 00:15–00:45 | `filter`, `find`, `findIndex`, `some`, `every`, `includes` | Selecting & testing data |
| 00:45–01:15 | **`reduce` in depth** — the one that trips everyone | Folding any array to one value |
| 01:15–01:20 | Break | |
| 01:20–01:40 | `sort`, `toSorted`, `flat`, `flatMap`, chaining | Ordering & reshaping |
| 01:40–02:05 | **Objects:** `Object.keys/values/entries`, `assign`, spread, immutable updates | Object-shaped data |
| 02:05–02:20 | Optional chaining `?.`, nullish `??`, nullish assignment | Safe access to API-shaped data |
| 02:20–02:40 | Higher-order functions & function composition | Reusable logic, less repetition |
| 02:40–02:55 | **JSON:** `stringify` / `parse`, deep copy, format rules | The bridge to APIs |
| 02:55–03:20 | Immutability: `slice`, spread, `toSorted`, `structuredClone` | Never mutate your source |
| 03:20–04:00 | Lab: product catalog from a JSON array | Working filtered, sorted, totalled page |

---

# Part 1 — The Pipeline, Revisited

## 1.1 The one sentence that organises the whole day

```text
select  →  reshape  →  sort  →  fold  →  act
filter    map         sort    reduce   forEach
```

Every data-driven UI is that sentence. Read it left to right and you always know which tool to reach for:

| Question | Answer | Method |
| --- | --- | --- |
| Which items do I keep? | a boolean per item | `filter` |
| What should each item become? | a new item per item | `map` |
| In what order? | a comparator | `sort` / `toSorted` |
| What is the one summary number? | an accumulator | `reduce` |
| Now do the side effect | perhaps nothing returns | `forEach` |

The mistake beginners make is reaching for a `for` loop for all five. The methods above are not "fancy" — they
are the *names* of the five things you actually mean, which is why code using them reads like a sentence.

## 1.2 `forEach` and `map` — the recap you must have cold

```js
const prices = [12, 30, 8];

// forEach → side effect per item → returns undefined
prices.forEach((price) => console.log(price));

// map → new array, same length → source untouched
const withTax = prices.map((price) => price * 1.2);   // [14.4, 36, 9.6]
```

- `forEach` **does something** (log, add a class, append to the DOM). It never returns a value.
- `map` **gives you a new array.** It never mutates the source. If your `map` callback logs instead of returns,
  you get `[undefined, undefined, ...]`.

**The rule that prevents 80% of Day 3 bugs:** *everything before `forEach` builds data; `forEach` performs the
side effect.* If you are pushing into an array inside a `forEach`, you almost certainly wanted `map`.

```js
// ❌ the beginner version
const names = [];
users.forEach((u) => names.push(u.name));

// ✅ say what you mean
const names = users.map((u) => u.name);
```

---

# Part 2 — Selecting and Testing: `filter`, `find`, `findIndex`, `some`, `every`, `includes`

## 2.1 `filter` — keep some, in a new array

`filter` calls your callback once per element. Wherever the callback returns a **truthy** value, the element is
kept. It always returns a **new array**, with length ≤ the source.

```js
const products = [
  { name: "Laptop", price: 1200, category: "tech", inStock: true },
  { name: "Headphones", price: 150, category: "tech", inStock: false },
  { name: "Notebook", price: 6, category: "stationery", inStock: true },
  { name: "Pen", price: 2, category: "stationery", inStock: true },
];

const tech = products.filter((p) => p.category === "tech");
// [Laptop, Headphones]

const affordable = products.filter((p) => p.inStock && p.price < 200);
// [Notebook, Pen]
```

Two things to internalise:

1. **The callback must return a boolean expression, not a block with no return.**
   ```js
   products.filter((p) => { p.inStock; });        // ❌ returns undefined → []
   products.filter((p) => { return p.inStock; }); // ✅
   products.filter((p) => p.inStock);             // ✅ the idiomatic form
   ```
2. **`filter` never mutates the source.** The words "returns a new array" appear in every method description
   today for a reason — you will rely on it constantly to avoid re-rendering bugs.

## 2.2 `find` — the first match, or `undefined`

When you want **one** item, `filter(...)[0]` is wasteful and unclear. Use `find`.

```js
const laptop = products.find((p) => p.name === "Laptop");     // the object
const missing = products.find((p) => p.name === "Monitor");   // undefined

// Then the classic crash:
// missing.price     ← 💥 TypeError: Cannot read properties of undefined
```

`find` is the correct tool whenever you expect a single result. It stops scanning at the first match, so it is
also faster than `filter` on large arrays.

```js
// Safe access — you will write this shape every day from here on
const price = products.find((p) => p.name === "Monitor")?.price ?? 0;
```

## 2.3 `findIndex` — the position of the first match, or `-1`

```js
const idx = products.findIndex((p) => p.name === "Notebook");   // 2
const none = products.findIndex((p) => p.name === "Monitor");    // -1
```

`findIndex` is the "find the item so I can replace or delete it" tool. Note the **`-1` trap**: `-1` is truthy,
and index `0` is falsy, so never write `if (products.findIndex(...))`. Always compare explicitly:

```js
if (idx !== -1) { /* found */ }
if (idx >= 0)  { /* found */ }
```

## 2.4 `some` and `every` — return a boolean

These answer yes/no questions without building an array. This is the fix for the Day 2 problem: a `forEach`
"validation" never fires on an empty array. `some`/`every` return a real boolean either way.

```js
products.some((p) => p.price > 1000);   // true   — at least one is expensive
products.every((p) => p.inStock);       // false  — not all are in stock
[].some(() => true);                    // false  — empty: "no item matched"
[].every(() => false);                  // true   — empty: "all (zero) matched" (vacuous truth)
```

**The empty-array rule catches everyone once:** `some` on `[]` is `false`; `every` on `[]` is `true`. Guard it if
that matters:

```js
const allAffordable = products.length > 0 && products.every((p) => p.price < 200);
```

## 2.5 `includes` — exact membership, honestly

```js
const categories = ["tech", "stationery", "home"];
categories.includes("tech");     // true
categories.includes("toys");     // false

products.map((p) => p.category).includes("tech");   // true — works on the mapped array
```

`includes` uses **SameValueZero** (basically `===`), so it is exact and predictable. This is the version of the
`indexOf` idea you should reach for — remember the Day 2 trap where `indexOf(0)` returns `0`, which is falsy.

```js
[10, 20, 30].includes(20);   // true → use the boolean directly
if ([10, 20, 30].includes(20)) { /* runs */ }
```

`includes` does **not** search inside objects — `products.includes({ name: "Pen" })` is `false` because that is a
different object reference. Search objects with `some`:

```js
products.some((p) => p.name === "Pen");   // true
```

## 2.6 Choosing between them — the decision table

| I want… | Method | Returns |
| --- | --- | --- |
| all items that match | `filter` | new array (≤ length) |
| the first item that matches | `find` | the item or `undefined` |
| the index of the first match | `findIndex` | number or `-1` |
| to know if **any** matches | `some` | boolean |
| to know if **all** match | `every` | boolean |
| to know if a **primitive** is present | `includes` | boolean |

**Rule:** choose the narrowest one that answers your question. Do not `filter().length > 0` when `some()` would
do — it allocates an array to throw it away.

---

# Part 3 — `reduce` in Depth

`reduce` is the one method people fear. The fear comes from never having seen what it *is*: `reduce` is a
**loop that carries a value forward**. That is all.

## 3.1 The shape

```js
array.reduce(function (accumulator, currentValue, index, array) {
  return nextAccumulator;
}, initialValue);
```

- **accumulator** — the value carried from the previous step. On the first step it is the **initial value**.
- **currentValue** — the element being processed this step.
- **The return value becomes the accumulator for the next step.**
- **initialValue** — the starting accumulator.

```js
const prices = [12, 30, 8];

const total = prices.reduce((sum, price) => sum + price, 0);
// step 1: (0,    12) → 12
// step 2: (12,   30) → 42
// step 3: (42,    8) → 50
// total = 50
```

Read that trace line by line. If you can trace it, you understand `reduce` — there is nothing else.

## 3.2 Always pass the initial value

Two reasons, both learned the hard way:

**1. Without it, `reduce` throws on an empty array.**

```js
[].reduce((a, b) => a + b);       // 💥 TypeError: Reduce of empty array with no initial value
[].reduce((a, b) => a + b, 0);    // ✅ 0
```

**2. The initial value decides the result's type.**

```js
[].reduce((acc, x) => acc + x, 0);     // number  → 0
[].reduce((acc, x) => acc + x, "") ;   // string  → ""
[].reduce((acc, x) => [...acc, x], []);// array
[].reduce((acc, x) => ({ ...acc }), {});// object
```

**Rule for the whole course: always pass the initial value.** It makes `reduce` total (never throws) and honest
about what it returns.

## 3.3 Four `reduce` patterns worth memorising

### Sum and average

```js
const total = products.reduce((sum, p) => sum + p.price, 0);
const average = products.length ? total / products.length : 0;
```

### Maximum

```js
const mostExpensive = products.reduce(
  (max, p) => (p.price > max.price ? p : max),
  products[0],
);
```

### Grouping into an object — the killer use case

```js
const byCategory = products.reduce((groups, p) => {
  (groups[p.category] ??= []).push(p);
  return groups;
}, {});

// {
//   tech: [Laptop, Headphones],
//   stationery: [Notebook, Pen],
// }
```

`(groups[key] ??= [])` is the nullish-assignment shorthand: "if `groups[key]` is null or undefined, set it to
`[]`, then use it." One line replaces a three-line `if`.

### Counting occurrences

```js
const counts = products.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});
// { tech: 2, stationery: 2 }
```

## 3.4 The three `reduce` mistakes

**Mistake 1 — forgetting to `return` the accumulator.**

```js
products.reduce((sum, p) => { sum + p.price; }, 0);   // ❌ returns undefined every step
products.reduce((sum, p) => { return sum + p.price; }, 0);  // ✅
products.reduce((sum, p) => sum + p.price, 0);        // ✅ expression body
```

**Mistake 2 — mutating the accumulator when you meant to build a new one.**

```js
// Mutating — works, but you are now in charge of not sharing state
const grouped = products.reduce((acc, p) => { (acc[p.category] ??= []).push(p); return acc; }, {});

// Immutable — slower, but safer if `grouped` is passed around
const grouped2 = products.reduce((acc, p) => {
  const key = p.category;
  return { ...acc, [key]: [...(acc[key] ?? []), p] };
}, {});
```

**Mistake 3 — using `reduce` for everything.** If your accumulator never changes type and you only ever push,
`filter`, `map` or `Object.groupBy` is clearer. Earn `reduce` by needing a real fold.

> **Modern alternative:** `Object.groupBy(products, (p) => p.category)` (ES2024) does the grouping case natively.
> Know `reduce` anyway — it predates it, it is everywhere in existing code, and it generalises to cases
> `groupBy` cannot express.

---

# Part 4 — Ordering and Flattening: `sort`, `toSorted`, `flat`, `flatMap`

## 4.1 `sort` mutates — this is the trap that ruins demos

```js
const scores = [88, 42, 95, 67, 31];

const sorted = scores.sort();          // ⚠️ mutates `scores` AND returns the same array
console.log(scores);                    // [31, 42, 67, 88, 95] — the source changed!
```

Sorting a source array in place is one of the most common causes of "my filter broke after I sorted" and of
React bugs on Day 8. Two fixes:

```js
// 1. Copy first, then sort the copy
const sorted = [...scores].sort((a, b) => a - b);

// 2. Use toSorted (ES2023) — returns a new array, leaves the source alone
const sorted2 = scores.toSorted((a, b) => a - b);
```

## 4.2 The default comparator is alphabetical — even for numbers

```js
[10, 9, 1].sort();          // [1, 10, 9]  ← "10" comes before "9" as text
[10, 9, 1].sort((a, b) => a - b);   // [1, 9, 10]  ✅ numeric
```

**Memorise the two comparators:**

```js
const byNumberAsc  = (a, b) => a - b;         // smallest first
const byNumberDesc = (a, b) => b - a;         // largest first
```

For sorting objects by a field, and for strings, use `localeCompare`:

```js
products.toSorted((a, b) => a.price - b.price);            // cheap → expensive
products.toSorted((a, b) => a.name.localeCompare(b.name)); // A → Z, accent-aware
```

## 4.3 The comparator contract

A comparator takes `(a, b)` and must return:

| Return | Meaning |
| --- | --- |
| negative | `a` comes **before** `b` |
| positive | `a` comes **after** `b` |
| `0` | keep the original order between them |

`a - b` works for numbers because subtraction already produces the right sign. It **does not work for strings**
(`"a" - "b"` is `NaN`), which is why strings use `localeCompare`.

## 4.4 Stable sort, and sorting isn't a filter

Modern JavaScript's `sort` is **stable**: items with equal sort keys keep their previous relative order. That
means sorting twice composes predictably — sort by name, then by price, gives you name-order *within* each
price tier.

**Sort returns the same number of items.** If you sorted then noticed missing items, you did not lose them —
you almost certainly reassigned the wrong variable, and the `sort`-mutation trap in 4.1 is the usual cause.

## 4.5 `flat` — one level at a time

`flat` flattens nested arrays. By default it goes **one level deep**.

```js
[[1, 2], [3, 4]].flat();          // [1, 2, 3, 4]
[[1, [2]], [3]].flat();           // [1, [2], 3]     ← one level only
[[1, [2]], [3]].flat(2);          // [1, 2, 3]       ← two levels
[[1, [2, [3]]]].flat(Infinity);   // [1, 2, 3]       ← all the way down
```

The everyday case is a list of lists — every product's tags, every user's skills:

```js
const allTags = products.map((p) => p.tags).flat();
// [["new","sale"], ["wireless"], ...] flattened into one array of every tag
```

## 4.6 `flatMap` — `map` then `flat(1)` in one pass

`flatMap` maps each element to an array and flattens the result by one level. Use it when your `map` callback
returns a list.

```js
// With two steps
const allTags = products.map((p) => p.tags).flat();

// One step
const allTags2 = products.flatMap((p) => p.tags);
```

```js
// The classic interview example: split sentences into words
const lines = ["hello world", "goodbye moon"];
lines.flatMap((line) => line.split(" "));   // ["hello","world","goodbye","moon"]
```

`flatMap` cannot flatten deeper than one level — that is a deliberate limit, not a bug. For deeper, `map` then
`flat(Infinity)`.

## 4.7 Chaining — order matters, and it composes

Methods that return arrays can be chained. Methods that return a value (`find`, `some`, `reduce`) end the chain.

```js
const result = products
  .filter((p) => p.inStock)                 // 1. select
  .map((p) => ({ ...p, price: p.price * 1.2 })) // 2. reshape
  .toSorted((a, b) => a.price - b.price)    // 3. order (non-mutating)
  .slice(0, 3);                              // 4. take the top 3

result.forEach((p) => render(p));            // 5. act
```

**Order changes the answer.** `filter` then `sort` sorts fewer items; `sort` then `filter` sorts everything.
Filter first whenever you can — it is faster and the intent is clearer. And `map → filter` is usually a
mistake: filter on the original fields before you reshape, or you will be filtering on the mapped shape.

---

# Part 5 — Objects: `keys`, `values`, `entries`, `assign`

Arrays are half the story. The other half is objects — and the tools differ because objects are keyed, not
indexed.

## 5.1 `Object.keys`, `Object.values`, `Object.entries`

```js
const user = { name: "Samira", role: "Developer", city: "Lagos" };

Object.keys(user);     // ["name", "role", "city"]
Object.values(user);   // ["Samira", "Developer", "Lagos"]
Object.entries(user);  // [["name","Samira"], ["role","Developer"], ["city","Lagos"]]
```

These are the bridge from an object (which has no `.map`) to an array (which does):

```js
// Object → array → pipeline
Object.entries(user)
  .filter(([, value]) => value.length > 5)
  .map(([key, value]) => `${key}: ${value}`)
  .forEach((line) => console.log(line));
```

`Object.entries` is the one to reach for — it gives you the key **and** the value, so you never need the
`for...in` + `hasOwn` dance from Day 2.

## 5.2 Order is guaranteed, with a caveat

Object key order is defined: **integer-like keys first, in ascending numeric order, then the rest in insertion
order.**

```js
const obj = { b: 1, 2: "two", a: 3, 1: "one" };
Object.keys(obj);   // ["1", "2", "b", "a"]  — numbers first, then insertion order
```

You rarely need this, but it explains why a "sorted" object reordered itself.

## 5.3 Detecting, freezing and copying

```js
Object.hasOwn(user, "name");     // true   — own property, not inherited
"name" in user;                  // true   — includes inherited too

Object.freeze(user);             // shallow — properties become read-only
Object.isFrozen(user);           // true

Object.seal(obj);                // prevents add/remove, allows editing existing values
```

`Object.freeze` is **shallow**: it freezes the top-level bindings, not nested objects. You would freeze each
nested object too, or reach for a deep-freeze helper. Treat frozen data as a promise, not armour plating.

## 5.4 `Object.assign` — merge into a target (and its modern replacement)

```js
const defaults = { theme: "light", font: "system", size: 16 };
const overrides = { theme: "dark" };

const config = Object.assign({}, defaults, overrides);
// { theme: "dark", font: "system", size: 16 }
```

`Object.assign(target, ...sources)` copies all enumerable own properties from the sources into **target**, later
sources winning. Two things to know:

1. **The first argument is mutated.** `Object.assign(defaults, overrides)` destroys `defaults`. Always pass `{}`
   as the first argument.
2. **Spread is the modern, clearer equivalent** for the same job:

```js
const config2 = { ...defaults, ...overrides };   // later wins → theme: "dark"
```

`Object.assign` is still everywhere in older code and libraries, so recognise it — but write spread in your own.

## 5.5 Immutable updates — the pattern that React runs on

Every state change should produce a **new** object, never mutate the old one. Three shapes cover 99% of cases:

```js
const user = { name: "Samira", role: "Developer", city: "Lagos" };

// 1. Change one field
const promoted = { ...user, role: "Lead" };

// 2. Add a field
const withEmail = { ...user, email: "samira@example.com" };

// 3. Remove a field — rest collects the rest
const { city, ...withoutCity } = user;   // { name, role }
```

Nested updates need spreading at every level:

```js
const account = { user: { name: "Samira", settings: { theme: "light" } } };

const updated = {
  ...account,
  user: {
    ...account.user,
    settings: { ...account.user.settings, theme: "dark" },
  },
};
```

Read that as "copy every level on the path down to the change." It is verbose, and it is exactly what
`useState` requires on Day 8 — spread objects are the only way React knows something changed.

> **Remember (Day 2):** spread is one level deep. `{ ...user }` still shares `user.settings` by reference. For a
> real deep copy, `structuredClone(user)`.

## 5.6 `Object.fromEntries` — array back to object

The inverse of `entries`. You will use it to turn `Map`s and entry pairs into plain objects:

```js
const pairs = [["a", 1], ["b", 2]];
Object.fromEntries(pairs);   // { a: 1, b: 2 }

// Undo a previous transformation
Object.fromEntries(Object.entries(user).map(([k, v]) => [k, v.toUpperCase()]));
// { name: "SAMIRA", role: "DEVELOPER", city: "LAGOS" }
```

---

# Part 6 — Optional Chaining and Nullish Coalescing

On Day 2 these were a footnote. Today they become load-bearing, because the data you get from APIs is shaped
like this:

```js
const apiUser = {
  id: 1,
  profile: {
    contact: { email: "samira@example.com" },
  },
  posts: [{ title: "Hello" }],
  // `company` and `address` might not exist at all
};
```

## 6.1 Optional chaining `?.` — stop, don't throw

Without `?.`, every missing level is a crash:

```js
apiUser.profile.contact.email;    // ✅ "samira@example.com"
apiUser.company.name;             // 💥 TypeError: Cannot read properties of undefined
```

With `?.`, the chain short-circuits to `undefined` the moment it hits `null` or `undefined`:

```js
apiUser.company?.name;                    // undefined, no crash
apiUser.address?.city;                    // undefined
apiUser.profile?.contact?.email;          // "samira@example.com"
apiUser.company?.name ?? "No company";    // "No company"
```

It works on **methods and array indexes** too:

```js
apiUser.posts?.[0]?.title;        // "Hello"  — optional index access
apiUser.getName?.();              // calls only if the method exists
onSave?.();                       // the callback-optional idiom
```

Combine with `??` for a default, and you have the safe-access pattern you will write hundreds of times:

```js
const email = apiUser?.profile?.contact?.email ?? "not provided";
```

## 6.2 `?.` does not replace validation

`?.` stops the *crash*; it does not make the data *correct*. `undefined` propagating quietly is sometimes worse
than an error, because you find out in production. Use `?.` when a missing value is genuinely acceptable, and an
explicit check when it is not:

```js
if (!apiUser?.profile?.contact?.email) {
  showError("Email is required");
  return;
}
```

## 6.3 Nullish coalescing `??` — the fallback that respects falsy values

`||` replaces **every** falsy value: `0`, `""`, `false`, `NaN`. `??` replaces **only** `null` and `undefined`.

```js
const settings = { volume: 0, name: "", debug: false };

settings.volume || 10;   // 10  ❌ — a deliberate 0 becomes 10
settings.volume ?? 10;   // 0   ✅ — 0 is kept

settings.name || "Guest";   // "Guest" ❌ — an empty name becomes "Guest"
settings.name ?? "Guest";   // ""      ✅ — the explicit empty string is kept
```

**Decision rule:**
- Use `??` when `0`, `""`, or `false` are **legitimate** values (counts, booleans, optional text).
- Use `||` when a falsy value is **also invalid** and you want to replace it (e.g. a required non-empty string).

## 6.4 `??=` and `||=` and `&&=` — assignment shorthands

```js
let config = {};

config.theme ??= "light";      // set only if currently null/undefined → "light"
config.theme ??= "dark";       // already "light", unchanged

let name = "";
name ||= "Anonymous";          // set only if currently falsy → "Anonymous"

let loaded = true;
loaded &&= false;              // set only if currently truthy → false
```

`??=` is the one you saw in the `reduce` grouping pattern. It is the idiomatic "initialise if absent."

## 6.5 The syntax rule

`??` cannot be mixed with `&&` or `||` without parentheses — the language forbids it because the precedence
would be genuinely ambiguous:

```js
const v1 = a ?? b || c;      // 💥 SyntaxError
const v2 = (a ?? b) || c;    // ✅
const v3 = a ?? (b || c);    // ✅
```

---

# Part 7 — Higher-Order Functions and Composition

## 7.1 Functions are values

Every array method today takes a **function as an argument**. That is the definition of a higher-order function:
a function that takes a function, returns a function, or both. Once you see `map`, `filter` and `reduce` as
"a loop that I hand behaviour to," they stop being special.

```js
const callback = (x) => x * 2;

[1, 2, 3].map(callback);          // a named function
[1, 2, 3].map((x) => x * 2);      // an inline arrow — the same thing
```

## 7.2 Functions that return functions

The other half of the definition. A function that returns a configured function lets you **pre-bake** behaviour.

```js
const times = (n) => (x) => x * n;

const double = times(2);
const triple = times(3);

double(5);   // 10
triple(5);   // 15
```

This is a **closure**: `double` remembers `n = 2`. Every "make a filter for this category" helper is this shape:

```js
const byCategory = (category) => (product) => product.category === category;

products.filter(byCategory("tech"));     // reads like English
products.filter(byCategory("stationery"));
```

Compare with an inline arrow that repeats the field name at every call site. The function-returning version gets
*more* valuable as the predicate grows.

## 7.3 Composition — small functions, combined

Composition is "make a new function by feeding one function's output into another's input."

```js
const double   = (n) => n * 2;
const increment = (n) => n + 1;

// Manually
increment(double(5));   // 11

// As a reusable composition
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

const doubleThenIncrement = pipe(double, increment);
doubleThenIncrement(5);   // 11
```

That `pipe` is three lines, and it is just `reduce` over an array of functions — the whole day's ideas in one
place. `pipe` runs **left to right** (like the pipeline in Part 1); `compose` is the same thing right to left.

The real payoff is readability — a data transformation stated as a named pipeline:

```js
const discounted     = (p) => ({ ...p, price: p.price * 0.9 });
const sortByPrice    = (list) => list.toSorted((a, b) => a.price - b.price);
const take           = (n) => (list) => list.slice(0, n);

const bestDeals = pipe(
  (list) => list.filter((p) => p.inStock),
  (list) => list.map(discounted),
  sortByPrice,
  take(3),
);

bestDeals(products);   // top 3 in-stock products, cheapest first, with discount applied
```

Each step does one thing, is independently testable, and the final line reads as the business requirement.

## 7.4 Currying and partial application (briefly)

Currying turns `f(a, b)` into `f(a)(b)`. Partial application pre-fills some arguments.

```js
const multiply = (a) => (b) => a * b;
const triple = multiply(3);
triple(4);   // 12

// Partial application with a reusable logger prefix
const logger = (level) => (message) => console.log(`[${level}] ${message}`);
const warn = logger("WARN");
warn("disk almost full");   // [WARN] disk almost full
```

You will meet these patterns in React event handlers and Redux middleware. Recognise the shape; you do not need
to master it today.

## 7.5 A word of warning

Composition and higher-order functions are a **clarity** tool, not a cleverness contest. If a chain is harder to
read than four straight statements, write the four statements. The goal is code that reads like what it does —
`pipe(...)` helps when the steps have names, and hurts when they are anonymous arrows three deep.

---

# Part 8 — JSON: The Bridge to Real Data

JSON (JavaScript Object Notation) is the format every API speaks. Today you convert between the **string** a
server sends and the **objects** your methods need.

## 8.1 `JSON.parse` — string → data

```js
const text = '{"name":"Samira","skills":["HTML","CSS"],"age":26}';
const user = JSON.parse(text);

user.name;              // "Samira"
user.skills.includes("CSS");   // true — it is a real array
```

`parse` returns real objects and arrays, so `filter`, `map` and destructuring work on the result immediately.

## 8.2 `JSON.stringify` — data → string

```js
const user = { name: "Samira", skills: ["HTML", "CSS"] };

JSON.stringify(user);            // '{"name":"Samira","skills":["HTML","CSS"]}'
JSON.stringify(user, null, 2);   // pretty-printed, 2-space indent — for files and logs
```

The three arguments: the value, a **replacer**, and the **space** (indent). The replacer can be an array of keys
to keep, or a function:

```js
// Keep only chosen keys
JSON.stringify(user, ["name"]);       // '{"name":"Samira"}'

// Transform values as they are serialised
JSON.stringify(user, (key, value) => (typeof value === "string" ? value.trim() : value));
```

## 8.3 What JSON cannot represent — and the bugs it causes

JSON has **no** `undefined`, functions, `Date`, `Map`, `Set`, `BigInt`, or comments. Their handling is lossy:

```js
JSON.stringify({ a: undefined, b: () => {}, c: null, d: new Date() });
// '{"c":null,"d":"2026-10-10T00:00:00.000Z"}'
//   a is dropped entirely, b is dropped, Date became a string
```

- `undefined` and functions **vanish** (not even kept as `null`).
- `Date` becomes an ISO **string**; `JSON.parse` gives you back a string, *not* a Date.
- `NaN` and `Infinity` become `null`.
- **Circular references throw**: `JSON.stringify(obj)` where `obj.self = obj` → `TypeError`.

## 8.4 The deep-copy idiom and its limit

```js
const original = { user: { name: "Samira" }, theme: "light" };

const copy = JSON.parse(JSON.stringify(original));
copy.user.name = "Ada";        // original.user.name stays "Samira" ✅
```

This is the "poor man's deep clone." It works, but it is lossy (see 8.3) and slow. The modern, correct version is:

```js
const copy = structuredClone(original);   // handles Date, Map, Set, nested objects
```

**Use `structuredClone` for real deep copies.** Keep the JSON round-trip as a fallback for very old runtimes and
recognise it in existing code.

## 8.5 Parsing untrusted input safely

```js
function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
```

`JSON.parse` **throws** on malformed input. When the text comes from a user, a file, or `localStorage`, wrap it.
A missing `try/catch` around `JSON.parse` is the number one cause of "the whole page went blank" after a
corrupt cache entry.

---

# Part 9 — Immutability, End to End

Every array and object method today either **returns a new value** or **mutates the original**. Knowing which is
which is the difference between a smooth Day 8 and an afternoon of React bugs.

## 9.1 Which methods mutate?

| Mutates the original | Returns a new value (non-mutating) |
| --- | --- |
| `push`, `pop`, `shift`, `unshift` | `map`, `filter`, `reduce`, `find`, `some`, `every` |
| `splice` | `slice` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `fill` | `concat`, `flat`, `flatMap` |
| `Object.assign(target, …)` | `{ ...obj }`, `{ ...a, ...b }` |

**Make this table a reflex.** `sort`, `reverse` and `splice` are the three that catch people out, because their
names do not warn you.

## 9.2 Non-mutating updates for arrays

```js
const cart = [
  { id: 1, name: "Laptop", price: 1200, qty: 1 },
  { id: 2, name: "Pen",    price: 2,    qty: 5 },
];

// Add
const added = [...cart, { id: 3, name: "Mouse", price: 25, qty: 1 }];

// Remove — filter by id
const removed = cart.filter((item) => item.id !== 2);

// Update one item — map + spread
const updated = cart.map((item) =>
  item.id === 1 ? { ...item, qty: item.qty + 1 } : item,
);
```

These three operations — **add, remove, update** — are every cart and every to-do list on the planet. They are
also, line for line, the `useState` operations on Day 8. Learn them here where you can log the result.

## 9.3 Why immutability matters (the short version)

1. **Reference equality is how frameworks detect change.** React (Day 8) compares `prevState !== nextState` by
   reference. Mutate in place and the reference is unchanged, so React does not re-render.
2. **Undo and history are trivial** when every step is a new value you can keep in an array.
3. **No spooky action at a distance.** Two components holding the "same" array can never surprise each other.

The cost is a shallow copy per update. In practice this is irrelevant for the UI-sized data in this course.

> **If performance ever matters:** `map` copies the whole array to change one item. For very large arrays this is
> O(n). You can reach for an index-based update, but only after you have measured — premature optimisation here
> is the classic beginner trap.

---

# Lab — Build a Product Catalog from a JSON Array

**Time:** 90 minutes. **Deliverable:** `class3/index.html`, `class3/catalog.js`, `class3/styles.css`.

This is the Day 3 practice from the syllabus, built properly: a JSON array of products, filtered by category,
reshaped with `map`, totalled with `reduce`, and rendered to the DOM with no framework.

```js
// class3/catalog.js — the data. Imagine this came from an API as a JSON string.
const productsJSON = `[
  { "id": 1, "name": "Wireless Headphones", "category": "audio",     "price": 89.99,  "inStock": true,  "tags": ["wireless", "sale"], "rating": 4.5 },
  { "id": 2, "name": "Mechanical Keyboard", "category": "input",     "price": 129.00, "inStock": true,  "tags": ["rgb"],             "rating": 4.8 },
  { "id": 3, "name": "USB-C Hub",           "category": "accessory", "price": 39.50,  "inStock": false, "tags": ["usb"],             "rating": 4.1 },
  { "id": 4, "name": "Webcam 1080p",        "category": "video",     "price": 59.00,  "inStock": true,  "tags": ["sale", "hdr"],     "rating": 4.3 },
  { "id": 5, "name": "Desk Lamp",           "category": "accessory", "price": 24.99,  "inStock": true,  "tags": [],                  "rating": 4.0 },
  { "id": 6, "name": "Monitor Stand",       "category": "accessory", "price": 45.00,  "inStock": false, "tags": ["ergonomic"],       "rating": 3.9 },
  { "id": 7, "name": "Studio Microphone",   "category": "audio",     "price": 149.00, "inStock": true,  "tags": ["wireless"],        "rating": 4.7 },
  { "id": 8, "name": "Laptop Sleeve",       "category": "accessory", "price": 19.99,  "inStock": true,  "tags": ["sale"],            "rating": 4.2 }
]`;
```

## Lab 1 — Parse and inspect (10 min)

1. Create the three files and the JSON above.
2. `const products = JSON.parse(productsJSON);`
3. Log `products.length`, and `Object.keys(products[0])` — know the shape before you transform it.
4. Log `JSON.stringify(products, null, 2)` to see the data exactly as the "API" sends it.

## Lab 2 — Select (20 min)

1. `const inStock = products.filter((p) => p.inStock);` — count it.
2. `const affordable = products.filter((p) => p.price < 100);` — count it.
3. `const saleAudio = products.filter((p) => p.category === "audio" && p.tags.includes("sale"));`
4. `const hasExpensive = products.some((p) => p.price > 100);`
5. `const allRated = products.every((p) => p.rating > 3);`
6. `const keyboard = products.find((p) => p.name === "Mechanical Keyboard");` — log `keyboard?.price ?? "none"`.

## Lab 3 — Reshape (15 min)

1. `map` each product to a display object:
   `{ label, formatted, isExpensive }` where `formatted` is `` `$${price.toFixed(2)}` `` and `isExpensive` is
   `price > 100`.
2. `map` each product to an HTML string for a `<article class="card">` containing the name, formatted price,
   category, and a `<span class="badge">Sale</span>` **only** when `tags.includes("sale")` (use a ternary).
3. Collect every unique tag across all products with `flatMap` + a `Set`:
   ```js
   const allTags = [...new Set(products.flatMap((p) => p.tags))];
   ```

## Lab 4 — Fold with `reduce` (20 min)

1. **Total inventory value:** `products.reduce((sum, p) => sum + p.price, 0)`.
2. **Average price**, guarding the empty case.
3. **Group by category** into an object with `(groups[p.category] ??= []).push(p)`.
4. **Most expensive item** with the `(max, p) => p.price > max.price ? p : max` pattern (initial value:
   `products[0]`).
5. **Category counts** into `{ audio: 2, accessory: 4, input: 1, video: 1 }`.

## Lab 5 — Order and render (25 min)

1. Sort the **in-stock** products by rating, highest first, using `toSorted`. Remember: copy or use the
   non-mutating method — the source array must be unchanged. Verify with `console.log` before and after.
2. Build the DOM with the full pipeline and `forEach` as the only side effect:
   ```js
   const grid = document.querySelector("#product-grid");
   grid.replaceChildren();

   products
     .filter((p) => p.inStock)
     .map((p) => cardMarkup(p))          // returns an HTML string
     .forEach((html) => {
       const item = document.createElement("article");
       item.innerHTML = html;             // safe: our own data only
       grid.append(item);
     });
   ```
3. Write the four headline numbers from Lab 4 into the page with `textContent`:
   total value, item count, average price, and category count.
4. Add a `<select id="category-filter">` populated from the unique categories (from Lab 3.3). On `change`, filter
   `products` by the chosen category, re-run the render pipeline, and update the headline numbers.
5. Add a `<input id="search">` that filters by name, case-insensitively:
   `p.name.toLowerCase().includes(query.toLowerCase())`.
6. **Empty state:** when the filtered result is empty, show `<p id="empty">No products match.</p>` and hide the
   grid; hide it again when results return.

## Self-review before you move on

- [ ] Did I ever call `sort` on the source `products` array without copying? (`console.log` the original after.)
- [ ] Is every `filter`/`map` callback returning a value — no block body missing a `return`?
- [ ] Does any `reduce` lack an initial value?
- [ ] Did I handle the empty-array case in `some`/`every`/average?
- [ ] Does `find` ever get dereferenced without `?.` or an `undefined` check?
- [ ] Is `products` the same length and order at the end as the start? (It must be.)
- [ ] Does the category filter combined with the search combine correctly (both applied)?
- [ ] Does the empty state appear and disappear correctly?

## Push it

```bash
git add class3
git commit -m "Day 3: product catalog with filter, map, reduce and JSON"
git push
```

---

# Homework

**1. Rewrite the pipeline four ways (45 min).**
Take the Lab's "in-stock products, sorted by rating desc, top 3" result and produce it using:
`filter → map → toSorted → slice`; a plain `for` loop; a `reduce` that does all of it in one pass; and a `pipe`
of named steps. Then answer: which is the most readable, and which would you want a teammate to review?

**2. Grouping drills (40 min).**
From the Lab's `products` array, produce each of these with `reduce`:
- `{ category: totalPrice }` — total value per category.
- `{ category: averageRating }`.
- The single highest-rated product per category.
- `{ inStock: [...], outOfStock: [...] }`.

Then produce the first two with `Object.groupBy` and note how much shorter they are.

**3. Harden the JSON boundary (30 min).**
Add a `loadProducts()` function that:
- Reads a JSON string (hardcode it or use `localStorage`).
- Wraps `JSON.parse` in `try/catch` and returns `[]` on failure.
- Validates each product has the required fields and filters out the invalid ones:
  ```js
  const valid = data.filter((p) => p?.id && p.name && typeof p.price === "number");
  ```
- Logs how many items were dropped.

**4. Deep-copy investigation (20 min).**
Take a nested object, copy it with spread, with `JSON.parse(JSON.stringify(...))`, and with `structuredClone`.
Mutate a nested field on each copy and log the original after each. Write one sentence per method explaining what
survived and what was lost.

**5. Reading (20 min).**
MDN: [Array.prototype.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),
[Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries),
and [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining).
Open DevTools and type every example. Predict the output **before** pressing Enter — that is the exercise.

---

# Checkpoint Quiz

Answer these before Day 4. If any takes more than a minute, review that section.

1. `filter` vs `find` vs `findIndex` — what does each return with no match?
2. Why is `if (arr.findIndex(x => x === v))` a bug?
3. What do `some` and `every` return on an empty array, and why?
4. Why does `products.includes({ name: "Pen" })` return `false`?
5. `[10, 9, 1].sort()` — what does it return, and why?
6. What does `sort` do to the array it is called on, and what is the fix?
7. `[1, [2, [3]]].flat()` — what is the result, and what gives `[1, 2, 3]`?
8. What does `flatMap(f)` do that `map(f).flat()` does not, other than being shorter?
9. Trace `[1, 2, 3].reduce((acc, x) => acc + x, 0)`, showing the accumulator at each step.
10. What happens with `[].reduce((a, b) => a + b)`? Why?
11. What does the initial value of `reduce` determine besides the start?
12. Write a `reduce` that groups an array of objects by a `type` field.
13. What does `Object.entries` give you that `Object.values` does not?
14. Why should you pass `{}` as the first argument to `Object.assign`?
15. What is the difference between `x = a || b` and `x = a ?? b`?
16. Give the value of `settings.volume ?? 10` when `volume` is `0`. And with `||`?
17. `a ?? b || c` — what happens, and what is the fix?
18. What does `user?.profile?.email` evaluate to when `user.profile` is `undefined`?
19. Does `?.` prevent `apiUser.company` from being `undefined`? Explain.
20. What is a higher-order function? Name two array methods that are higher-order.
21. What does `const times = (n) => (x) => x * n; times(2)(5)` return, and what is the mechanism called?
22. What does `pipe(f, g)(x)` compute?
23. What does `JSON.stringify({ a: undefined, b: () => {}, c: 1 })` produce?
24. Why does `JSON.parse(JSON.stringify(obj))` lose `Date` objects?
25. What is the modern, correct deep-clone method, and what does it handle?
26. Which of these mutate: `map`, `sort`, `filter`, `toSorted`, `splice`, `slice`?
27. Name the three non-mutating array operations (add / remove / update) and the method each uses.
28. Why does React (Day 8) require new objects instead of mutations?

<details>
<summary>Answers</summary>

1. `filter` → `[]`. `find` → `undefined`. `findIndex` → `-1`.
2. `findIndex` returns `0` for the first element and `-1` for none — and `0` and `-1` are both truthy-ish traps (`0` is falsy, `-1` is truthy). The condition is true when nothing matched (`-1`) and false when the first element matched. Compare with `!== -1`.
3. `some` → `false` ("no element matched"). `every` → `true` ("all zero elements matched" — vacuously true). Both are the mathematical identity for an empty set.
4. `includes` compares by reference (SameValueZero). The literal `{ name: "Pen" }` is a new object, never equal to any object in the array. Use `some((p) => p.name === "Pen")`.
5. `[1, 10, 9]`. The default comparator turns elements into strings and compares lexicographically, so `"10"` sorts before `"9"`. Pass `(a, b) => a - b` for numbers.
6. It mutates the array in place **and** returns the same array. Fix: `[...arr].sort(...)`, `arr.slice().sort(...)`, or the non-mutating `arr.toSorted(...)`.
7. `[1, [2, [3]]].flat()` → `[1, [2, [3]]]` is flattened one level to `[1, 2, [3]]`. `flat(2)` or `flat(Infinity)` gives `[1, 2, 3]`.
8. Nothing functional — `flatMap` is defined as mapping then flattening one level, in a single pass (and slightly cheaper). It cannot flatten deeper than one level.
9. Step 1: `acc = 0`, `x = 1` → returns `1`. Step 2: `acc = 1`, `x = 2` → `3`. Step 3: `acc = 3`, `x = 3` → `6`. Result `6`.
10. `TypeError: Reduce of empty array with no initial value`. With no initial value the first element is the accumulator, and an empty array has none.
11. The **type** of the result. `0` → number, `""` → string, `[]` → array, `{}` → object.
12. ```js
    arr.reduce((groups, item) => {
      (groups[item.type] ??= []).push(item);
      return groups;
    }, {});
    ```
13. `Object.entries` gives `[key, value]` pairs, so you can use both in one `map`/`filter`. `Object.values` gives only the values and loses the keys.
14. Because `Object.assign` mutates its **first** argument. Passing `{}` protects your source objects. (Or just use spread: `{ ...a, ...b }`.)
15. `||` falls back on **any** falsy value (`0`, `""`, `false`, `NaN`). `??` falls back only on `null` and `undefined`.
16. `??` → `0` (kept). `||` → `10` (the deliberate `0` is replaced).
17. A `SyntaxError` — `??` cannot be mixed with `||` or `&&` without parentheses. Fix: `(a ?? b) || c` or `a ?? (b || c)`.
18. `undefined`. `?.` short-circuits the whole chain the moment it hits `null`/`undefined`.
19. No. `?.` prevents an **error**; it does not create the data. If `company` is genuinely absent, `apiUser.company?.name` is still `undefined`. Only an explicit check or a `??` default makes it non-undefined.
20. A function that takes a function as an argument, returns a function, or both. Any two of `map`, `filter`, `reduce`, `forEach`, `find`, `some`, `every`, `sort`.
21. `10`. It is a closure: the inner arrow captures `n = 2` from the outer call.
22. `g(f(x))` — run `f`, feed its output into `g`. `pipe` is left-to-right composition.
23. `'{"c":1}'` — `undefined` values and function properties are omitted entirely.
24. JSON has no `Date` type, so a `Date` is serialised to an ISO **string**. Parsing gives a string back; it is never revived into a `Date`.
25. `structuredClone(obj)`. It handles nested objects, `Date`, `Map`, `Set`, `ArrayBuffer` and circular references (with a few exceptions like functions and DOM nodes).
26. Mutate: `sort`, `splice`. (And `push`/`pop`/`shift`/`unshift`/`reverse`/`fill`, not in the list.) Non-mutating: `map`, `filter`, `toSorted`, `slice`.
27. **Add** → spread `[...arr, item]` or `concat`. **Remove** → `filter`. **Update** → `map` with a spread on the matching item.
28. React compares previous and next state by **reference**. Mutating in place keeps the same reference, so React cannot tell anything changed and skips the re-render.

</details>

---

# Common Mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `filter` always returns `[]` | Callback has a block body but no `return` | Return the boolean; or use the expression form |
| `map` returns all `undefined` | Same missing `return` | Return the value |
| `Cannot read properties of undefined` after `find` | `find` returned `undefined` | Use `?.` or check before dereferencing |
| `if (arr.findIndex(...))` is wrong | `-1` is truthy, `0` is falsy | Compare with `!== -1` |
| `some` on `[]` is `false` but you wanted `true` | Empty-array identity | Guard with `arr.length > 0` if it matters |
| `[10,9,1].sort()` gives `[1,10,9]` | Default comparator is string-based | Pass `(a, b) => a - b` |
| The source array reordered after sorting | `sort` mutates | `[...arr].sort(...)` or `toSorted` |
| `["a","b"].sort((a,b) => a-b)` → `NaN` order | Subtraction does not work on strings | Use `a.localeCompare(b)` |
| `reduce` throws on an empty array | No initial value | Always pass the initial value |
| `reduce` returns `undefined` | Accumulator not returned | `return` the accumulator |
| A "0" or "" disappeared from output | `||` replaced a legitimate falsy value | Use `??` |
| `SyntaxError` on `a ?? b || c` | Mixing `??` with `||`/`&&` | Add parentheses |
| `Object.assign` wiped a source object | First argument is mutated | Pass `{}` first, or use spread |
| Deep copy still shares nested objects | Spread/`assign` are one level deep | `structuredClone(obj)` |
| A `Date` became a string after a round-trip | JSON has no `Date` | `structuredClone`, or re-`new Date(str)` |
| `JSON.parse` blanked the page | Malformed input throws | Wrap in `try/catch` |
| `JSON.stringify` threw | Circular reference | Remove the cycle or use a `replacer` |
| Object keys came back reordered | Numeric keys sort first | Expected behaviour; use an array to force order |
| `?.` "did nothing" | You expected it to create data | `?.` only prevents errors; add `??` or validate |

---

# Cheat Sheet

```js
// ---- Select & test ----
arr.filter((x) => x.active);            // keep matching → new array
arr.find((x) => x.id === id);           // first match or undefined
arr.findIndex((x) => x.id === id);      // index or -1
arr.some((x) => x.stock > 0);           // any match? → boolean
arr.every((x) => x.valid);              // all match? → boolean
arr.includes(value);                    // exact primitive? → boolean

// ---- Fold ----
arr.reduce((sum, x) => sum + x.price, 0);                    // total
arr.reduce((max, x) => (x.price > max.price ? x : max), arr[0]); // max item
arr.reduce((g, x) => { (g[x.type] ??= []).push(x); return g; }, {}); // group
arr.reduce((c, x) => { c[x.type] = (c[x.type] ?? 0) + 1; return c; }, {}); // count

// ---- Order & reshape (non-mutating) ----
arr.toSorted((a, b) => a.price - b.price);        // numbers asc
arr.toSorted((a, b) => b.rating - a.rating);      // numbers desc
arr.toSorted((a, b) => a.name.localeCompare(b.name)); // strings
arr.toReversed();
arr.flat();            // one level
arr.flat(Infinity);    // all levels
arr.flatMap((x) => x.tags);   // map then flat(1)

// ---- Pipeline ----
arr
  .filter((x) => x.inStock)
  .map((x) => ({ ...x, price: x.price * 1.2 }))
  .toSorted((a, b) => a.price - b.price)
  .forEach((x) => render(x));

// ---- Objects ----
Object.keys(obj);       // ["a","b"]
Object.values(obj);     // [1, 2]
Object.entries(obj);    // [["a",1],["b",2]]
Object.fromEntries(pairs);// { a: 1, b: 2 }
Object.hasOwn(obj, "a");
{ ...obj, key: value };           // change / add
const { removed, ...rest } = obj; // remove a key

// ---- Safe access ----
const email = user?.profile?.contact?.email ?? "none";
const port  = cfg.port ?? 3000;     // keeps 0
cfg.theme ??= "light";              // set if nullish

// ---- Higher-order ----
const byCategory = (c) => (p) => p.category === c;
const pipe = (...fns) => (v) => fns.reduce((acc, fn) => fn(acc), v);
const best = pipe(selectInStock, applyDiscount, sortByPrice, take(3));

// ---- JSON ----
const data = JSON.parse(text);                    // string → data
const text = JSON.stringify(data, null, 2);       // data → string
const clone = structuredClone(original);          // deep copy
try { JSON.parse(maybeBad); } catch { /* fallback */ }

// ---- Immutable adds/removes/updates ----
const added   = [...arr, item];
const removed = arr.filter((x) => x.id !== id);
const updated = arr.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
```

---

# Reference

- [MDN — `Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) — read the examples section twice; the grouping example is the one to keep.
- [MDN — Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) — `keys`/`values`/`entries`/`fromEntries`/`hasOwn`.
- [MDN — Optional chaining `?.`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) and [Nullish coalescing `??`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing).
- [javascript.info — Array methods](https://javascript.info/array-methods) — the clearest free walkthrough of the whole day, with exercises.
- [Can I Use](https://caniuse.com/) — before using `toSorted`, `toReversed`, `flatMap`, `structuredClone`, or `Object.groupBy`.
- Chrome DevTools Console — use `console.table(products)` to see array data as a table, and `console.dir()` for objects. The most valuable skill in this course.

---

# Tomorrow — Day 4: Asynchronous JavaScript

Today you shaped data that was **already in memory**. Tomorrow you fetch it from the network.

- The event loop — call stack, callback queue, and why `setTimeout(…, 0)` is not immediate
- Callbacks and "callback hell"
- Promises: `.then` / `.catch` / `.finally`, `Promise.all`, `Promise.race`
- `async` / `await` and `try/catch` for error handling
- The `fetch` API: GET and POST, reading responses, headers
- **Practice:** fetch a real product API with `async/await` and run today's exact pipeline — `filter → map → reduce`
  — over the result, handling loading and error states by hand.

> **Why today's work pays off tomorrow:** the moment the data arrives over the network it is a **JSON string**,
> shaped unpredictably, with optional fields. Every tool you learned today — `JSON.parse`, `?.`, `??`, `filter`,
> `reduce`, immutable updates — is what turns that messy response into the clean arrays your pipeline needs.
> The pipeline does not change. Only where the data comes from does.

**Bring:** your `class3` Lab files, working, with the category filter and search both applied correctly. And bring
one nested-data shape that broke your `?.` chain — we will start there.
