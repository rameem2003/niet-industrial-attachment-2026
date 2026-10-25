# Day 5 — Git & GitHub Essentials

**Session length:** ~2.5–3 hours
**Goal of the whole course:** Design, build and deploy a **single-page website using Tailwind CSS**.
**Goal of today:** Give your work a permanent, edit-proof history and a public home. Days 1–4 produced files that exist exactly once, on one machine, with no undo past Ctrl+Z. Today you learn **Git** — snapshots you can travel between, branches you can experiment on without fear — and **GitHub**, where that history lives safely, gets shared, and gets reviewed. From today on, every session ends with `commit` and `push`.

> **What changed since Day 4**
> Day 4 made your page depend on a **network**: you asked a server, waited, and handled failure. Today your
> **code** starts using a network too. Git is a local time machine; GitHub is the place it is backed up and
> shared. `pull` and `push` are the network version of `add` and `commit` — download work down, upload work up.
>
> **How this connects to the rest of the course.** Day 6's Tailwind project is pushed to GitHub. Day 14 and
> Day 24 end with deployed projects — and Vercel/Netlify build **straight from your Git repo**, so a broken
> history breaks your deploy. From Day 15 onward you will commit a `.gitignore` (never ship `node_modules`
> or `.env`). The capstone is a team effort with pull requests. Learn the loop today and every later day is
> 30 seconds at the end: `add → commit → push`.
>
> **This is the first tools day, not a coding day.** You will barely touch HTML/CSS/JS. Everything you learn
> is the workflow that carries the other 35 days.

---

## Session Plan

| Time | Block | Outcome |
| --- | --- | --- |
| 00:00–00:15 | Why version control; what a commit really is | Mental model: snapshots, not copies |
| 00:15–00:40 | The three areas; `status`, `add`, `commit`, `log`, `diff` | The daily loop, cold |
| 00:40–00:55 | `.gitignore` — what never gets committed | Clean repos from day one |
| 00:55–01:15 | Undoing: `amend`, `restore`, `reset`, `revert`, `reflog` | Fix your own mistakes calmly |
| 01:15–01:20 | Break | |
| 01:20–01:50 | Branching: what a branch actually is, `switch`, `merge` | Experiment without fear |
| 01:50–02:15 | Merge conflicts: why they happen, resolving them | Conflict = data, not error |
| 02:15–02:40 | Remotes: `clone`, `remote`, `push`, `pull`, `fetch`, origin vs upstream | The publish loop |
| 02:40–03:00 | GitHub: creating a repo, `README.md`, issues | A repo worth showing |
| 03:00–03:20 | Pull requests, code review, fork workflow | The team workflow |
| 03:20–04:00 | Lab: repo → branch → conflict → PR → merge | Working history on GitHub |

---

# Part 1 — Why Version Control Exists

## 1.1 The problem before Git

Without version control, projects look like this:

```text
index.html
index-v2.html
index-v2-final.html
index-v2-final-FINAL.html
index-final-really.html        ← which one is live? which one has the fix?
```

Git replaces that folder mess with four abilities you will use every hour from now on:

| Ability | What it gives you |
| --- | --- |
| **Save points** | Commit and you can return to that exact state forever |
| **Blame/history** | Who changed this line, when, and why (the commit message) |
| **Safe experiments** | Branch, try anything, delete it if it fails |
| **Sharing & backup** | Push to GitHub; your laptop can die and you lose nothing |

## 1.2 What Git actually is

Git is a **content-addressed filesystem that stores snapshots**. When you commit:

- It records a **snapshot** of every tracked file's content (unchanged files are referenced, not re-stored).
- It links that snapshot to its **parent commits**, plus metadata: author, email, date, and your message.
- Each commit gets an **SHA hash id** — like `e4f2a91` — computed from the content. Change one byte anywhere
  and the hash changes. This is why Git can detect corruption and why no two commits are ever the same.

```text
              commit e4f2a91
        ┌─────────────────────────────┐
        │ parent:  b8d1c02            │
        │ author:  Samira  2026-10-25 │
        │ message: "add error state"  │
        │ snapshot: every tracked file│
        └─────────────────────────────┘
                ▲         ▲
              b8d1c02   (parent)  a1f9e33  (parent)   ← …back to the first commit
```

Two consequences that explain almost everything later:

1. **History is immutable.** A commit never changes; new commits point *back* at it. (You can rewrite
   history with `reset` — Part 5 — but that creates *new* commits over a *new* chain.)
2. **A commit id commits the snapshot, not the folder.** There is no "committing a file" — `add` stages
   content, `commit` snapshots whatever is staged.

## 1.3 The three areas — the model to hold all day

Your code lives in up to **four** places at once:

```text
   working directory          staging area              local repository           remote repository
   (the real files         (the NEXT commit,        (full .git history on       (origin: GitHub
    you edit)                selected with add)        your machine)               or a server)

 ──────────────── git add ──────────────► git commit ──────► ── git push ─────►
 ◄───── git restore ─┘   ◄─ git restore --staged ─┘      ◄─ git merge / pull ─────── git fetch ───────┘
```

| Area | Command that fills it | Command that empties it |
| --- | --- | --- |
| Working directory | your editor, `git pull`, `git merge` | `git restore <file>` (destructive!) |
| Staging area | `git add` | `git restore --staged <file>` |
| Local repository | `git commit` | rewrite/reset (Part 5) |
| Remote repository | `git push` | — (nobody rewrites a shared remote) |

**Commit ⇒ push.** A commit made and never pushed still exists only on your machine. If Git says
"nothing to commit" but GitHub looks old, look for `git push`.

