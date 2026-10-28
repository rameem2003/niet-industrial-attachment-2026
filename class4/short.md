# Day 4 Short — Async Await, Promises, Timers & Fetch (Easy Version)

> A quick companion to the full lecture in `readme.md`. Read this first, then go deep.
> **Fake API we use for practice:** [JSONPlaceholder](https://jsonplaceholder.typicode.com/) — free, no key, works from the browser.

---

## 1 · The one idea

Some work takes time (network). JavaScript doesn't stop and wait — it **starts the work, keeps going, and comes back later**. That "later" needs a way to hold its place. That place is a **Promise**.

```js
// sync: the answer is there NOW
const a = 1 + 2;

// async: the answer arrives LATER — a Promise is the placeholder
const data = fetch("https://jsonplaceholder.typicode.com/posts/1");
console.log(data); // Promise { <pending> } — NOT the post!
```

---

## 2 · Promises WITHOUT await — the `.then` chain

`.then` says: **when** it arrives, **then** do this.

```js
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then((response) => response.json())   // parse the body → another Promise
  .then((post) => {
    console.log(post.title);              // real data, finally
  })
  .catch((err) => {
    console.log("Something failed:", err.message);
  })
  .finally(() => {
    console.log("hide the spinner here — runs either way");
  });
```

Reading order: *fetch → when it responds, parse json → when parsed, use it → if anything failed, catch → always, finally*.

- `.then` runs only on success.
- `.catch` runs if anything above failed (one catch covers the whole chain).
- `.finally` runs always — perfect for hiding loading spinners.

### The beginner trap: missing `return`

```js
// ❌ the next .then gets undefined
fetch(url)
  .then((res) => { res.json(); })
  .then((post) => console.log(post)); // undefined ❌

// ✅ return it (or drop the braces — arrow short form returns automatically)
fetch(url)
  .then((res) => res.json())
  .then((post) => console.log(post)); // the post ✅
```

### Important: HTTP errors do NOT throw

`fetch` only fails on **network** problems (offline, bad DNS). A 404 still "succeeds"! Always check `ok`:

```js
fetch("https://jsonplaceholder.typicode.com/posts/99999")
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`); // 404 → we make it throw
    return res.json();
  })
  .then((post) => console.log(post))
  .catch((err) => console.log("caught:", err.message)); // caught: HTTP 404
```

---

## 3 · Promises WITH await — the `async/await` way

Same thing, written to *look* synchronous. Easier to read — you'll use this 90% of the time.

```js
async function loadPost() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const post = await response.json();
    console.log(post.title);          // real data
  } catch (err) {
    console.log("Something failed:", err.message);
  } finally {
    hideSpinner();                    // hide it in finally, not only in try
  }
}

loadPost();
```

Rules:

- `await` only works **inside** an `async` function (or in a `<script type="module">`).
- `await` pauses **this function only** — the rest of the page stays alive.
- A rejected promise **throws** at the `await` line → use normal `try / catch`.
- `finally` always runs → hide spinners there.

### Async in one thought:

```js
function noSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function timer() {
  console.log("start");
  await noSleep(1000);   // wait here — page stays responsive
  console.log("1 second later");
}
```

---

## 4 · The two ways side by side

| | `.then` chains | `async` / `await` |
| --- | --- | --- |
| Style | callbacks chained | looks like sync code |
| Error handling | `.catch(() => {})` | `try / catch` |
| Multi-step reads | okay for 1–2 steps | best for many steps |
| You'll write… | when consuming small helpers | everywhere, all course long |

Same job, same result:

```js
// A. then-chain
fetch(url)
  .then((res) => res.json())
  .then((data) => render(data))
  .catch(showError);

// B. await
async function load() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    render(await res.json());
  } catch (err) {
    showError(err);
  }
}
```

Pick **one** style per file and be consistent. Not covered today, but know it exists: `Promise.all` runs several fetches **at once** — Day 4 full lecture, Part 5.

---

## 5 · Timers — `setTimeout` & `setInterval`

Timers are the simplest async tool: no server, no data — just **do it later**. Same event loop, same "come back when ready" deal as `fetch`.

### `setTimeout` — run once, later

```js
const timerId = setTimeout(() => {
  console.log("3 seconds are over");
}, 3000);                 // delay in MILLISECONDS — 3000 = 3 s (not 3!)

