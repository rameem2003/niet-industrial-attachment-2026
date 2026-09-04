# Full Stack Web Development (MERN + Next.js) — 36-Day Intensive Course

**Duration:** 36 sessions (1 session/day, ~2.5–3 hrs, 6 days/week ≈ 6 weeks)
**Prerequisite:** None assumed — HTML/CSS is refreshed from scratch on Day 1
**Stack Covered:** HTML/CSS, JavaScript (ES6+), Git/GitHub, Tailwind CSS, React.js, Node.js, Express.js, MongoDB, JWT Auth, Next.js (intro)
**Capstone:** Full MERN project + Next.js mini-project, deployed live

> ⚠️ 36 days is compressed. With the 50 days you mentioned, spend the extra ~14 days as buffer: double the React block (Days 7–14), the MongoDB block (Days 19–24), and the MERN Integration block (Days 28–30), and give the capstone 3 full days instead of 1.

---

## Week 1 — Web Foundations & Tooling (Days 1–6)

### Day 1 — HTML & CSS Refresher

**You will learn:**

- HTML5 semantic tags: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`
- Forms: input types (text, email, number, checkbox, radio), labels, placeholder, `required`, basic HTML5 validation
- CSS box model: content, padding, border, margin, `box-sizing: border-box`
- Selectors: class, id, descendant, pseudo-classes (`:hover`, `:nth-child`), pseudo-elements (`::before`, `::after`)
- Flexbox: `flex-direction`, `justify-content`, `align-items`, `flex-wrap`, `gap`
- CSS Grid basics: `grid-template-columns/rows`, `gap`, `grid-area`
- Positioning: static, relative, absolute, fixed, sticky; `z-index`
- Responsive design: media queries, viewport meta tag, mobile-first approach
  **Practice:** Build a static, responsive "profile card" page using plain CSS (Flexbox + Grid), no framework yet.

### Day 2 — Modern JavaScript Refresher I

**You will learn:**

- `var` vs `let` vs `const`, block scope vs function scope, hoisting
- Arrow functions vs regular functions (`this` binding differences)
- Template literals, multi-line strings, string interpolation
- Destructuring: array & object destructuring, default values, nested destructuring
- Spread & rest operators: copying/merging arrays & objects, rest in function args
- Default parameters, short-circuit logic (`&&`, `||`, `??`)
  **Practice:** Refactor 10 ES5 snippets into modern ES6+ syntax; build a "user card generator" using destructuring & template literals.

### Day 3 — Modern JavaScript Refresher II

**You will learn:**

- Array methods: `map`, `filter`, `reduce`, `forEach`, `find`, `findIndex`, `some`, `every`, `includes`, `sort`, `flat`/`flatMap`
- Object methods: `Object.keys/values/entries`, `Object.assign`, optional chaining (`?.`), nullish coalescing (`??`)
- Higher-order functions, basic function composition
- Working with JSON: `JSON.stringify` / `JSON.parse`
  **Practice:** Given a JSON array of "products," filter by category, reshape with `map`, and compute totals with `reduce`.

### Day 4 — Asynchronous JavaScript

**You will learn:**

- The event loop — call stack & callback queue (conceptual overview)
- Callbacks and "callback hell"
- Promises: `.then/.catch/.finally`, `Promise.all`, `Promise.race`
- `async/await` syntax, `try/catch` for error handling
- `fetch` API: GET/POST requests, reading responses, headers
  **Practice:** Fetch data from a public API (e.g. JSONPlaceholder) with `async/await` and render it into the DOM in plain JS, handling loading/error states manually.

### Day 5 — Git & GitHub Essentials

**You will learn:**

- Git basics: `init`, `add`, `commit`, `status`, `log`, `diff`
- Branching: `branch`, `checkout`/`switch`, `merge`, resolving merge conflicts
- Remotes: `clone`, `push`, `pull`, `fetch`, origin vs upstream
- GitHub: creating repos, `README.md`, `.gitignore`, issues
- Pull requests & basic code review, forking workflow
  **Practice:** Create a repo, branch, cause and resolve a merge conflict, then open and merge a pull request.

### Day 6 — Tailwind CSS + Mini Static Project

**You will learn:**

- Utility-first CSS vs traditional CSS
- Setting up Tailwind (Vite), `tailwind.config.js` basics
- Core utilities: spacing, sizing, typography, color, flex/grid utilities
- Responsive prefixes (`sm:`, `md:`, `lg:`), state variants (`hover:`, `focus:`, `dark:`)
- Reusable patterns with `@apply` (optional)
  **Practice/Project:** Rebuild Day 1's profile card in Tailwind, then extend it into a small landing page (nav + hero + cards + dark-mode toggle) — push to GitHub.

---

## Week 2 — React.js Foundations (Days 7–12)

### Day 7 — React Basics

**You will learn:**

- What React is & why (component model, virtual DOM concept)
- Project setup with Vite
- JSX rules: expressions in `{}`, `className`, self-closing tags, fragments
- Functional components, props (including the `children` prop)
- Component composition & reusability
  **Practice:** Build reusable `Card`, `Button`, and `Badge` components and compose them into a small UI.

### Day 8 — State & Events

**You will learn:**

- `useState`: reading/updating state, functional updates
- Event handling: `onClick`, `onChange`, `onSubmit`, the event object
- Conditional rendering: ternary, `&&`, early returns
- Rendering lists with `.map()` and why `key` props matter
  **Practice:** Build a to-do list — add, delete, toggle-complete, filter (all/active/completed).

### Day 9 — Component Communication & Forms

**You will learn:**

- Props drilling and lifting state up
- Controlled vs uncontrolled inputs
- Multi-field forms with basic client-side validation
- Passing callback functions as props (parent ↔ child communication)
  **Practice:** Build a multi-step signup form with validation and a live preview panel driven by lifted state.

### Day 10 — useEffect & Side Effects

**You will learn:**

- `useEffect`: dependency array variations (`[]`, `[dep]`, none)
- Data fetching in components — loading/error/success states
- Cleanup functions (clearing intervals/subscriptions)
- Common pitfalls: infinite loops, stale closures
  **Practice:** Build a GitHub-user search app that fetches from the GitHub API as the user types (with debouncing).

### Day 11 — React Router

**You will learn:**

- SPA vs MPA routing concepts
- `react-router-dom` setup: `Routes`, `Route`, `Link`, `NavLink`
- Dynamic params (`useParams`), nested routes, `Outlet`
- Programmatic navigation (`useNavigate`), catch-all/404 routes
  **Practice:** Turn a product-listing idea into a multi-page app: Home, Products, Product Details (dynamic route), 404 page.

### Day 12 — Context API & Custom Hooks

**You will learn:**

- Why Context API (avoiding deep prop drilling)
- `createContext`, `Provider`, `useContext`
- Writing custom hooks (e.g. `useLocalStorage`, `useFetch`)
- Context vs prop passing vs external state libraries (brief mention of Redux/Zustand)
  **Practice:** Build a global theme (light/dark) context and a shopping-cart context usable from any component.

---

## Week 3 — React Project + Node/Express Basics (Days 13–18)

### Day 13 — React Mini Project I: Product Listing UI

**You will learn/apply:**

- Structuring a multi-component app (`components/`, `pages/`)
- Product cards, search bar, category filter with local state
- Using dummy JSON as a mock API
  **Practice:** Build the Product Listing page with search, category filter, and sort-by-price.

### Day 14 — React Mini Project II: Routing + Cart + Deploy Prep

**You will learn/apply:**

- Adding React Router (a details page per product)
- Cart logic via Context API (add/remove/update quantity)
- Preparing a React app for deployment (build command, env vars)
  **Practice:** Finish the project, deploy to Vercel/Netlify, push to GitHub with a README.

### Day 15 — Node.js Fundamentals

**You will learn:**

- What Node.js is, the event-driven/non-blocking model (conceptual)
- CommonJS (`require`/`module.exports`) vs ES modules (`import`/`export`)
- npm: `package.json`, installing/removing packages, npm scripts
- Built-in modules: `fs` (read/write files), `path`, `os`
  **Practice:** Write a CLI script that reads a JSON file, filters records, and writes the result to a new file.

### Day 16 — Express.js Basics

**You will learn:**

- Setting up an Express server, `app.listen`, basic routes
- Handling GET/POST: `req.params`, `req.query`, `req.body`
- Responding: `res.send`/`json`/`status`
- Serving static files, basic project structure (routes/controllers)
  **Practice:** Build a simple Express server returning JSON (e.g. a "quotes" API) with hardcoded routes.

### Day 17 — Express Routing & Middleware

**You will learn:**

- `express.Router()` for modular routes
- Middleware concept: `app.use`, execution order, `next()`
- Built-in middleware (`express.json`, `express.urlencoded`), custom middleware (logging, auth stub)
- Centralized error-handling middleware
  **Practice:** Build full CRUD (in-memory array) for a "notes" resource, organized with routers + controllers.

### Day 18 — REST API Design + Postman/Thunder Client

**You will learn:**

- REST principles: resources, verbs (GET/POST/PUT/PATCH/DELETE), status codes (200/201/400/404/500)
- API naming/versioning conventions
- Testing with Postman/Thunder Client: collections, environments, saved requests
  **Practice:** Document and test every notes-API endpoint; write a basic `API_DOCS.md`.

---

## Week 4 — MongoDB & Database Layer (Days 19–24)

### Day 19 — MongoDB Basics

**You will learn:**

- SQL vs NoSQL, when MongoDB fits
- MongoDB Atlas setup: cluster, database user, network access
- Documents & collections, BSON vs JSON
- CRUD in Compass/mongo shell: `insertOne`, `find`, `updateOne`, `deleteOne`
  **Practice:** Create a cluster and a database, and manually run CRUD via Compass on a sample collection.

### Day 20 — Mongoose ODM

**You will learn:**

- Installing Mongoose, connecting Express to MongoDB Atlas
- Defining schemas & models, field types, defaults
- Model methods: `create`, `find`, `findById`, `findByIdAndUpdate`, `findByIdAndDelete`
  **Practice:** Convert the Day 17 notes API to persist data in MongoDB via Mongoose.

### Day 21 — Mongoose Validation & Relationships

**You will learn:**

- Schema validation (`required`, `min`/`max`, `enum`, custom validators)
- Referencing (`ObjectId` + `ref`) vs embedding documents
- `populate()` for joined data; timestamps and virtuals (brief)
  **Practice:** Add a Users collection, relate Notes → Users via an `author` field, and populate author info on fetch.

### Day 22 — Full CRUD API with MongoDB

**You will learn:**

- Designing a real schema (e.g. Blog Post: title, content, author, tags, createdAt)
- Pagination basics (`skip`/`limit`), sorting, simple query-param filtering
  **Practice:** Build a complete Blog Post API — create, list (paginated), get by id, update, delete.

### Day 23 — Error Handling & Validation (Backend)

**You will learn:**

- Centralized error handling, custom Error classes
- Input validation with `express-validator` or Joi
- Async error wrapping (avoiding repetitive try/catch in every controller)
- Handling Mongoose-specific errors (`CastError`, `ValidationError`, duplicate key)
  **Practice:** Harden the Blog Post API with validation and consistent JSON error responses.

### Day 24 — Backend Mini Project

**You will learn/apply:**

- Pulling Weeks 3–4 together into one complete, tested REST API (Blog or Task Manager)
- Writing a clean README with setup instructions and API docs
  **Practice:** Finalize and push the backend project to GitHub; peer-test a classmate's API in Postman.

---

## Week 5 — Authentication & Full MERN Integration (Days 25–30)

### Day 25 — Authentication Concepts

**You will learn:**

- Sessions vs token-based auth; cookies vs `localStorage` trade-offs
- Password hashing with bcrypt (`hash`, `compare`, salt rounds)
- JWT structure (`header.payload.signature`), signing & expiry
  **Practice:** Hash and compare passwords in a small script; decode a sample JWT to inspect its payload.

### Day 26 — Implementing JWT Authentication

**You will learn:**

- Signup/login endpoints (hash on signup, compare on login)
- Generating JWTs with `jsonwebtoken`, setting expiry
- Auth middleware: verifying tokens, attaching the user to `req`
- Sending tokens: `Authorization` header vs `httpOnly` cookies
  **Practice:** Add signup/login/protected-route middleware to the Blog API.

### Day 27 — Authorization & Roles

**You will learn:**

- Role-based access control (e.g. admin vs regular user)
- Ownership checks (only the author can edit/delete their post)
- Protecting specific routes/actions by role or ownership
  **Practice:** Add a `role` field to Users; restrict "delete any post" to admins, "edit own post" to authors.

### Day 28 — Connecting React to a Real, Authenticated Backend

**You will learn:**

- Setting up Axios (instance, base URL, interceptors)
- Calling protected endpoints, attaching the JWT to requests
- Storing tokens (`localStorage` vs cookies — security trade-offs)
- Building an `AuthContext` for global auth state
  **Practice:** Build Login/Signup pages in React that call the real backend and store the token.

### Day 29 — Full MERN Integration I

**You will learn/apply:**

- Protected frontend routes (redirect if not logged in)
- Persisting login state on refresh (checking token on app load)
- Displaying user-specific data (e.g. "My Posts")
  **Practice:** Wire up login/signup fully; protect the "create post" page for logged-in users only.

### Day 30 — Full MERN Integration II

**You will learn/apply:**

- Full CRUD from the React UI: create, edit, delete as a logged-in user
- Optimistic UI updates vs refetching after mutations
- Displaying backend validation errors in the UI
  **Practice:** Complete the full-stack Blog/Task app end-to-end — this becomes the capstone base.

---

## Week 6 — Deployment, Next.js & Capstone (Days 31–36)

### Day 31 — Deployment

**You will learn:**

- Deploying the Express backend (Render/Railway): build/start commands, env vars
- MongoDB Atlas for production (IP whitelisting, connection strings)
- Deploying the React frontend (Vercel/Netlify): build settings, env vars
  **Practice:** Deploy the full-stack app; verify signup/login/CRUD work in production.

### Day 32 — Deployment Debugging & Polish

**You will learn:**

- Common production issues: CORS errors, mixed content, env var mismatches
- Debugging live issues with browser dev tools & server logs
- Basic UX polish: loading states, error boundaries
  **Practice:** Fix live bugs on each student's deployed app; add favicon, meta tags, a proper 404 page.

### Day 33 — Next.js Introduction

**You will learn:**

- Why Next.js (SSR/SSG built in, file-based routing, optimizations) vs CRA/Vite
- App Router basics: `app/` folder, `page.js`, `layout.js`, nested routes
- Server Components vs Client Components (`"use client"`), when to use each
  **Practice:** Scaffold a Next.js app; build a home page and an about page with the App Router.

### Day 34 — Next.js Data Fetching & Rendering

**You will learn:**

- Rendering strategies at a high level: SSR, SSG, ISR (`revalidate`)
- Fetching data in Server Components (async components, fetch caching options)
- Building API routes in Next.js (`route.js` handlers)
  **Practice:** Rebuild the Blog listing page in Next.js, fetching from the existing Express API (or a Next.js API route).

### Day 35 — Next.js Mini Task + Career Q&A

**You will learn/apply:**

- Connecting a Next.js page to the existing Express/MongoDB backend end-to-end
- When to choose Next.js vs plain React+Express for a real project
- Open Q&A: interview prep, portfolio tips, resume pointers
  **Practice:** Finish the Next.js blog page with working data and basic styling.

### Day 36 — Capstone Presentation Day

**You will learn/apply:**

- Presenting a full-stack project clearly (demo flow, explaining architecture decisions)
- Giving and receiving peer feedback
  **Practice:** Each student presents their MERN capstone (+ optional Next.js page); instructor feedback; wrap-up (portfolio, GitHub profile, resume).

---

## Tech Stack Summary

- **Frontend:** HTML, CSS, Tailwind CSS, JavaScript (ES6+), React.js, React Router, Next.js (intro)
- **Backend:** Node.js, Express.js, JWT, bcrypt
- **Database:** MongoDB, Mongoose
- **Tools:** Git, GitHub, Postman, VS Code, Vercel/Netlify, Render/Railway, MongoDB Atlas

## Suggested Assessment Structure

- Weekly mini-projects (Days 6, 14, 24, 30): 40%
- Capstone project (Day 36): 40%
- Participation / in-class exercises: 20%
