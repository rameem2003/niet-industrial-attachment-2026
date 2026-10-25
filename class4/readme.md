# Day 4 — Asynchronous JavaScript

**Session length:** ~2.5–3 hours
**Goal of the whole course:** Design, build and deploy a **single-page website using Tailwind CSS**.
**Goal of today:** Get data that is *not already in memory*. Days 2–3 taught you to shape arrays; today you wait for the network, handle failure, and render the result — with loading and error states written by hand.

> **What changed since Day 3**
> Day 3 assumed the products array already existed as a string in your file. Real apps do not ship the catalog
> in the JavaScript. They **ask a server** and wait. Waiting is the whole subject: the event loop, callbacks,
> Promises, `async`/`await`, and `fetch`.
>
> **How this connects to Tailwind.** Tailwind still styles the page. JavaScript now has three extra jobs:
> show a loading skeleton, swap it for cards when the JSON arrives, and swap it for an error message when it
> does not. `classList.toggle("hidden", …)` from Day 2 is how those three states appear. The pipeline from
> Day 3 (`filter → map → reduce → forEach`) runs **after** `await` — same pipeline, different source.
>
> **How this connects to React.** Day 10 (`useEffect` + fetching) is this lecture with a hook around it.
> Learn loading / error / success as three explicit states today and `useEffect` will feel obvious.

---

## Session Plan

| Time | Block | Outcome |
| --- | --- | --- |
| 00:00–00:20 | Why JS is single-threaded; call stack vs waiting | Mental model |
| 00:20–00:50 | The event loop: stack, Web APIs, queues, `setTimeout(0)` | Explain any "why did this log last?" |
| 00:50–01:10 | Callbacks and callback hell | See the problem Promises solve |
| 01:10–01:15 | Break | |
| 01:15–01:50 | Promises: states, `.then` / `.catch` / `.finally`, chaining | Compose async steps |
| 01:50–02:10 | `Promise.all`, `allSettled`, `race`, `any` | Wait for many things |
| 02:10–02:35 | `async` / `await` and `try` / `catch` / `finally` | The syntax you will actually write |
| 02:35–03:10 | `fetch`: GET/POST, status, JSON, headers, abort | Talk to a real API |
| 03:10–04:00 | Lab: JSONPlaceholder posts + users, three UI states | Working live page |

---

# Part 1 — Why Asynchronous Code Exists

## 1.1 JavaScript has one call stack

The browser's JavaScript engine runs **one** piece of your code at a time. It does not pause your function to
go fetch a URL in the middle of a loop. If you wrote a 5-second `while` loop, the page would freeze for five
seconds: no clicks, no scroll, no paint.

```js
// ❌ Never. This blocks the thread.
const start = Date.now();
while (Date.now() - start < 5000) {
  /* busy-wait */
}
```

Network, timers, and file I/O take *time*. If they ran on the same stack, every `fetch` would freeze the UI
until the server answered. Asynchronous JavaScript is the deal: **your code starts the work, then gets out of
the way. The engine calls you back when the work is done.**

## 1.2 Synchronous vs asynchronous

```js
// Synchronous — each line waits for the previous one
const a = 1;
const b = a + 2;
console.log(b);   // 3, immediately

// Asynchronous — the next line does NOT wait
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");
// logs: A, C, B
```

`setTimeout(..., 0)` does **not** mean "run now." It means "run as soon as the current stack is empty and the
timer has fired." `C` is still on the stack, so `B` waits. That single example is the whole event loop.

## 1.3 Who actually waits?

Your JavaScript does not talk to the network itself. The **browser** (or Node) owns Web APIs: `setTimeout`,
`fetch`, `addEventListener`, `Geolocation`, IndexedDB. Those APIs run *outside* the call stack. When they
finish, they drop a callback onto a queue. The event loop is the traffic cop between the stack and those queues.

```text
Your JS  →  "please fetch this URL"  →  Browser network stack (not JS)
                                      ←  when done, queue a callback
Your JS  →  runs that callback later, when the stack is empty
```

---

# Part 2 — The Event Loop

## 2.1 The four pieces

```text
┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Call stack  │     │   Web APIs  │     │  Callback queues │
│  (sync JS)   │────▶│  timers,    │────▶│  macrotask queue │
│              │     │  fetch,     │     │  microtask queue │
└──────────────┘     │  DOM events │     └────────┬─────────┘
        ▲            └─────────────┘              │
        └──────── event loop picks the next ──────┘
                  callback when the stack is empty
```

| Piece | What it is |
| --- | --- |
| **Call stack** | The currently running functions, last-in first-out. If it is not empty, nothing else runs. |
| **Web APIs** | Browser-owned work: timers, network, events. Not JavaScript. |
| **Macrotask queue** | `setTimeout`, `setInterval`, I/O, UI events. Also called the "task queue." |
| **Microtask queue** | Promise `.then` / `.catch` / `.finally`, `queueMicrotask`, `MutationObserver`. |