clearTimeout(timerId);    // cancel before it fires → nothing runs at all
```

- The delay is **milliseconds**. `setTimeout(fn, 3)` means *3 ms* — the #1 typo bug.
- "After ~3000 ms" is a **minimum**, not a guaranteed countdown.
- `setTimeout(fn, 0)` does **not** mean "now". The current code must finish first — see **Execution order** below.

### `setInterval` — repeat, and repeat, until YOU stop it

```js
let ticks = 0;
const intervalId = setInterval(() => {
  ticks++;
  console.log(`tick ${ticks}`);
  if (ticks >= 5) clearInterval(intervalId);   // the timer stops itself here
}, 1000);                  // every 1000 ms = every second
```

No `clearInterval` → it fires **forever**, long after you stopped needing it (noisy console in class; wasted CPU, battery and endless polling requests in real apps). **Store the id, clear when done.**

### The pattern: both return an id — the id is your handle

| Function | Runs | Stop it with |
| --- | --- | --- |
| `setTimeout(fn, ms)` | **once**, after `ms` | `clearTimeout(id)` |
| `setInterval(fn, ms)` | **every** `ms`, forever | `clearInterval(id)` |

### Timers meet `await`: the `wait` helper

`setTimeout` does NOT return a Promise — it returns a plain number id. To `await` it, wrap it:

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function timer() {
  console.log("start");
  await wait(500);              // pauses THIS function only; page stays responsive
  console.log("half a second later");
}
```

That's the `noSleep` helper from § 3 with a better name — keep it in your snippets file.
Timers themselves never fail (no rejection), so no `try/catch` around `wait` — but code **inside** the timer can still fail: a `fetch` inside a `setInterval` needs its own per-tick error handling.

### Execution order — one rule traces everything

The event loop in one line:

```text
run ALL sync code  →  run ALL microtasks  →  run ONE macrotask  →  (drain new microtasks)  →  ONE macrotask  →  …
```

| Who runs when | Examples |
| --- | --- |
| **Sync code** — runs first, top to bottom | plain statements, `console.log`, loops, math |
| **Microtask queue** — drains fully before the next macrotask | `.then` / `.catch` / `.finally` callbacks, `await` resumptions, `queueMicrotask` |
| **Macrotask queue** — one at a time | `setTimeout`, `setInterval` (every tick!), DOM events (`click`), input |

Three rules that answer 90% of trace questions:

1. **All sync code runs to the bottom before any queued callback.**
2. **Microtasks always beat the next macrotask** — a resolved `.then` fires before a `setTimeout(0)`.
3. **One macrotask at a time** — and the microtask queue re-drains after every single one.

### Trace 1 — the classic

```js
console.log("1 sync");

setTimeout(() => console.log("2 timer"), 0);     // → macrotask queue

Promise.resolve()
  .then(() => console.log("3 micro"))            // → microtask queue
  .then(() => console.log("4 micro"));           // queued by the first microtask

console.log("5 sync");

// logs: 1 sync → 5 sync → 3 micro → 4 micro → 2 timer
```

Step by step:

1. `"1 sync"` runs immediately — sync.
2. `setTimeout` hands its callback to the **macrotask** queue. The code does NOT wait.
3. `.then` schedules a **microtask**. Still no waiting.
4. `"5 sync"` runs — the script reaches the bottom.
5. Stack empty → drain microtasks: `"3 micro"`, its `.then` queues `"4 micro"` (still micro) → `"4 micro"`.
6. Microtasks empty → run **one** macrotask → `"2 timer"`.

Memorize the shape: **promises jump ahead of timers — always.**

### Trace 2 — `await` inside the mix

```js
async function go() {
  console.log("a");
  await Promise.resolve();   // resumes as a MICROTASK
  console.log("b");
}

go();
console.log("c");

// logs: a → c → b
```

`"a"` is sync. `await` suspends **only `go`** — the page never stops. `go()` returns, `"c"` (sync) runs, the stack drains, and `go` resumes past the `await` as a microtask → `"b"`. And `await wait(500)` — our timer wrapper — does the same but resumes on the timer's **macrotask**, still behind every waiting microtask.

### Trace 3 — `setInterval` in the mix

```js
console.log("start");

const id = setInterval(() => console.log("tick"), 1000);   // every tick = one macrotask

setTimeout(() => {
  clearInterval(id);
  console.log("stopped");
}, 2500);

console.log("done");

// logs: start → done → tick (≈1 s) → tick (≈2 s) → stopped (≈2.5 s)
```

No third tick — it was due at ~3 s but `clearInterval` cancelled it first. And every timer callback, interval tick included, waits in the **same macrotask queue**, after microtasks.

### Starvation — heavy sync work freezes EVERYTHING

```js
setTimeout(() => console.log("tick"), 0);

const start = Date.now();
while (Date.now() - start < 3000) {}    // ❌ 3 seconds of busy sync work
console.log("loop done");

// logs: loop done … then — 3 s late — tick
```

The timer was **due**, but the loop holds the call stack; nothing queued runs until the stack empties. Long sync loops starve timers, clicks and fetch callbacks alike — blocking loops freeze whole pages no matter how much "async" you added elsewhere.

