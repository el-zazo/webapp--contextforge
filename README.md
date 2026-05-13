# ContextForge

**Prepare project files as formatted messages for AI chat tools.**

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## What is ContextForge?

ContextForge is a developer utility that helps you prepare file contents as formatted, copy-ready messages to paste into AI chat tools (ChatGPT, Claude, Gemini, etc.). Import a local project folder, select the files you want, optionally configure length splitting, and export the results as individual messages or a ZIP archive.

No more manually copying and pasting dozens of files. No more hitting character limits mid-message.

---

## Features

- **Folder import** — Import a project folder via file picker or drag & drop
- **Interactive file tree** — Browse, search, filter by extension, and sort your project files
- **File selection** — Add files to a selection list, track total character count in real time
- **Excluded Patterns** — Filter out noise files (`node_modules/`, `.git/`, `*.log`, etc.) with a powerful pattern system supporting both name-only and path-based matching
- **Case-sensitive matching toggle** — Control whether `README.md` and `readme.md` are treated as the same file
- **Message splitting** — Split output into multiple messages with a configurable max character length; large files are split on line boundaries, never mid-line
- **Prompt prefix & suffix** — Add a context prompt before and/or a question after your file contents
- **Export options** — Copy individual messages, download as `.txt` / `.md`, or export all as a ZIP archive
- **Persistent config** — All settings auto-saved to `localStorage` across browser sessions

---

## Pattern System

ContextForge supports two categories of exclusion patterns:

### Name-only patterns

Matched against the file or folder **name** only. No slashes (except an optional trailing `/` for folders).

| Pattern | What it matches |
|---|---|
| `node_modules/` | Any folder named `node_modules` |
| `*.log` | Any file ending in `.log` |
| `.env*` | Any file starting with `.env` |

### Path-based patterns

Matched against the file's **full relative path** from the project root. Uses glob-style wildcards.

| Pattern | What it matches |
|---|---|
| `src/auth/**` | All files recursively under `src/auth/` |
| `src/**/*.test.js` | Any `.test.js` file anywhere under `src/` |
| `**/docs/README.md` | `README.md` inside any `docs` folder |
| `src/*/routes.js` | `routes.js` one level deep under `src/` |

- `*` matches within a **single** folder level
- `**` matches across **zero or more** folder levels

---

## Getting Started

```bash
git clone https://github.com/el-zazo/webapp--contextforge.git
cd webapp--contextforge
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
```

The output is a single `dist/index.html` file ready for static hosting.

## Tech Stack

- **React 19** — UI components
- **Vite 7** — Build tool and dev server
- **TailwindCSS 4** — Styling (dark premium theme)
- **Zustand** — State management with `localStorage` persistence
- **JSZip** — ZIP archive export
- **Lucide React** — Icons

## License

MIT