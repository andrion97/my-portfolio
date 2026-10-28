# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# My Portfolio

## What this is
A personal portfolio website. Built with plain HTML, CSS, and vanilla JavaScript only. No frameworks, no React, no Tailwind, no build tools.

## Commands
No build, lint or test suite. Verify changes with:
- `open index.html` — run the site (or `python3 -m http.server` if a fetch-based feature needs http://)
- `.claude/skills/portfolio-polish/scripts/check_links.sh .` — every local href/src resolves, every `#anchor` has a matching id, external `target="_blank"` links have `rel="noopener"`
- `.claude/skills/portfolio-polish/scripts/screenshot.sh . <out_dir> [page.html ...]` — headless-Chrome PNGs of each page at desktop (1280) + phone (375), light + dark. Put `<out_dir>` in the scratchpad, not the repo

## How the pages fit together
- Each page duplicates the `<head>` and `<header class="nav">` markup; there are no includes. Change nav, fonts or meta in **both** index.html and work.html. work.html links back with `index.html#section`, not a bare `#section`
- Theme runs in three places: a small inline `<script>` in each page's `<head>` applies the saved `localStorage.theme` as `data-theme` before paint (prevents a flash); styles.css defines the dark tokens **twice**, once under `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` and once under `:root[data-theme="dark"]`, so any colour change must go in both blocks; script.js only flips `data-theme` and saves it
- script.js doesn't null-check `#theme-toggle`, `#menu-toggle` or `#nav-links`. Any new page must include the full nav header, or the script throws and scroll reveal never runs (all `.reveal` content stays hidden)

## Design guidelines
- Theme "Lab → Product Lab": graph-paper background, ink navy (#0a1120) dominant with acid lime (#c6f432) accent, periodic-table element tiles as section labels, Bricolage Grotesque + JetBrains Mono. Light mode = lab paper with lime as highlighter. Backup of the previous design: .backups/2026-10-27-pre-lab/ (git-ignored, local only)
- Clean, minimal, modern aesthetic
- Professional but warm and personal
- Generous whitespace — nothing should feel cramped
- Fully responsive — must look great on both mobile and desktop
- Cohesive color palette — no random colors (all colours are tokens on `:root` in styles.css, redefined for dark mode)
- Sans-serif typography
- Subtle animations and transitions to add polish

## Design system (styles.css)
- Light + dark themes: follows the system, overridable by the toggle (saved in localStorage as `theme`)
- Section label: `.section-head` with a `.tile` (number + 2-letter symbol) beside the `<h2>`
- Reusable pieces: `.btn` / `.btn-outline` (hard offset shadow), `.card` (element-tile cards), `.timeline` (journey steps), `.degree` + `.cert` (education), `.chips`, `.accent` (lime highlighter swipe)
- Scroll reveal: add class `reveal`; script.js adds `visible` on intersect. Respects prefers-reduced-motion
- Breakpoints: 1000px (tightens the 6-link nav), 768px (hamburger menu, single column), 480px (stacked full-width buttons)

## Page sections (index.html) — tile numbers must stay sequential
00 nav logo · 01 Pm hero · 02 Ab about · 03 Jr journey · 04 Ed education & certifications · 05 In what I'm into (cards 06–09) · 10 Ct contact.
Adding a section means renumbering the tiles after it and adding a nav link in both index.html and work.html.

## Tech constraints
- Plain HTML + CSS + vanilla JavaScript ONLY
- No frameworks, no libraries (except Supabase JS client which will be added later)
- No npm, no build steps, no bundlers
- The site must work by simply opening index.html in a browser

## Supabase
- No `.env` for the site — browsers can't read it without a build step. Project URL + publishable key live in `config.js` (committed, loaded before script.js on every page)
- No supabase-js: script.js calls the REST API with `fetch`, sending the publishable key as the `apikey` header only (it isn't a JWT, so no `Authorization: Bearer`)
- Schema lives in `supabase/*.sql`, applied with the Supabase MCP server (`.mcp.json`) via `apply_migration`; keep the file and the migration in sync. Project ref `obgszuddwuykojsqrqym` (named my-portfolio). Run `get_advisors` (security) after any DDL
- Subscribe popup (`<dialog id="subscribe-dialog">`, opened by any `[data-subscribe]` button, markup duplicated in both pages) inserts into `subscribers`. Visitors are granted insert on `email` only, no select, so a duplicate shows up as HTTP 409, not a lookup. Emails are NOT synced to Substack — export/import manually
- The anon key is public by design; Row Level Security must be enabled on every table
- Never put the service_role key in any file in this repo

## File structure
- index.html — the main page
- work.html — "See my work" page (concept case studies for now)
- styles.css — all styles in a separate file
- script.js — shared behaviour (footer year, theme toggle, mobile menu, scroll reveal, subscribe popup)
- config.js — public Supabase URL + publishable key
- resume.pdf — linked from the "View Resume" button
- photo.jpg — profile photo
- .claude/ — project commands (add-section, mobile-check) and the portfolio-polish skill

## About me
- Name: Abhishek Alva
- Introduction: Hey, I'm Abhishek! An AI PM in the making — the kind of person who reads product teardowns for fun and gets way too excited about what AI can do for real people. Proud jack of all trades (and still collecting them). When I'm not geeking out over products, I'm yelling at a match, building a playlist for every mood, or hunting for the next thing to jump off, paddle down, or climb up.
- Email: alvaabhishek15@gmail.com (mailto button in contact) · LinkedIn: linkedin.com/in/abhishek-alva
- Education: B.Tech Chemical Engineering, NITK Surathkal (2019)
- Certifications shown: Google Cloud Digital Leader (2024), AI Product Management Cohort (Shravan Tikkoo)