## 2.2 The loop, in one rule

1. Run whatever is on the **call stack** until it is empty.
2. Run **every** microtask that is waiting (and any new ones they enqueue).
3. Paint the screen if needed.
4. Take **one** macrotask, put it on the stack, go to step 1.

**Microtasks always drain before the next macrotask.** That is why a resolved Promise runs before a
`setTimeout(0)`.

```js
console.log("1 sync");

setTimeout(() => console.log("2 timeout"), 0);

Promise.resolve().then(() => console.log("3 microtask"));

console.log("4 sync");

// 1 sync
// 4 sync
// 3 microtask
// 2 timeout
```

Trace:

1. `"1 sync"` runs on the stack.
2. `setTimeout` is handed to the Web API; its callback goes to the **macrotask** queue after 0ms.
3. `Promise.resolve().then(...)` schedules a **microtask**.
4. `"4 sync"` runs. Stack is now empty.
5. Drain microtasks → `"3 microtask"`.
6. Take one macrotask → `"2 timeout"`.

## 2.3 Why `setTimeout(fn, 0)` is not immediate

Zero milliseconds means "no *minimum* delay," not "run between these two lines." The callback still has to
wait for the current stack **and** every pending microtask. Nested `setTimeout(0)` loops can still feel laggy
because the browser is allowed to clamp timers (often ~4ms once they nest) and because painting sits between
macrotasks.

```js
setTimeout(() => {
  console.log("later");
  // still not "now" — the click handler that scheduled this has already finished
}, 0);
```

Use `setTimeout(0)` to **yield** to the browser (let a paint happen, let a click land). Do not use it as a
substitute for Promises.

## 2.4 `queueMicrotask`

```js
queueMicrotask(() => console.log("micro"));
Promise.resolve().then(() => console.log("also micro"));
```

Both land on the same microtask queue. Prefer Promises / `async` functions in application code; know
`queueMicrotask` exists so you can read traces.

## 2.5 Blocking still blocks the loop

```js
setTimeout(() => console.log("timeout"), 0);
const start = Date.now();
while (Date.now() - start < 2000) {}   // 2s of sync work
console.log("done blocking");
// "done blocking" then, later, "timeout"
```

The timer *fired* two seconds ago, but its callback cannot run until the stack is empty. **Long synchronous
work starves the event loop.** That is why JSON parsing of huge payloads, giant `for` loops, and un-chunked
image processing freeze the UI even if you "used async."

---

# Part 3 — Callbacks and Callback Hell

## 3.1 A callback is just a function you pass in

You have been writing callbacks since Day 2:

```js
button.addEventListener("click", () => {
  console.log("clicked");
});

[1, 2, 3].map((n) => n * 2);

setTimeout(() => console.log("tick"), 1000);
```

An **async callback** is the same idea with a delay: "when this finishes (or fails), call me."

```js
function loadUser(id, onSuccess, onError) {
  setTimeout(() => {
    if (id <= 0) {
      onError(new Error("Invalid id"));
      return;
    }
    onSuccess({ id, name: "Samira" });
  }, 300);
}

loadUser(1, (user) => console.log(user.name), (err) => console.error(err.message));
```

## 3.2 The two-callback problem

Success and failure are two different functions. Forget to pass `onError` and failures vanish. Pass them in
the wrong order and you handle success as an error. Node's old convention was `(error, result)` in **one**
callback — still easy to ignore `error`.

```js
fs.readFile("file.txt", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

## 3.3 Callback hell

When step 2 needs step 1's result, you nest:

```js
loadUser(1, (user) => {
  loadPosts(user.id, (posts) => {
    loadComments(posts[0].id, (comments) => {
      render(user, posts, comments);
    }, onError);
  }, onError);
}, onError);
```

Problems that are not "too many closing braces":

1. **Error handling is duplicated** at every level — or silently dropped.
2. **Control flow is inverted.** `return` and `try/catch` do not wait for the inner callbacks.
3. **You cannot compose.** There is no `map` over "all three of these loads."
4. **Stack traces are useless.** The throw happens in a timer, not in `loadUser`.

Promises exist to turn that pyramid into a **chain** (and then `async`/`await` turns the chain back into
something that *looks* synchronous, with real `try/catch`).

---

# Part 4 — Promises

## 4.1 What a Promise is

A **Promise** is an object representing a value that may arrive later. It has exactly three states:

```text
pending  →  fulfilled (resolved)   with a value
         →  rejected               with a reason (usually an Error)
