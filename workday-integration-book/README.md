# Workday Integration Book

A plain-English, searchable, offline-friendly book for Workday integration work. It covers office and IT acronyms, email words, integration basics, data formats, Workday HR, reports, tools, payroll, security and delivery. It has step-by-step animations, playbooks, phrase decoders, email templates, labs, a job map and a quiz.

## Use it
- Online: open the GitHub Pages link of this repo.
- Offline: download `dist/workday-integration-book.html` and double-click it. One file, no install.
- Search: click the box at the top, or press `/`.

## Facts and limits
Facts about Workday were checked against three Workday product-summary PDFs (Integrations, Human Capital Management, Manage Workday). Things not in those PDFs (Singapore payroll rules, tenant definitions, Studio internals) are marked as company-dependent. Verify details in your own tenant. All names and data in the book are dummy.

## Host on GitHub Pages
Settings > Pages > Deploy from a branch > `main` / root. The `.nojekyll` file is included.

## Add content
Edit the files in `content/` and call the helpers from `assets/book.js`:
- `BOOK.E(part, term, meaning, example, forMe, level 1-3, kind g|w|c, tags, aka)` adds a term. Chain `.D([...bullets])` for details.
- `BOOK.A({id, title, sum, part, tags, nodes, edges, steps})` adds an animation.
- `BOOK.PB`, `BOOK.PH`, `BOOK.TP`, `BOOK.CK`, `BOOK.JD`, `BOOK.Q` add playbooks, phrases, templates, checklists, job-map lines and quiz questions.

Then run `python3 build.py` to rebuild `dist/`.
