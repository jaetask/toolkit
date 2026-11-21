---
name: delete-comment
description: Delete code comments, since code is law. A fresh subagent hunts them; each excuse becomes a fix or an issue, each constraint a type, test or lint, each decision an ADR, and a ratchet keeps comments out. Use for /delete-comment, or to remove, review or ban code comments.
---

# Delete comment

Code is law. A comment is a claim no compiler checks.

`check-comments.mjs` sits beside this file; run it with `node` from the repo root. Directives a tool reads and licence notices are never comments to it.

1. **Scope.** The files or diff the caller names; otherwise the diff against `main`, working tree included; the whole repo when asked.
2. **Hunt.** Spawn a fresh subagent with [comment-sicko.md](comment-sicko.md) as its instructions and the scope. `--list [paths]` gives it every comment: file, line, text. It sorts and flags; it writes no application code.
3. **Judge** its report against the code, not its word. Reject a flag that misstates the code or leaves the scope.
4. **Act** on each sort:
   - **Tautology, stale**: nothing to rescue.
   - **Excuse**: fix it when the fix is small and in scope: delete the dead path, drop the parameter, use the real API. Otherwise file an issue in the repo's tracker: what the code does, why it is a hack, the proper fix.
   - **Must kill**: a surprise in our own code. Rename, extract or type until the code says it. No guard bolted on a symptom.
   - **Constraint** (`do not remove`, an order, a limit): offer the cheapest type, test or lint that enforces it. On a yes, encode it. With no yes, or nobody to ask, it goes in an ADR.
   - **Decision record**: a why no code can carry. Move it into `docs/adr/NNNN-title.md` (Context, Decision, Consequences), one ADR per decision; many comments share one.
5. **Delete**, once every excuse, constraint and decision has landed somewhere. `--strip [paths]` removes every comment in scope. Run the formatter and the repo's checks.
6. **Ratchet.** Copy `check-comments.mjs` to `.agents/guardrails/`, run it there with `--update --init` to write `comments.json`, and add `node .agents/guardrails/check-comments.mjs` to the lint command. A file may hold no more comments than its count there, and a new file none. `--update` lowers the counts. Code the repo does not own goes in `skip`.
7. **Report** the count per sort, fixes, issues, encodings offered and made, ADRs, and `--estimate`: the lines still to shed.