```

Once it leaves `pending`, it is **settled**. It never changes again. That is the contract: callers can attach
`.then` before or after settlement and still get the same result, once.

```js
const later = new Promise((resolve, reject) => {
  const ok = Math.random() > 0.3;
  setTimeout(() => {
    if (ok) resolve({ id: 1, name: "Samira" });
    else reject(new Error("Network down"));
  }, 400);
});
```

- `resolve(value)` — fulfilled.
- `reject(reason)` — rejected.
- Calling either twice is ignored. The first settlement wins.

**You will almost never write `new Promise` in app code.** You consume Promises that `fetch`, databases, and
libraries return. Write `new Promise` only to **wrap** a callback-based API.

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

## 4.2 `.then`, `.catch`, `.finally`

```js
later
  .then((user) => {
    console.log(user.name);
    return user.id;
  })
  .then((id) => fetchPosts(id))
  .then((posts) => console.log(posts.length))
  .catch((err) => {
    console.error(err.message);
  })
  .finally(() => {
    hideSpinner();
  });
```

| Method | Runs when | Receives | Returns |
| --- | --- | --- | --- |
| `.then(onFulfilled)` | fulfilled | the value | a new Promise of the callback's return |
| `.catch(onRejected)` | rejected | the reason | a new Promise (recovery possible) |
| `.finally(onSettled)` | either | nothing useful | passes the previous settlement through |

**`.then` returns a new Promise.** If the callback returns a value, the next `.then` receives it. If it
returns a Promise, the chain **waits** for that Promise. That is how async steps compose.

```js
Promise.resolve(2)
  .then((n) => n * 3)                 // 6
  .then((n) => wait(100).then(() => n + 1))  // waits, then 7
  .then((n) => console.log(n));
```

## 4.3 Errors propagate down the chain

A throw (or a `reject`) inside any `.then` skips every later `.then` until a `.catch`:

```js
Promise.resolve(1)
  .then((n) => {
    throw new Error("boom");
  })
  .then((n) => console.log("never runs"))
  .catch((err) => {
    console.error(err.message);   // "boom"
    return 0;                     // recovered — chain continues fulfilled
  })
  .then((n) => console.log(n));   // 0
```

**One `.catch` at the end is the default.** Catching in the middle is for recovery, not for logging-and-
continuing-as-if-nothing-happened unless you really mean it.

## 4.4 Forgetting to `return` — the silent bug

```js
fetchUser(1)
  .then((user) => {
    fetchPosts(user.id);          // ❌ not returned — next then gets undefined
  })
  .then((posts) => {
    console.log(posts.length);    // 💥
  });
```

```js
fetchUser(1)
  .then((user) => fetchPosts(user.id))   // ✅ return the Promise
  .then((posts) => console.log(posts.length));
```

Arrow with a block body needs `return`. Expression body returns automatically. Same Day-3 `map` trap, now
with a race: the inner fetch still runs, you just never wait for it.

## 4.5 `Promise.resolve` and `Promise.reject`

```js
Promise.resolve(42);                 // already fulfilled
Promise.reject(new Error("nope"));   // already rejected

Promise.resolve(fetch("/api"));      // unwraps thenable — useful to normalise "value or Promise"
```

Use these in tests, in functions that sometimes already have the data, and to start a chain.

## 4.6 Unhandled rejections

A rejected Promise with **no** `.catch` (and no surrounding `try/catch` on an `await`) becomes an
**unhandled rejection**. Browsers log it; Node may crash in the future.

```js
fetch("/missing");   // ❌ if you never attach .catch, failures are invisible to your UI
```

**Every Promise you create or receive must be awaited or given a `.catch`.** That is a course rule.

---

# Part 5 — Waiting for Many Promises

## 5.1 `Promise.all` — all must succeed

```js
const [user, posts, comments] = await Promise.all([
  fetchJson("/users/1"),
  fetchJson("/posts?userId=1"),
  fetchJson("/comments?postId=1"),
]);
```

- Fulfils with an **array of values**, in the **same order** as the input (not finish order).
- **Rejects on the first rejection.** The others keep running; you just don't get their values.
- Use when you need every result and should fail the page if any request fails.

```js
Promise.all([wait(100), wait(300)]).then(() => console.log("both done"));
```

## 5.2 `Promise.allSettled` — wait for everyone, never short-circuit

```js
const results = await Promise.allSettled([
  fetchJson("/users/1"),
  fetchJson("/broken"),
]);

results.forEach((r) => {
  if (r.status === "fulfilled") console.log(r.value);
  else console.error(r.reason);
});
```

Each item is `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`. Use this for dashboards
where one widget failing should not blank the others.

## 5.3 `Promise.race` — first settlement wins (success *or* failure)

```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timed out")), ms);
  });
  return Promise.race([promise, timeout]);
}

const data = await withTimeout(fetchJson("/slow"), 5000);
```

If the timeout rejects first, you still do **not** cancel `fetch` unless you also `AbortController` (Part 7).
`race` only decides which settlement you observe.

## 5.4 `Promise.any` — first *fulfilment* wins

```js
const data = await Promise.any([
  fetchJson("https://cdn-1.example.com/data"),
  fetchJson("https://cdn-2.example.com/data"),
]);
```

Rejects only if **every** Promise rejects (`AggregateError`). Use for "any mirror is fine."

## 5.5 Decision table

| I want… | Method |
| --- | --- |
| Every result, fail fast if any fails | `Promise.all` |
| Every outcome, including failures | `Promise.allSettled` |
| Whoever finishes first (ok or error) | `Promise.race` |
| First success, ignore earlier failures | `Promise.any` |
| One after another (each needs the previous) | chain / `await` in a loop |

**Do not `await` in a `forEach`.** `forEach` does not wait for async callbacks.

```js
// ❌ fires all at once, does not wait, cannot try/catch around the set
ids.forEach(async (id) => {
  await fetchJson(`/users/${id}`);
});