---

# Part 2 — Setup and the First Commit

## 2.1 Install and configure (once per machine)

Install Git from <https://git-scm.com> (Windows: Git for Windows ships Git Bash + the `git` command for
PowerShell/CMD). Verify and configure:

```bash
git --version

# Your name and email go INSIDE every commit you make — forever, publicly
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Use 'main' as the default first branch name (Git's old default was 'master')
git config --global init.defaultBranch main

# In VS Code, let Git open the editor for commit messages (optional)
git config --global core.editor "code --wait"

# See everything you have configured
git config --global --list
```

Windows note: you may see `warning: LF will be replaced by CRLF` — Git for Windows converts line endings.
It is a warning, not an error. Leave `core.autocrlf` at its installer default.

**GitHub tip:** use the **same email** as your GitHub account (Settings → Emails) so commits link to your
profile and show up as contributions.

## 2.2 Start a repository

Two ways, and which one you use matters:

```bash
# A. Start from nothing — turn the current folder into a repo
mkdir git-practice
cd git-practice
git init

# B. Start from an existing repo — download a full copy INCLUDING history
git clone https://github.com/USER/REPO.git
```

- `git init` creates a hidden `.git/` folder. **That folder *is* the repository.** Delete it and all local
  history is gone (GitHub does not count — never rely on that).
- `clone` is `init + remote add + fetch + checkout` in one command, and pre-wires `origin` (Part 6).
- Do **not** nest repos: don't `git init` inside a folder that is already inside another repo, unless you
  intend a separate project there.

## 2.3 The daily loop, demonstrated

```bash
echo "# My Practice Site" > README.md
git status                 # Untracked files: README.md (red)
git add README.md          # stage it
git status                 # Changes to be committed: README.md (green)
git commit -m "Add README with project description"
git status                 # nothing to commit, working tree clean
git log --oneline          # e4f2a91 (HEAD -> main) Add README with…
```

That is the whole day compressed: **status → add → commit**. Say what you are doing with `status` between
each step for your first hundred commits, then your fingers will run it alone.

## 2.4 Staging — why the middle area exists

You don't have to commit everything at once. Stage exactly what belongs together:

```bash
git add styles.css           # one file
git add index.html app.js    # several
git add .                    # everything in the current folder (careful — see .gitignore)
git add -p                   # interactive: approve each hunk separately
```

`add -p` is the professional habit: reviewing your own changes right before committing is the cheapest code
review you will ever do.

## 2.5 Reading history: `log`

```bash
git log                        # full detail: id, author, date, message
git log --oneline             # one line per commit
git log --oneline -5          # last 5
git log --oneline --graph --all   # little ASCII branch diagram — the single most useful log
git log -p styles.css             # actual diffs in history of one file
git log --author="Samira"
```

## 2.6 Commit messages: a standard you will keep forever

```text
❌  changes
❌  asdf
❌  fixed stuff and updated files
✅  Add error state to fetch helper
✅  Fix search debounce firing on every keystroke
```

Rules the whole course follows:

1. **Imperative mood** — write it as an order: "Add…", "Fix…", "Remove…" (fits "This commit will *…*").
2. **Why over what** — the diff shows *what*; the message explains *why*.
3. **Subject ≤ ~50 chars**, then a blank line and details if needed (`git commit` opens the editor for it).
4. **One logical change per commit.** "Fix bug + rename 8 files + add feature" is three commits.

Reference a GitHub issue by number: `git commit -m "Fix cart total rounding (#12)"` — GitHub links it.

## 2.7 `diff` — see changes before they become commits

```bash
git diff                       # working directory vs staged
git diff --staged              # staged vs last commit (what the NEXT commit will contain)
git diff HEAD                  # working directory vs last commit (both together)
git diff main..feature         # one branch vs another
git diff b8d1c02 a1f9e33       # between any two commits
```

```diff
- const hero = "old headline";
+ const hero = "new headline";
```

Red-minus = what disappears, green-plus = what appears. **`diff --staged` before every commit** is the
habit that stops the "I committed the console.log" incident.

---

# Part 3 — `.gitignore`: What Never Gets Committed

## 3.1 Why

Some files must not live in a public or shared repo:

| Never commit | Why |
| --- | --- |
| `node_modules/` | Rebuilt from `package.json` by `npm install`; thousands of files |
| `.env` | Secrets — API keys, DB passwords. Committed once = leaked forever (it stays in history) |
| `dist/`, `build/`, `.next/` | Generated output; rebuildable |
| `.DS_Store`, `Thumbs.db` | OS junk |
| `.vscode/`, editor settings | Personal preferences (usually) |
| logs, `.cache/`, coverage | Machine-local noise |

## 3.2 Using it

Create a file named exactly `.gitignore` (careful — dotfiles are hidden in some file explorers) in the repo
root:

```gitignore
# dependencies
node_modules/

# build output
dist/
.vite/

# environment / secrets
.env
.env.*

# OS junk
.DS_Store
Thumbs.db

# logs
*.log
```

Patterns: `*.log` = any file ending in `.log`; `node_modules/` = that folder anywhere; `!keep.png` =
un-ignore a previously ignored file.

## 3.3 Gotchas that every beginner hits

```bash
# 1. Ignoring does NOT un-track a file that is already committed
git rm --cached .env        # stop tracking it, but KEEP it on disk
git commit -m "Stop tracking .env"   # then add .env to .gitignore

# 2. "Why is my file still ignored / not ignored?"
git check-ignore -v app.log      # shows exactly which .gitignore rule matched
git status --ignored             # show ignored files too

# 3. Committing .gitignore itself — YES, you should (it travels with the repo)
git add .gitignore
git commit -m "Add .gitignore"
```