---

## 6 · `fetch` in practice — GET and POST

### GET with URL params

```js
const params = new URLSearchParams({ userId: 1 });
const res = await fetch(`https://jsonplaceholder.typicode.com/posts?${params}`);
// /posts?userId=1 — filtered list
```

### POST (and the rule: body must be a STRING)

```js
const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },  // tell the server it's JSON
  body: JSON.stringify({
    title: "Hello Day 4",
    body: "Sent with await.",
    userId: 1,
  }),
});
const created = await res.json();
console.log(created.id); // 101 — fake, nothing is really stored. Fine for class.
```

The 3-point checklist for POST:
- `body` is a **string** → `JSON.stringify(...)`
- `Content-Type: application/json` header set
- the promise **awaited** and `res.ok` **checked**

### The helper worth memorizing

```js
async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  return res.json(); // second await inside — callers do: await fetchJson(url)
}
```

---

## 7 · The three UI states

Every screen that fetches needs **loading**, **error**, **success** — and often empty:

```js
const ui = {
  grid: document.querySelector("#grid"),
  loading: document.querySelector("#loading"),
  error: document.querySelector("#error"),
};

function setState(state) {
  ui.loading.hidden = state !== "loading";
  ui.error.hidden   = state !== "error";
  ui.grid.hidden    = !(state === "success" || state === "empty");
}

async function load() {
  setState("loading");                       // 1. show spinner
  try {
    const posts = await fetchJson("https://jsonplaceholder.typicode.com/posts");
    setState("success");                     // 3. data arrived
    renderCards(posts.slice(0, 10));
  } catch (err) {
    ui.error.textContent = err.message;
    setState("error");                       // 2. something broke
  }
}
```

### Protecting them in the DOM — `textContent`, never `innerHTML`

```js
const p = document.createElement("p");
p.textContent = post.title; // ✅ text, even with suspicious characters
// p.innerHTML = post.title // ❌ could inject markup
```

---

## 8 · Practice — fake-API lab (JSONPlaceholder)

Practice against `https://jsonplaceholder.typicode.com`. Endpoints used today:
`/posts`, `/posts/1`, `/posts?userId=1`, `/users`, `/posts?q=hello` (full-text search), `/posts?_limit=3` (first 3). POST/PATCH/DELETE are **faked** (status 201/200 + returned id, nothing stored) — that's fine.

### Task A — warmup (10 min) · one post, both styles

1. Load `/posts/1` with a `.then` chain. Log `post.title`.
2. Rewrite the same thing with `async/await` + `try/catch`. It should output the same.

### Task B — list + stats (15 min)

1. Load all `/posts` (100 objects). In DevTools, note it's an **array**.
2. Render the first 10 `title`s into `#grid` as `<article><h2>…` cards.
3. Show headline stats: total posts (`length`), unique `userId`s (`new Set(...).size`).

### Task C — filtered join (20 min)

1. Fetch `/posts` and `/users` (all users) **in parallel**: `await Promise.all([...])`.
2. Also fetch `/posts?userId=1` to see what a filtered query looks like.
3. Render only userId ≤ 3, `post.title`, plus **author name** by joining: `users.find((u) => u.id === post.userId)?.name ?? "Unknown"`.

### Task D — create + list + delete (20 min full flow)

1. A form (title, body) → POST (§ 6) → log the response.
2. In devtools' Network tab, click the POST — inspect **Status 201** and the fake `id: 101`.
3. DELETE `/posts/1` → inspect the 200. Merge all into one page.

### Task E (challenge) — one search box, three states (30 min)