// ✅ sequential
for (const id of ids) {
  await fetchJson(`/users/${id}`);
}

// ✅ parallel, then wait
const users = await Promise.all(ids.map((id) => fetchJson(`/users/${id}`)));
```

---

# Part 6 — `async` / `await`

This is the syntax you will write for the rest of the course. It is Promises with different clothes.

## 6.1 The two keywords

```js
async function loadProfile(id) {
  const user = await fetchJson(`/users/${id}`);
  const posts = await fetchJson(`/posts?userId=${id}`);
  return { user, posts };
}
```

- **`async`** in front of a function means: this function **always returns a Promise**. `return 5` becomes
  `Promise.resolve(5)`. `throw` becomes rejection.
- **`await`** pauses *this function* (not the whole page) until the Promise settles. The event loop keeps
  running. The rest of the page stays interactive.

```js
async function demo() {
  console.log("A");
  await wait(100);
  console.log("B");
}
demo();
console.log("C");
// A, C, (100ms), B
```

`await` is only legal **inside** `async` functions (and at the top level of ES modules).

```js
// class4/app.js as type="module" — top-level await is allowed
const posts = await fetchJson("https://jsonplaceholder.typicode.com/posts");
```

In a classic non-module script, wrap in `async function main() { … }` and call `main()`.

## 6.2 `try` / `catch` / `finally`

`await` a rejected Promise and it **throws** at the `await` line. That is the point: you get real `try/catch`.

```js
async function loadProfile(id) {
  try {
    const user = await fetchJson(`/users/${id}`);
    const posts = await fetchJson(`/posts?userId=${id}`);
    return { user, posts };
  } catch (err) {
    console.error(err);
    throw err;            // rethrow if the caller should handle it
  } finally {
    hideSpinner();        // always runs — success, failure, or return
  }
}
```

| Piece | When it runs |
| --- | --- |
| `try` | The happy path, including every `await` inside |
| `catch` | Any thrown error or rejected `await` in that `try` |
| `finally` | Always, even if you `return` in `try` or `catch` |

`finally` is where loading spinners die. Do not hide the spinner only in `try` — failures would spin forever.

## 6.3 Sequential vs parallel with `await`

```js
// Sequential — second request starts after the first finishes (~600ms if each is 300ms)
const user = await fetchJson("/users/1");
const posts = await fetchJson("/posts?userId=1");

// Parallel — both start now, then we wait for both (~300ms)
const [user2, posts2] = await Promise.all([
  fetchJson("/users/1"),
  fetchJson("/posts?userId=1"),
]);
```

**Rule:** if request B needs request A's result, `await` A then start B. If they are independent, `Promise.all`.
Naive "await everything in order" is the most common performance bug in async code.

## 6.4 Async functions in the pipeline

```js
async function namesWithPosts(ids) {
  const users = await Promise.all(ids.map((id) => fetchJson(`/users/${id}`)));
  return users.map((u) => u.name);
}
```

`map` of async functions returns an array of **Promises**, not of values. You must `Promise.all` that array.
This is the Day-3 pipeline meeting the network:

```js
const posts = await fetchJson("https://jsonplaceholder.typicode.com/posts");

const titles = posts
  .filter((p) => p.userId === 1)
  .map((p) => p.title)
  .slice(0, 5);
```

`filter` / `map` stay synchronous. Only the **fetch** is async. Do not sprinkle `async` on callbacks that
do not await anything.

## 6.5 `async` event handlers

```js
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await submitContact(new FormData(form));
    statusEl.textContent = "Sent.";
  } catch (err) {
    statusEl.textContent = err.message;
  }
});
```

The handler returns a Promise the browser ignores. **You** must `try/catch` inside, or failures become
unhandled rejections.

---

# Part 7 — The `fetch` API

`fetch` is the browser function that performs HTTP. It returns a Promise of a **Response** — not of JSON.

## 7.1 The smallest GET

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
const post = await response.json();
console.log(post.title);
```

Two awaits:

1. `fetch` settles when **headers** arrive (the body may still be streaming).
2. `response.json()` reads the body and `JSON.parse`s it. That is a second Promise.

Other body readers: `response.text()`, `response.blob()`, `response.arrayBuffer()`, `response.formData()`.
You can only read the body **once**.

## 7.2 HTTP status is not a throw