Starter templates for every situation: <https://github.com/github/gitignore> (look for `Node.gitignore`
from Day 15, `Python.gitignore` whenever you need it).

> 🔐 **If you ever commit a secret:** deleting the file does not remove it from history. Rotate the key
> (assume it is public), then remove it from history (`git filter-repo` or ask for help). Rotation first —
> scanners find secrets within minutes.

---

# Part 4 — Undoing Things

Learn this before you need it — panicked Googling at 2 a.m. is how repos get destroyed.

| Situation | Command | Notes |
| --- | --- | --- |
| Messed up an unstaged file | `git restore index.html` | ⚠️ Discards changes permanently |
| Committed too early / forgot a file | `git add <file>` then `git commit --amend` | Amends the LAST commit |
| Amend the message only | `git commit --amend -m "Better message"` | |
| Staged something by accident | `git restore --staged index.html` | Keeps the changes, just unstages |
| Undo a commit, KEEP the work | `git reset --soft HEAD~1` | Changes go back to staging |
| Undo a commit, keep work unstaged | `git reset HEAD~1` (default `--mixed`) | |
| Delete a commit and its changes | `git reset --hard HEAD~1` | ⚠️ Destructive |
| Undo a commit *someone else may have* | `git revert <sha>` | Creates an inverse commit — safe |

## 4.1 Amend — reshape the last commit

```bash
git commit --amend                      # opens editor: fix the message
git add forgotten.css
git commit --amend --no-edit            # keep message, absorb the file
```

**Amend only commits you have not pushed.** If the commit is on GitHub and others pulled it, rewriting it
means the next `push` is rejected (Part 6.5). If nobody else saw it: amend freely.

## 4.2 Reset vs revert — the one to memorise

```bash
git reset --hard <sha>    # 🔨 moves the branch pointer back and REWRITES history.
                          #    Use only on YOUR unshared commits.

git revert <sha>          # ➕ does NOT remove the old commit. It adds a NEW commit
                          #    that reverses it. History stays intact. Use on
                          #    anything already pushed.
```

## 4.3 `reflog` — the safety net almost nobody knows

```bash
git reflog                 # every place HEAD has been, even after resets
git reset --hard e4f2a91   # jump back to any previous state
```

Even after a scary `reset --hard`, commits usually live in the reflog for ~90 days. Before panicking:
`git reflog`, find the good hash, `git reset --hard` to it. (Pro Reference below links the details.)

---

# Part 5 — Branching

## 5.1 What a branch actually is

A branch is **a 41-byte text file containing one commit hash**. That's the whole trick.

```text
main            ──► a1f9e33        a1f9e33 ──► b8d1c02 ──► e4f2a91 …
feature/cards   ──► c7d2f10        (each commit points at its parent)
HEAD            ──► main           (HEAD = where YOU are)
```

- `main` and `feature/cards` are **names pointing at commits**. Creating a branch costs nothing; Git does
  not copy files, it writes a tiny pointer.
- **HEAD** is your current position. On a branch, HEAD points at the branch name, which points at the
  newest commit.

```bash
git branch                    # list branches; * = where you are
git branch feature/cards      # create (but don't move onto it)
git switch feature/cards      # move HEAD onto it
git switch -c feature/nav     # create AND switch in one go  ← the daily command
git switch main               # back to main
```

Old tutorials say `git checkout`: `checkout` does three jobs (switch branch, restore files, detached HEAD)
and newer Git split them — use **`switch`** for moving HEAD and **`restore`** for files.

## 5.2 Why branch: the standard loop

```text
1. git switch -c feature/nav      # new line of work
2. …edit, add, commit, repeat…    # several save points, main untouched
3. git switch main                # back to the safe line
4. git merge feature/nav          # bring the work in
5. git branch -d feature/nav      # delete the pointer; commits are already in main
```

Rule for this course: **one branch per feature/task, short-lived, merged (or via PR) the same day.**
Long-lived month-old branches are where merge pain is manufactured.

## 5.3 Merging

```bash
git switch main
git merge feature/nav
```

Two kinds of merge, and you must be able to recognise both:

```text
Fast-forward — main never moved since the branch started; just slide the pointer:

  before:   main──►b ──►c ──►d ◄──feature
  after:              main ──► c ──► d         (no new commit created)

Three-way — both branches added commits since they split; Git creates a MERGE COMMIT
with two parents:

  a1 ── b ── c ── d        main
    └── x ── y ──┘ ▲       feature
               merge commit (parents: d and y)

  git log --oneline --graph shows the diamond; that diamond is a three-way merge.
```

Three-way is not an error — it is honest history saying "two lines of work merged here." If you prefer a
straight line on your own branches: `git merge --no-ff feature` forces a merge commit even when a
fast-forward was possible (small, tidy history).

## 5.4 Merge conflicts — they are data, not errors

A conflict happens **only** when both branches changed the **same lines** of the same file since they split
(concurrently-edited adjacent lines count as same). Git cannot read minds, so it stops and asks.

```bash
git merge feature/hero
# Auto-merging index.html
# CONFLICT (content): Merge conflict in index.html
# Automatic merge failed; fix conflicts and commit the result.
```

The conflicted file now contains **merge markers**:

```text
<<<<<<< HEAD
<h1>Welcome to my old site</h1>
=======
<h1>Welcome to my NEW site</h1>
>>>>>>> feature/hero
```

