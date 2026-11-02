# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## #4471, split (added 2026-11-02)

- Page: `src/routes/kb/incidents/4471-split/+page.svx` (signed, desk ref DR-FXGR-BNJA).
- Logic: `src/lib/kb/split.ts`, `src/lib/kb/SplitTable.svelte` (counts computed from `src/lib/data`).
- The page as the desk will see it: `rendered/kb/incidents/4471-split/index.html` (static build of the whole kb in `rendered/`).
- Rebuild: `npm install && npm run build` (SvelteKit + mdsvex + adapter-static, alias `#lib` → `src/lib`), output in `build/`.
- Tickets: #1 parser (379, as the desk counts: by tenant cause; includes the 5 read as a one-day move), #2 hint (33), #3 one-day move (5, filed by the desk under parser).