**This is the most important `fetch` fact.** `fetch` only rejects on **network failure** (offline, CORS,
DNS). An HTTP 404 or 500 **fulfils**. `response.ok` is `true` for status 200–299.

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts/99999");
console.log(response.ok);        // false
console.log(response.status);    // 404
const body = await response.json();  // may be {} — not an Error
```

Always check `ok` (or `status`) before trusting the body:

```js
async function fetchJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const hint = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status} ${response.statusText}${hint ? `: ${hint}` : ""}`);
  }

  if (response.status === 204) return null;   // No Content
  return response.json();
}
```

That helper is what the lab uses. Write it once; call it everywhere.

## 7.3 Response fields you will actually use

| Property / method | Meaning |
| --- | --- |
| `response.ok` | Status 200–299 |
| `response.status` | `200`, `201`, `404`, `500`, … |
| `response.statusText` | `"OK"`, `"Not Found"` |
| `response.headers.get("content-type")` | MIME type of the body |
| `response.url` | Final URL after redirects |
| `response.json()` | Parse JSON body |
| `response.text()` | Raw string body |

```js
const type = response.headers.get("content-type") ?? "";
if (!type.includes("application/json")) {
  throw new Error("Expected JSON");
}
```

## 7.4 GET with query strings

```js
const params = new URLSearchParams({ userId: "1", _limit: "10" });
const posts = await fetchJson(
  `https://jsonplaceholder.typicode.com/posts?${params}`,
);
```

Never concatenate user input into a URL by hand — `URLSearchParams` encodes spaces and `&`.

## 7.5 POST (and PUT / PATCH / DELETE)

```js
const created = await fetchJson("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    title: "Hello from Day 4",
    body: "Fetched with async/await.",
    userId: 1,
  }),
});
```

Rules:

- **`body` must be a string** (or FormData / Blob). Objects are not auto-serialised — you `JSON.stringify`.
- **Set `Content-Type`** when you send JSON. The server cannot guess.
- GET and HEAD must not have a body.
- JSONPlaceholder **fakes** writes: you get a `201` and an `id`, but nothing is stored. Fine for class.

```js
await fetchJson(`https://jsonplaceholder.typicode.com/posts/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Updated" }),
});

await fetchJson(`https://jsonplaceholder.typicode.com/posts/${id}`, {
  method: "DELETE",
});
```

## 7.6 CORS — why some APIs "don't work from a file"

Browsers enforce **Cross-Origin Resource Sharing**. A page on `http://localhost:5173` calling
`https://api.example.com` is a cross-origin request. The **server** must send
`Access-Control-Allow-Origin` (or the request is blocked *in the browser*, even if the server replied).

- Opening `index.html` as `file://` makes origin `null` — many APIs fail. Use a local server
  (`npx serve class4`, VS Code Live Server, or Vite later).
- CORS errors look like network failures in `catch`. DevTools → Network shows the real status; Console shows
  the CORS message.
- You cannot "fix CORS" from frontend JavaScript for a third-party API that forbids you. Use a proxy, or an
  API that allows the browser (JSONPlaceholder does).

## 7.7 Aborting — cancel in-flight work

Search-as-you-type must cancel the previous request or responses arrive out of order.

```js
let controller = null;

async function search(query) {
  controller?.abort();
  controller = new AbortController();

  try {
    const data = await fetchJson(
      `https://jsonplaceholder.typicode.com/posts?q=${encodeURIComponent(query)}`,
      { signal: controller.signal },
    );
    render(data);
  } catch (err) {
    if (err.name === "AbortError") return;   // expected — user typed again
    showError(err.message);
  }
}
```

`AbortError` is not a server failure. Ignore it or you will flash an error on every keystroke.

## 7.8 The three UI states

Every fetch-backed screen has exactly three (sometimes four) states. Name them in your code:

```text
idle      →  nothing asked yet (optional)
loading   →  request in flight
success   →  we have data
error     →  we have a message, not data
```

```js
const ui = {
  grid: document.querySelector("#grid"),
  loading: document.querySelector("#loading"),
  error: document.querySelector("#error"),
  empty: document.querySelector("#empty"),
};