| Marker | Meaning |
| --- | --- |
| `<<<<<<< HEAD` | start of **your** branch's version |
| `=======` | separator |
| `>>>>>>> feature/hero` | end of **their** (incoming) version |

Resolving — always the same four steps:

```bash
git status                        # 1. See which files are "both modified"
# 2. Open each file, edit the content between markers into what it SHOULD say.
#    (You may keep yours, theirs, or a blend — a decision, not detective work.)
git add index.html                # 3. Stage the resolved file (this marks it resolved)
git commit                        # 4. Git pre-fills a merge message — save and close
```

```text
After editing (a deliberate blend):
<h1>Welcome to my site — and now with a hero section</h1>
```

Escape hatches and tools:

```bash
git merge --abort            # return to exactly the state before the merge
git diff --name-only --diff-filter=U   # list conflicts only
git merge --continue         # after resolving, same as commit
```

VS Code has a "Merge Editor" button on conflicted files with *Accept Current / Incoming / Both* actions —
use it in class until the raw markers feel natural.

**Prevention:** pull before starting work, small commits, short-lived branches, don't reformat files
wholesale "while you're in there" (reformatting makes every line "changed").

---

# Part 6 — Remotes: Publishing and Updating

## 6.1 A remote is just another copy of the repo

Your `.git` history is self-contained. A **remote** is a URL to *another* copy of that same history (on
GitHub or any server). You push commits to it and fetch commits from it. The default name — pure
convention, not magic — is **`origin`**.

```bash
git remote -v                 # list remotes
git remote add origin https://github.com/USER/REPO.git   # connect an existing repo
git remote remove origin
git branch -r                 # branches that exist on remotes
```

(Your GitHub **username + token** is the password for HTTPS pushes — GitHub no longer accepts account
passwords; when pushing, GitHub will prompt or use a cached credential. In class, Git Credential Manager
handles this automatically after the first push.)

## 6.2 First push — and what `-u` does

```bash
git push -u origin main
```

- `origin main` = "push my local branch named `main` to `origin`."
- **`-u`** (once per branch) sets up **tracking**: from now on, `git push` and `git pull` remember the
  counterpart and know you mean *this* branch. Track every branch you push: `git push -u origin feature/nav`.

## 6.3 `fetch` vs `pull` — the distinction worth having

```bash
git fetch origin       # DOWNLOAD new commits from origin. Your files DON'T change yet.
                       # You can then inspect and decide:
git log main..origin/main --oneline    # what did they add?
git merge origin/main  # …and merge it when ready.

git pull               # fetch + merge in one step. Convenient — and when the merge
                       # conflicts, you are resolving mid-pull anyway. Same tool, less choice.
```

**Daily rhythm:** `git pull` when you sit down and before you start new work; `git push` when you finish.
`pull` on a repo with uncommitted changes works, but a conflicted pull on a dirty tree is painful — commit
or stash before pulling.

## 6.4 `origin` vs `upstream`

When you work with someone *else's* repo (or a fork — Part 8.4), you end up with **two** remotes:

```text
        upstream  = the ORIGINAL repo you don't control     (read-only for you)
              │          you never push here
              ▼  PR / pull request
        origin    = YOUR copy (fork) on GitHub              (you own it)
              ▲  push
              │
        your machine = local repo
```

Keep your fork's `main` in sync with the original:

```bash
git remote add upstream https://github.com/ORIGINAL/REPO.git
git fetch upstream
git switch main
git merge upstream/main       # or: git rebase upstream/main (later in the course)
git push
```

## 6.5 When push is rejected: "non-fast-forward"

```text
 ! [rejected]        main -> main (fetch first)
 hint: Updates were rejected because the remote contains work that you do not have locally.
```

Translation: **someone (or you, from another machine) pushed commits you don't have.** Git refuses to
overwrite their work.

```bash
git pull                 # fetch + merge their commits into yours
git push                 # now it goes through
```

Never open history-rewrite commands just because push was rejected. Nine times out of ten: pull first.

---

# Part 7 — GitHub: A Repo Worth Showing

## 7.1 Creating a repo on github.com

**New → New repository** → choose a short kebab-case name (`git-practice`, `portfolio-2026`) → set Public
(employers can see it) or Private → **leave "Initialize this repository" unchecked** if you have a local
repo to push (a pre-made README means GitHub's history and yours are two different histories that must be
merged first). Then follow GitHub's printed instructions:

```bash
cd existing-local-repo
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

Already created the repo WITH a README (GitHub and you both have a `main`)? Reconcile honestly:

```bash
git pull origin main --allow-unrelated-histories   # merges GitHub's initial commit with yours
git push -u origin main
```

Better: **delete the empty GitHub repo** and create it uninitialized for this course.

## 7.2 `README.md` — your repo's front door

The first file every visitor reads. Structure this course will reuse on Days 14, 24, 36:

```markdown
# Project Name

One-sentence description. What it does, for whom.

## Tech stack
List the notable tools.

## Getting started
git clone https://github.com/USER/REPO.git
cd project
npm install      (when that exists)
npm run dev

## Features
- Search, filter and sort
- Responsive, dark mode