- Input → `GET /posts?q=<typed text>` (`q` is JSONPlaceholder's full-text search) → render the matches.
- Three states: `loading` (spinner), `error` (retry button), `empty` ("no match").
- A Retry button on error calls `load()` again.

### Task F — auto-refresh with `setInterval` (20 min)

1. Wrap today's render in a `function refresh()` and call it once at startup.
2. `const id = setInterval(refresh, 10000);` — the page refreshes itself every 10 s.
3. A **Stop refresh** button calls `clearInterval(id)`; a **Start refresh** button creates a new interval
   with a **new** id — store it immediately, or you can never stop it again.
4. Keep the `try/catch` inside `refresh()` (via `fetchJson`) — one failed tick must log an error,
   never kill the loop.
5. Stretch: replace `setInterval` with a `setTimeout` chain that re-arms itself **after** each fetch
   finishes (`await` the fetch, then `refreshTimer = setTimeout(refresh, 10000)`) — same polling,
   but requests can never overlap.

### Task G — trace drills (15 min, paper first)

1. In the DevTools console, predict § 5's three traces **on paper before running each one**. Run, compare.
   For every miss, write one sentence: "I forgot that ___".
2. Then change one thing per run — a second `setTimeout(0)`, a third chained `.then`, another
   `console.log` after `go()` — and re-predict before running again.
3. Boss level: `setInterval` every 1000 ms + `setTimeout` at 3000 ms that prints `"boom"` and runs
   `clearInterval`. Write the expected event list **with rough timestamps** before you run it.

---

## 9 · Cheat sheet

```js
async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

// The daily loop
setState("loading");
try {
  const [posts, users] = await Promise.all([
    fetchJson("https://jsonplaceholder.typicode.com/posts"),
    fetchJson("https://jsonplaceholder.typicode.com/users"),
  ]);
  setState("success");
  renderCards(
    posts.filter((p) => p.userId <= 3)
         .map((p) => ({ ...p, author: users.find((u) => u.id === p.userId)?.name }))
  );
} catch (err) {
  ui.error.textContent = err.message;
  setState("error");
}
```

```js
// Timers — the id each one returns is how you cancel it
const t = setTimeout(() => console.log("later"), 3000);   // ONCE, delay in ms
clearTimeout(t);                                          // cancel before it fires
const id = setInterval(() => console.log("tick"), 1000);  // repeats forever
clearInterval(id);                                        // ALWAYS stop it when done
const wait = (ms) => new Promise((r) => setTimeout(r, ms)); // → await wait(500)

// Execution order — the whole rule in four lines
console.log("sync");                                  // 1. all sync code first
Promise.resolve().then(() => console.log("micro"));   // 3. then ALL microtasks drain
setTimeout(() => console.log("macro"), 0);            // 5. then ONE macrotask
// logs: sync → micro → macro  (promises always beat timers)
```

Timers never fail, so no `catch` around them — but wrap any `fetch` **inside** a timer with its own error handling per tick (see `fetchJson`).

Post — every time: `method` + `Content-Type` header + `JSON.stringify` body.

---

## 10 · Quick self-check

1. What does `fetch` return before data arrives?
2. Why check `res.ok` even though the code used `catch`?
3. `await response.json()` — why is there **a second** `await`?
4. `POST` with a plain object as `body` — which of the three parts is missing?
5. The three UI states every fetch needs? Where does the spinner get hidden?
6. Where does `await` work?
7. `Promise.all` vs three `await`s — when and why?
8. `setTimeout(fn, 3000)` — delay unit? What does it return? How do you cancel it?
9. `setTimeout` vs `setInterval` — how many times does each run, and how is each stopped?
10. Does `setTimeout(fn, 0)` run immediately? Why not (one line)?
11. What happens when you never `clearInterval`?
12. What does the `wait` helper give you inside an `async` function?
13. Trace: `console.log("a")` → `setTimeout(…, 0)` logs `"t"` → `Promise.resolve().then(…)` logs `"m"` →
    `console.log("z")`. Full log order?
14. Microtask vs macrotask — name two of each.
15. A 5-second `while` loop is running. What happens to clicks, fetch callbacks, and timers due during it?

> Answers: (1) a Promise — of a **Response**, not of the data. (2) `catch` only catches **network** failures; 404/500 still fulfil → check `res.ok` to raise your own error. (3) reading + parsing the body is a **second** async step — the body arrives as a stream. (4) the `Content-Type` header, and/or `JSON.stringify` — a raw object can't travel as a body. (5) loading, error, success (+ empty variant) — hide the spinner in `finally`. (6) only inside `async` functions (or at the top level of `<script type="module">`). (7) `Promise.all` when the calls are **independent** — start together, fail fast; sequential `await`s when each step needs the previous one's result. (8) **milliseconds** (3000 = 3 s); it returns an **id**; cancel with `clearTimeout(id)`. (9) `setTimeout` runs **once**; `setInterval` runs **forever**, every `ms` — stopped with `clearTimeout(id)` / `clearInterval(id)` using the id each returned. (10) No — zero is a *minimum* delay; the current call stack and microtasks must drain first (event loop). (11) It fires **forever** — wasted CPU, battery, and (if polling) endless requests after you stopped caring. Store the id, clear it when done. (12) `await wait(500)` — a pause for *that one function* only while the page stays alive; it's the `noSleep` helper from § 3, renamed. (13) `a → z → m → t` — sync first, then the microtask, then the timer macrotask. (14) micro: `.then`/`.catch`/`.finally` callbacks, `await` resumptions, `queueMicrotask`; macro: `setTimeout`, `setInterval` ticks, DOM events like `click`. (15) They all **wait** — the loop owns the single call stack, so due timers fire late and queued callbacks run only after it ends; that's why busy loops freeze pages no matter how much async code exists.