function setState(state) {
  ui.loading.hidden = state !== "loading";
  ui.error.hidden = state !== "error";
  ui.grid.hidden = state !== "success";
  ui.empty.hidden = state !== "empty";
}
```

Day 2's `classList` / `hidden` is enough. Do not leave the previous cards on screen while loading unless you
are doing a silent refresh — then keep them and show a small spinner.

**Never leave `innerHTML` connected to API strings without thinking.** Titles from JSONPlaceholder are safe
enough for class if you use `textContent` on nodes you create. User-generated APIs later are not. Same rule
as Day 2.

---

# Part 8 — Putting It Together

## 8.1 A complete loader

```js
async function loadPosts() {
  setState("loading");
  try {
    const posts = await fetchJson("https://jsonplaceholder.typicode.com/posts");
    const users = await fetchJson("https://jsonplaceholder.typicode.com/users");

    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));

    const cards = posts
      .filter((p) => p.userId <= 3)
      .map((p) => ({
        ...p,
        author: usersById[p.userId]?.name ?? "Unknown",
      }));

    renderCards(cards);
    setState(cards.length ? "success" : "empty");
  } catch (err) {
    ui.error.textContent = err.message;
    setState("error");
  }
}
```

Day 3 tools after the `await`: `map`, `filter`, `Object.fromEntries`, `?.`, `??`. The network is only the
front door.

## 8.2 Parallel version of the same

```js
const [posts, users] = await Promise.all([
  fetchJson("https://jsonplaceholder.typicode.com/posts"),
  fetchJson("https://jsonplaceholder.typicode.com/users"),
]);
```

JSONPlaceholder is fast either way; the habit matters when each endpoint takes 300ms.

## 8.3 Rendering without XSS

```js
function renderCards(cards) {
  const grid = document.querySelector("#grid");
  grid.replaceChildren();

  cards.forEach((card) => {
    const article = document.createElement("article");
    article.className = "card";

    const title = document.createElement("h2");
    title.textContent = card.title;

    const meta = document.createElement("p");
    meta.textContent = card.author;

    const body = document.createElement("p");
    body.textContent = card.body;

    article.append(title, meta, body);
    grid.append(article);
  });
}
```

`replaceChildren()` clears previous results. `textContent` never parses HTML. If you must use a template
string, only interpolate values you wrote yourself — not `card.title`.

---

# Lab — Fetch JSONPlaceholder and Render the DOM

**Time:** 60–90 minutes. **Deliverable:** `class4/index.html`, `class4/app.js`, `class4/styles.css`.

Use [JSONPlaceholder](https://jsonplaceholder.typicode.com/) — a free fake REST API. No key, CORS-friendly.

Serve the folder over HTTP (`npx serve class4` or Live Server). `file://` will fight you.

## Lab 1 — Page shell and three states (15 min)

1. Build a small page: heading "Posts", a `#status` region, `#loading`, `#error`, `#empty`, `#grid`.
2. Loading, error, empty, and grid start with `hidden` as appropriate. Only loading is visible on first paint
   if you auto-fetch, or a "Load posts" button if you want an idle state.
3. Add `<script type="module" src="app.js"></script>` at the end of `<body>` (or `defer` in `<head>`).
4. Write `setState("loading" | "success" | "error" | "empty")` using `hidden` or `classList`.

## Lab 2 — `fetchJson` helper (10 min)

1. Implement `fetchJson(url, options)` from Part 7.2: `fetch` → check `ok` → `json()`.
2. Prove it: `console.log(await fetchJson("https://jsonplaceholder.typicode.com/posts/1"))`.
3. Prove errors: fetch `/posts/99999` or a made-up host and confirm `catch` runs.

## Lab 3 — Load posts + users in parallel (20 min)

1. `Promise.all` posts and users.
2. Join: each post should display **author name**, not only `userId`. Use a `Map` or `Object.fromEntries`.
3. Render with `createElement` + `textContent` (Lab 8.3). No `innerHTML` with API fields.
4. Headline numbers with Day-3 `reduce`: total posts, unique authors, average body length (or word count).

## Lab 4 — Filter, search, empty state (15 min)

1. `<select>` of unique author names. On `change`, filter the **already fetched** array (do not refetch).
2. Search box: filter by title, case-insensitive `includes`, `.trim()`.
3. Combined filter: author **and** search. Empty → `setState("empty")`.
4. A "Retry" button on the error view that calls `loadPosts()` again.

## Lab 5 — POST a new post (15 min, stretch)

1. A form: title, body. `preventDefault`.
2. `POST` to `/posts` with `JSON.stringify`. JSONPlaceholder returns the object with `id: 101`.
3. Prepend the new card onto the local array and re-render (the server will not persist — that is expected).
4. Disable the submit button while the request is in flight; re-enable in `finally`.
5. Optional: `AbortController` if you add live search against the API instead of the local array.

## Self-review before you move on

- [ ] Did I check `response.ok`, not only `catch`?
- [ ] Is every `fetch` either `await`ed inside `try/catch` or given `.catch`?
- [ ] Does `finally` (or equivalent) always hide the spinner?
- [ ] Independent requests use `Promise.all`, not sequential `await`?
- [ ] No `await` inside `forEach`?
- [ ] API text goes through `textContent`, not `innerHTML`?
- [ ] Error UI has a retry path?
- [ ] Empty filter results are distinct from a network error?
- [ ] Page was tested via `http://localhost`, not `file://`?

## Push it

```bash
git add class4
git commit -m "Day 4: async fetch from JSONPlaceholder with loading and error states"
git push
```

---

# Homework

**1. Event-loop traces (30 min).**
Predict the output **before** running each snippet in DevTools. Then run them. Write one sentence per
surprise.