## Author
Your name — [GitHub](https://github.com/you)
```

Markdown speed guide: `#`/`##` headings, `- ` bullets, `**bold**`, `code`, triple-backtick fences,
`[text](url)` links, tables like the one you are reading. Every day's commit of this file is practice.

## 7.3 Issues — your project's to-do list

GitHub Issues are lightweight tickets; teams and real projects plan with them:

```text
#1  "Dark mode toggle broken in Safari"      (open → label: bug)
#2  "Add search to the products page"        (open → label: enhancement)
```

Useful forever, tiny to learn: create issues instead of scatter-brained "TODO" notes; close one with a
commit or PR that **links the number**:

```bash
git commit -m "Add search to products page (#2)"
# PR description containing: fixes #2   → GitHub closes the issue automatically on merge
```

Labels (bug / enhancement / documentation) and the Issues tab are what your peers should open on each
other's repos in the homework.

---

# Part 8 — Pull Requests, Code Review & the Fork Workflow

A pull request (PR) is **not a Git command** — it is a **GitHub feature**: "please merge branch X into
branch Y," with a diff view, review thread, and a record. It's how teams land work safely; it's how you'll
land capstone work.

## 8.1 The basic PR workflow (shared repo)

```bash
# 1. Work on a branch, as always — never commit straight to main on a team repo
git switch -c feature/nav
git add . && git commit -m "Add nav bar"
git push -u origin feature/nav
```

1. GitHub offers a **"Compare & pull request"** button right after the push — take it (or PRs → New).
2. Fill the description: **what** changed, **why**, **how to test it**. Reference issues (`fixes #3`).
3. Request reviewers. They see exactly your diff — nothing else.
4. Merge via the green button (see options below), then:
   ```bash
   git switch main
   git pull            # get the merged result locally
   git branch -d feature/nav
   ```

## 8.2 Reviewing — what to actually do

Reading a teammate's diff is a skill employers ask you to demo. On the Files changed tab:

| Look for | Comment style |
| --- | --- |
| Bugs you can *see* in the diff | "This runs before `auth` checks — move below line 24?" |
| Missing edge cases | "What if `products` is empty → blank grid?" |
| Naming/clarity | "Rename `data2` → `savedUsers`?" |
| Larger designs | Use PR description Discussion rather than line comments |
| Praise what's good | Comment approvals improve code AND trust |

Then **Approve / Request changes / Comment**. Authors fix → push to the same branch → the PR updates
automatically (that's the beauty: PRs are *living*, not frozen).

## 8.3 Merge options on GitHub

| Option | History effect | Use when |
| --- | --- | --- |
| **Create a merge commit** | branch commits + one merge commit | Default; preserves real structure |
| **Squash and merge** | all branch commits flattened into ONE | 17 "fix typo" commits you'd rather not keep |
| **Rebase and merge** | branch commits replayed linearly | Clean history, no merge commit (later) |

For this course: merge commit or squash — both are fine. Delete the branch after merge; the commits stay in
`main`.

## 8.4 The fork workflow (when you can't push to the repo)

Open-source's standard path: **fork → clone → branch → push to your fork → PR to upstream.**

```bash
# 1. Click "Fork" on github.com/ORIGINAL/REPO → you get USER/REPO
# 2. Clone YOUR fork (this becomes origin)
git clone https://github.com/USER/REPO.git
cd REPO
# 3. Name the original so you can update from it
git remote add upstream https://github.com/ORIGINAL/REPO.git
git fetch upstream
# 4. Branch from the upstream state and work
git switch -c fix/readme-typo origin/main
# …edit, commit…
git push -u origin fix/readme-typo
# 5. On GitHub: your branch → "Compare & pull request" → into ORIGINAL's main
```

You'll do this to a classmate's repo in Lab 5 and to a real project in Homework 4.

## 8.5 Why this matters beyond the course

- **Vercel/Netlify deploy straight from your repo** (Day 14/31) — every push builds, every PR gets a live
  preview URL. Clean history = predictable deploys.
- **The green contribution squares and PR history** are visible proof of how you work. Recruiters read PRs.
- **The capstone is a team project** — the PR workflow is the gradeable record of who did what.

---

# Lab — Repo → Branch → Conflict → PR → Merge

**Time:** 40–50 minutes. **Deliverable:** a fresh GitHub repo with a 3+ commit history, a merge conflict you
created and resolved at least twice, and one merged pull request.

Create the repo **outside this course folder** (on your Desktop, `git-practice`) — this repo should be your
own clean practice space, not a repo-in-a-repo.

## Lab 1 — Local repo and the daily loop (10 min)

1. `mkdir git-practice && cd git-practice && git init` — confirm `.git/` exists (`ls -a` or PowerShell
   `Get-ChildItem -Force`).
2. Create `index.html` (small page: `<h1>`, `<p>`, one `<button>`) and `README.md` with title + description.
3. Run through the loop verbosely — **after every command, read what git printed**:
   `git status` → `git add .` → `git status` → `git diff --staged` → `git commit -m "Initial page and README"`
   → `git log --oneline`.
4. Prove your identity landed: `git log` shows **your** name and email from Part 2.1.

## Lab 2 — `.gitignore` and history forensics (10 min)

1. Create an empty `notes.local.txt`, `debug.log` and a `.gitignore` with `*.local.txt` and `*.log`.
2. `git status` → the two junk files must NOT appear (they're ignored). Commit the `.gitignore` itself.
3. Prove which rule matched: `git check-ignore -v debug.log`.
4. `git log --oneline --graph --all` — that output, on your history, at any time.

## Lab 3 — Branch and merge (fast-forward, then three-way) (10 min)

1. `git switch -c feature/color` → edit `index.html` (style the heading) → commit.
2. `git switch main` → confirm your color work is NOT on main's file (branches isolate!).
3. `git merge feature/color` → read the output: **fast-forward**. (Preview it with
   `git log --oneline --graph --all` after each step.)
4. Now force a three-way: `git feature/heading` from main, change the `<h1>` text, commit.
   From `main` (changed there too in a different spot, e.g. the `<p>`), commit. `git merge feature/heading`
   → merge commit. Verify the diamond in the graph.

## Lab 4 — Cause and resolve a real conflict (10 min, do this twice by hand)

1. `git switch -c feature/hero` → change the `<h1>` to *"HERO version"* → commit.
2. `git switch main` → change the **same `<h1>` line** to *"MAIN version"* → commit.
3. `git merge feature/hero` → **conflict**. Read the message; it names the file.
4. Open the file — see `<<<<<<< HEAD` … `=======` … `>>>>>>> feature/hero`.
5. Edit the line to what it should actually say (blend both, keep one, or replace — your call) →
   `git add index.html` → `git commit` → save the pre-filled message.
6. Check for **stray markers**: `git grep "<<<<<<<"` must return nothing. Ever commit `<h1><<<<<< HEAD`…
   by accident? `Common Mistakes` table below, first row for you.

## Lab 5 — Push, PR, review, merge (10–15 min)

1. Create **`git-practice`** on GitHub (empty, no README — Part 7.1) →
   `git remote add origin <url>` → `git push -u origin main`. Refresh GitHub: your three colors and all
   commits are visible → **Commits** tab, browse it.
2. `git switch -c feature/footer` → add a footer → commit → `git push -u origin feature/footer`.
3. Open a PR: main ← feature/footer. Write a real description: what + why + how to test.
4. Review your own PR on the Files tab (find one thing to improve — fix it, push, watch the PR update).
5. Merge (merge commit or squash — note which you chose and see how history differs via the graph), delete
   the branch on GitHub, then locally:
   ```bash
   git switch main && git pull && git branch -d feature/footer
   ```

## Lab 6 — Stretch: fork a classmate (10 min)

Swap repo URLs with a neighbor. Fork theirs → clone your fork → add `upstream` (Part 8.4) →
`fix/typo` branch → fix a real typo in their README → push → open a PR **to their repo** → they review and
merge. Then each of you opens one **issue** on the other's repo (`fixes #n` next week).

## Self-review before you move on

- [ ] `git status` before and after every write command became a reflex?
- [ ] `diff --staged` before every commit?
- [ ] `.gitignore` in every repo; `.env` and `node_modules` would never get staged?
- [ ] I made a conflict, read the markers, resolved the file, and committed — twice?
- [ ] One PR open→review→merge→delete→pull cycle completed without help?
- [ ] `git log --oneline --graph --all` makes sense to me when I look at today's repo?
- [ ] GitHub repo has a real README and a description?

## Push it

The lab repo *is* on GitHub already (Lab 5). If any part finished late:

```bash
git add .
git commit -m "Day 5: repo, branches, conflicts, and a merged pull request"
git push
```

---

# Homework

**1. Trace your own history (20 min).**
In `git-practice`: `git log --oneline --graph --all` and, on paper, draw the same graph by hand with arrows
to parents. Mark where HEAD is. Mark which merge was fast-forward and which created a merge commit. If you
can draw it, you own it.

**2. Undo drills (25 min).**
In a throwaway repo `sandbox`: create 3 commits, then — `commit --amend` a message; `restore --staged` a
staged change; `reset --soft HEAD~1` then re-commit; `revert` the middle commit. Then `git reflog` and
restore back to every earlier state one at a time. Write down, per tool: *does the old commit survive?*

**3. Course repo hygiene (20 min).**
This course folder (`niet-industrial-attachment-2026`) is its own repo. Check `git status` — is `class5`'
readme committed and pushed? If there's no `.gitignore`, add one (`node_modules/`, `.env`, `dist/`,
`.DS_Store`). Remove anything accidentally tracked: `git rm --cached`. One commit: "Day 5: course repo
hygiene." Push.

**4. Real fork + PR (30 min).**
Fork any open repo where you can genuinely improve something small: a README typo, missing doc sentence,
broken link (search: [up-for-grabs](https://up-for-grabs.net/), or your favorite tool's repo). Fork →
branch → fix → push → PR with a polite description. Getting even one merged into a real project this week
is the single best résumé line in this course.

**5. Reading (30 min).**
[Pro Git, ch. 1–3](https://git-scm.com/book/en/v2) (the canonical book — read what lectures skip),
[GitHub Hello World quickstart](https://docs.github.com/en/get-started/quickstart/hello-world),
[Resolving a merge conflict](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-on-github).
Then train muscle memory at [Learn Git Branching](https://learngitbranching.js.org/) (Main, levels 1–5).
When (not if) you break something: [Oh Shit, Git!?!](https://ohshitgit.com/).

---

# Checkpoint Quiz

Answer before Day 6. If any takes more than a minute, revisit that Part.

1. What are the three local areas, in the order content moves through them?
2. What does a commit actually contain, and where does its id come from?
3. Why is a commit effectively permanent — and what happens when it changes?
4. What's the difference between `git add` and `git commit`?
5. `git diff` vs `git diff --staged` — what do they compare?
6. Why stage with `add -p` instead of `add .`?
7. Two rules for a good commit message, and why imperative mood?
8. `git status` says "nothing to commit" but GitHub is behind. What did you forget?
9. Why never commit `node_modules/`? Why never `.env` — and what must you do if you did?
10. `.gitignore` has `*.log` but a `debug.log` committed last week still shows changes. Why?
11. `git rm --cached file` — what exactly does it do, what does it NOT do?
12. `amend`, `reset -soft`, `revert`: which is safe to use on pushed, shared commits?
13. `git reflog` — what is it for?
14. What is a branch in Git — physically, how big is the "copy"?
15. What does HEAD point to?
16. `checkout` vs `switch` vs `restore` — which changed split from which?
17. Fast-forward vs three-way merge — condition that decides, and which creates a merge commit?
18. When exactly does Git raise a merge conflict — and what are the three markers?
19. Walk through resolving a conflict — the four commands/steps.
20. `git merge --abort` vs finishing: after `git add` the conflicted file, does the merge end?
21. What is a remote, and why is "origin" not special?
22. What does `-u` in `git push -u origin main` set up?
23. `fetch` vs `pull` — what does each change, exactly?
24. Push rejected, "fetch first." Diagnose and the safe three-step fix?
25. `origin` vs `upstream` — which do you push to, which do you pull updates from?
26. Uninitialized vs auto-init GitHub repo — which produces the "unrelated histories" problem and the flag
    that resolves it?
27. What belongs in a README's five basic sections?
28. PR, squash, and rebase-and-merge: how does each reshape history? Whose 17 "fix typo" commits might
    you squash?
29. In the fork workflow, what do the FOUR names mean: upstream, origin, your machine, PR?
30. Why do Vercel/Netlify builds track your Git history so closely from Day 14?

<details>
<summary>Answers</summary>

1. Working directory → staging area → local repository (then push → remote).
2. A snapshot of staged content + parent-commit pointer(s) + author/email/date + message. The SHA id is a cryptographic hash of all that content.
3. It encapsulates exact content; any byte change changes the hash and produces a different commit, so history can't silently drift. Rewrites create NEW commits on a NEW chain.
4. `add` stages content into the next commit; `commit` snapshots everything staged with a message.
5. `git diff`: working directory vs staging. `--staged`: staging vs last commit (what the next commit contains).
6. `add .` stages everything blindly; `add -p` approves hunks individually — a self-review before the commit exists.
7. Imperative mood and explain the why. Fits "this commit will __"; diff already shows the what.
8. You never pushed. A local commit does not travel by itself — `git push`.
9. `node_modules` is rebuildable from `package.json` — thousands of avoidable files; `.env` is a secret: committing publishes it permanently (history keeps it even after deleting), so you must rotate every leaked key first, then remove from history.
10. `.gitignore` only affects untracked files; a file already committed keeps being tracked until `git rm --cached`.
11. Removes the file from the index (stops tracking) but keeps it on disk. Deletes nothing.
12. Only `revert` — it adds an inverse commit and leaves history intact. `amend` and `reset` rewrite history.
13. A log of every position HEAD has been — the recovery map back to "lost" commits after resets.
14. A 41-byte file containing one commit hash. No files are copied at branch creation.
15. Your current position — usually a branch name, which points at that branch's newest commit.
16. `checkout` did switch + restore (and detached HEAD); `switch` = HEAD movement, `restore` = file restoration.
17. Has main moved since the branch started? No → fast-forward (just moves a pointer). Yes → three-way + a merge commit with two parents.
18. Both branches changed the same lines of the same file since they split. Markers: `<<<<<<< HEAD`, `=======`, `>>>>>>> branch`.
19. `git status` (see conflicted files) → edit to the intended content → `git add <file>` → `git commit` (message pre-filled).
20. Yes — `add` marks resolution; `git commit` (or `git merge --continue`) completes the merge. `--abort` instead returns, unresolved.
21. Any other copy of the same repository history, reachable by URL. `origin` is just the conventional name Git assigns.
22. Tracking: local branch ↔ remote branch association, so later `push`/`pull` know their counterparts.
23. `fetch`: downloads new refs/commits; your working tree and branch are untouched until you merge/compare. `pull`: fetch + merge now.
24. The remote has commits you don't. Diagnose with `git log`. Fix: `git pull` (fetch + merge), resolve any conflict, `git push`. Never history-rewrite just because push failed.
25. Push to `origin` (your copy); pull updates from `upstream` (the original you don't control) to keep synced.
26. Auto-initialized (GitHub's own initial commit vs your local history, no common ancestor). Resolve with `git pull origin main --allow-unrelated-histories` — or avoid: create the GitHub repo uninitialized.
27. Title + one-sentence description; tech stack; getting-started (clone + run); features; author/links.
28. Merge commit preserves branch structure; squash collapses the branch's commits into one on main; rebase-and-merge replays commits linearly without a merge commit. Squash the 17.
29. `upstream` = original repo (read-only for you; merge source). `origin` = your fork (you push here). Your machine = local clone. PR = request merging a branch of your fork into upstream.
30. Vercel/Netlify build from the repo's main branch on every push and pre-build PR previews — broken or forced pushes in history show up as broken deploys.

</details>

---

# Common Mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `<<<<<<< HEAD` visible on the live site | Conflict markers committed as content | Delete all three marker lines; `git grep "<<<<<<<"` before committing merges |
| "nothing to commit" but GitHub is behind | Wrote files, forgot `add`; or `commit` without `push` | `status` → `add` → `commit` → `push`, reading output |
| `permission denied` / auth prompt on push | Identity not configured, no credential manager or token login | `git config user.name/email`; sign in via browser when prompted |
| Push rejected: `fetch first` | Remote has commits you don't have | `git pull`, resolve, `git push` — nothing fancier |
| `.env` or `node_modules/` committed | No `.gitignore`, or `add .` habit | `git rm --cached`, fix `.gitignore`, rotate any secret; prevention: add `.gitignore` FIRST |
| "I deleted the file but GitHub still has it" | Git keeps history forever (correctly) | `git filter-repo`/BFG, or accept history; **rotate secrets first** |
| `WARNING: LF will be replaced by CRLF` | Windows line-ending conversion | Harmless warning; leave autocrlf at default |
| Merge conflict panic mid-`pull` | Didn't read the `CONFLICT (…)` message | Resolve → `add` → `commit`; or `git merge --abort` and come back after lunch |
| Modified a pushed commit via `amend`/`reset` | Rewrote chronology Git already published | `git pull`, resolve, push the truth forward; amend only unpushed commits |
| `git status` "Changes to be committed" but wrong files staged | Forgot `status` before `commit`; `add .` fired blindly | Make `status` part of the loop; `restore --staged` the strays |
| `detached HEAD` | Checked out a commit hash for a look-around | `git switch -c branch-name` (keep work) or `git switch main` (abandon) |
| `error: failed to push some refs` after rebase/amend on PR branch | History diverged from remote | Only if YOU own it: `push --force-with-lease`; team branch: revert instead |
| Merge commit appeared when I wanted a straight line | Three-way merge is CORRECT, no bug | `--no-ff` deliberately, or rebase (later in course) |

---

# Cheat Sheet

```bash
# ── Setup (once per machine) ─────────────────────────────────────────────
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main

# ── Start / sync shape ───────────────────────────────────────────────────
git init                              # new repo here (.git/ is the repo)
git clone <url>                       # download a full remote copy, wires origin

# ── The daily loop ───────────────────────────────────────────────────────
git status                            # WHERE AM I, WHAT CHANGED — run it constantly
git add <file>  |  git add .  |  git add -p     # stage (deliberately)
git diff  |  git diff --staged        # inspect before committing
git commit -m "Add nav bar"           # snapshot = message
git log --oneline --graph --all       # history as a picture
git push                              # publish (first time: push -u origin main)
git pull                              # update from the remote (fetch + merge)

# ── Inspecting history ───────────────────────────────────────────────────
git log           |  git log -p <file>          |  git log --author="You"
git diff <shaA> <shaB>  |  git diff main feature
git show <sha>                         # one commit, full detail

# ── .gitignore lifecycle ─────────────────────────────────────────────────
*.log, *.local.txt, dist/, node_modules/, .env      # patterns
git rm --cached <file>                              # stop tracking, keep on disk
git check-ignore -v <file>                          # which rule matches

# ── Undo ─────────────────────────────────────────────────────────────────
git restore <file>                    # discard file changes (destructive)
git restore --staged <file>           # unstage, keep changes
git commit --amend [-m "..."]         # fix the LAST commit (unpushed only)
git reset --soft HEAD~1               # uncommit → changes back to staging
git reset --hard HEAD~1               # uncommit and burn the changes (destructive)
git revert <sha>                      # inverse commit — safe on pushed history
git reflog                            # time machine list; reset --hard <sha> to return

# ── Branches & merges ────────────────────────────────────────────────────
git branch                            # list; * = current
git switch -c feature/x               # create + move
git switch main                       # move
git merge feature/x                   # fast-forward or three-way; conflicts stop here
git merge --abort                     # bail out mid-conflict
git branch -d feature/x               # delete pointer after merge (-D = force)

# ── Remotes ──────────────────────────────────────────────────────────────
git remote add origin <url>           # connect local → remote
git remote -v                         # list remotes
git push -u origin main               # first push per branch, sets tracking
git fetch origin                      # download; local branches untouched
git pull                              # fetch + merge

# ── Fork workflow ────────────────────────────────────────────────────────
Fork on GitHub → clone YOUR fork (that's origin)
git remote add upstream <original-url>
git fetch upstream  &&  git merge upstream/main   # keep fork current
git push -u origin <branch> → PR upstream ← your fork
```

---

# Reference

- [Pro Git](https://git-scm.com/book/en/v2) — the book; chapters 1–3 are this lecture
- [git-scm docs](https://git-scm.com/docs) — every command, by the makers
- [GitHub Hello World quickstart](https://docs.github.com/en/get-started/quickstart/hello-world) — 10-minute repo/branch/PR loop
- [GitHub Docs: pull requests](https://docs.github.com/en/pull-requests) — reviews, conflict resolution
- [github/gitignore](https://github.com/github/gitignore) — starter ignore files for every language
- [Learn Git Branching](https://learngitbranching.js.org/) — interactive, in-browser drills
- [Oh Shit, Git!?!](https://ohshitgit.com/) — recovery recipes for realistic disasters
- [Atlassian Git tutorials](https://www.atlassian.com/git/tutorials) — clear, diagram-heavy reference

---

# Tomorrow — Day 6: Tailwind CSS + Mini Static Project

Today your history went public. Tomorrow the styling gets an upgrade — and the project gets pushed.

- Utility-first CSS vs traditional CSS — what "no stylesheet of your own" buys you
- Setting up Tailwind with Vite; `tailwind.config.js` basics
- Core utilities: spacing, sizing, typography, color, flex/grid
- Responsive prefixes (`sm:` `md:` `lg:`), state variants (`hover:` `focus:` `dark:`)
- Reusable patterns with `@apply` (optional)
- **Project:** rebuild Day 1's profile card in Tailwind, extend it into a landing page
  (nav + hero + cards + dark-mode toggle) — **committed and pushed to GitHub with a README**

> **Why today's work belongs in git:** Day 6 ends with your first *real* deployed repo. Same loop you
> practiced today: branch, build, commit small and often, push, README. From here on, "done" means
> "merged and pushed." Tailwind's utility soup only stops looking random when it has a clean history of
> deliberate stages beside it.

**Bring:** today's `git-practice` repo with its merged PR visible on GitHub, and `git log --oneline
--graph --all` output you can explain line by line — Day 6's project lands in that same history.