```js
// A
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");

// B
async function go() {
  console.log("X");
  await Promise.resolve();
  console.log("Y");
}
go();
console.log("Z");

// C
setTimeout(() => console.log("macrotask"), 0);
Promise.resolve()
  .then(() => console.log("micro 1"))
  .then(() => console.log("micro 2"));
```

**2. Rewrite callback hell (30 min).**
Take the nested `loadUser` / `loadPosts` / `loadComments` from Part 3.3. Rewrite it with `.then` chains, then
again with `async`/`await` + `try/catch`. Which error path is easier to read?

**3. `Promise.all` vs sequential (20 min).**
Time (use `performance.now()` or `console.time`) three `wait(300)` calls: sequential `await`, `Promise.all`,
and `forEach`+`await`. Record the three durations. Explain the `forEach` result.

**4. Harden `fetchJson` (30 min).**
Add: JSON content-type check, 204 → `null`, timeout via `Promise.race` **and** `AbortController` so the
request actually cancels, and a friendly message for `TypeError` (usually CORS or offline).

**5. Reading (20 min).**
MDN: [Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch),
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise),
[Event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop).
javascript.info: [Event loop](https://javascript.info/event-loop) and
[Async/await](https://javascript.info/async-await). After each section, reproduce one example in the console.

---

# Checkpoint Quiz

Answer these before Day 5. If any takes more than a minute, review that section.

1. Why does a long `while` loop freeze clicks even if you also used `fetch`?
2. What are the four pieces of the event-loop model in this lecture?
3. `console.log` → `setTimeout(0)` → `Promise.then` → `console.log`. What is the log order?
4. Why is `setTimeout(fn, 0)` not "run immediately"?
5. Microtasks vs macrotasks — which drains first, and name one of each.
6. What is callback hell, beyond "too much indent"?
7. A Promise's three states? Can it go from fulfilled back to pending?
8. Does `.then` mutate the original Promise or return a new one?
9. What happens if you omit `return` in a `.then` that starts another `fetch`?
10. Does `fetch` reject on HTTP 404? What should you check?
11. How many Promises does `const data = await fetch(url).then(r => r.json())` involve?
12. `Promise.all` vs `allSettled` vs `race` vs `any`.
13. Why is `ids.forEach(async id => await fetch(...))` wrong?
14. What does an `async` function always return?
15. Where should you hide a loading spinner — `try`, `catch`, or `finally`?
16. When must two `await fetchJson` calls stay sequential rather than `Promise.all`?
17. What does CORS protect, and can the frontend disable it for a third-party API?
18. Why serve the lab over `http://localhost` instead of `file://`?
19. What is `AbortError`, and when should you ignore it?
20. Name the three UI states every fetch screen needs.
21. Why `textContent` instead of `innerHTML` for `post.title`?
22. `response.json()` twice on the same Response — what happens?
23. How do you send a JSON POST body correctly?
24. Top-level `await` works in which kind of script?

<details>
<summary>Answers</summary>

1. JavaScript is single-threaded. The loop occupies the call stack, so the event loop cannot run click handlers or `fetch` callbacks until it finishes.
2. Call stack, Web APIs, macrotask queue, microtask queue — plus the loop that moves work from queues onto the stack when the stack is empty.
3. First `console.log`, second `console.log`, then the Promise `then`, then the timeout. Sync first, then microtasks, then macrotasks.
4. The callback is queued as a macrotask. It runs only after the current stack empties and all microtasks drain. Zero is a *minimum* delay, not a pre-emption.
5. Microtasks drain first. Micro: `Promise.then`, `queueMicrotask`. Macro: `setTimeout`, `setInterval`, most DOM events.
6. Nested async steps duplicate error handling, invert `return`/`try`, cannot compose (`all`/`map`), and produce useless stack traces.
7. Pending, fulfilled, rejected. No — settlement is final.
8. It returns a **new** Promise. The original stays settled with its original value.
9. The next `.then` receives `undefined`. The inner fetch still starts (a floating Promise) but nobody waits or catches it.
10. No. `fetch` rejects on network/CORS failure. HTTP errors still fulfil. Check `response.ok` or `status`.
11. At least two: `fetch`'s Promise (Response) and `json()`'s Promise (parsed body).
12. `all`: every fulfil, else first reject. `allSettled`: wait for all, report each. `race`: first settlement (ok or fail). `any`: first fulfilment, else `AggregateError`.
13. `forEach` does not await async callbacks. Requests fire and the function continues; errors become unhandled rejections. Use `for...of` or `Promise.all(ids.map(...))`.
14. A Promise. Returned values are wrapped; thrown values reject.
15. `finally` (or both success and failure paths). Otherwise errors leave the spinner up.
16. When the second request needs the first response (e.g. fetch user, then fetch `/posts?userId=`). Independent URLs should be `Promise.all`.
17. It stops a page on origin A from reading responses from origin B unless B opts in. You cannot turn it off from JS on a third-party API.
18. `file://` has a `null` origin; CORS and some APIs fail in confusing ways. A local HTTP origin matches real development.
19. The error `fetch` throws when `AbortController.abort()` runs. Ignore it for cancelled searches so the UI does not show an error on every keystroke.
20. Loading, success, error. Empty-results is a fourth success-adjacent state, distinct from error.
21. API strings could contain HTML/script. `textContent` displays them as text. Same XSS rule as Day 2.
22. The body is a stream read once. The second call rejects.
23. `method: "POST"`, `headers: { "Content-Type": "application/json" }`, `body: JSON.stringify(object)`.
24. ES modules (`type="module"` or bundlers). Classic scripts need an `async` wrapper.

</details>

---

# Common Mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Logs show `C` then `B` from `setTimeout(0)` | Macrotask waits for the stack | Expected; use Promises if you needed "right after" |
| Promise `.then` runs before `setTimeout(0)` | Microtasks drain first | Expected |
| Page frozen during "async" work | Heavy sync loop / huge JSON.parse on the stack | Chunk work or move it off the critical path |
| Pyramid of callbacks, errors dropped | Nested callbacks | Promises or `async`/`await` |
| Next `.then` gets `undefined` | Missing `return` of the inner Promise | Return it, or use `async`/`await` |
| Unhandled rejection in Console | No `.catch` / no `try` around `await` | Always handle |
| `fetch` "worked" but data is wrong | 404/500 still fulfil | Check `response.ok` |
| `data.json is not a function` | You `await response.json()` then call `.json` again, or you awaited JSON already | One body read |
| CORS error / `TypeError: Failed to fetch` | Cross-origin or `file://` | Local server; API must allow your origin |
| `await` in `forEach` does not wait | `forEach` ignores the returned Promise | `for...of` or `Promise.all` |
| Two requests in series for no reason | Sequential `await` | `Promise.all` when independent |
| Spinner never hides | Hidden only in `try` | `finally` |
| Search results flicker / reorder | Overlapping fetches | `AbortController`; ignore `AbortError` |
| XSS in post titles | `innerHTML` + API text | `textContent` |
| POST body empty on the server | Sent an object as `body` | `JSON.stringify` + Content-Type |
| Lab fails opened as a file | `file://` origin | `npx serve` / Live Server |

---

# Cheat Sheet

```js
// Event loop reminder: sync → microtasks → one macrotask
console.log("sync");
Promise.resolve().then(() => console.log("micro"));
setTimeout(() => console.log("macro"), 0);

// Wrap a callback API
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Consume
fetchJson(url)
  .then((data) => render(data))
  .catch((err) => showError(err.message))
  .finally(() => hideSpinner());

// Combinators
await Promise.all([a, b]);           // all values, fail fast
await Promise.allSettled([a, b]);    // {status, value|reason}[]
await Promise.race([a, timeout]);    // first settlement
await Promise.any([cdn1, cdn2]);     // first success

// async/await
async function load() {
  try {
    const [posts, users] = await Promise.all([
      fetchJson("https://jsonplaceholder.typicode.com/posts"),
      fetchJson("https://jsonplaceholder.typicode.com/users"),
    ]);
    return { posts, users };
  } catch (err) {
    throw err;
  } finally {
    hideSpinner();
  }
}

// fetchJson — always check ok
async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// POST JSON
await fetchJson(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Hi", body: "…", userId: 1 }),
});

// Query string
const url = `https://jsonplaceholder.typicode.com/posts?${new URLSearchParams({ userId: "1" })}`;

// Cancel
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort();

// Sequential vs parallel
for (const id of ids) await fetchJson(`/users/${id}`);                 // one after another
const users = await Promise.all(ids.map((id) => fetchJson(`/users/${id}`))); // together

// Three states
setState("loading" | "success" | "error" | "empty");
```

---

# Reference

- [MDN — Using fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN — Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN — Event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
- [javascript.info — Promises, async/await](https://javascript.info/async)
- [javascript.info — Event loop](https://javascript.info/event-loop)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) — fake REST API for the lab
- [Can I Use — fetch](https://caniuse.com/fetch) — baseline everywhere you will deploy this course

---

# Tomorrow — Day 5: Git & GitHub Essentials

Today the data lived on someone else's server. Tomorrow your **code** lives on GitHub.

- Git basics: `init`, `add`, `commit`, `status`, `log`, `diff`
- Branching: `branch`, `switch`, `merge`, resolving conflicts
- Remotes: `clone`, `push`, `pull`, `fetch`
- GitHub: repos, `README.md`, `.gitignore`, issues, pull requests
- **Practice:** create a repo, branch, cause and resolve a merge conflict, open and merge a PR

> **Why today's work belongs in git:** the fetch lab is the first time your page depends on **time** (loading)
> and **failure**. Commit the working three-state UI. Day 6's Tailwind rebuild and Day 10's `useEffect` fetch
> will copy this pattern; you will want the history.

**Bring:** `class4` loading, success, error, and empty all working on `localhost`. And one event-loop trace
from the homework you predicted wrong — we will start there.
