---
name: delete-comment
description: Delete code comments, since code is law. Each excuse becomes an issue, each decision an ADR, and a ratchet keeps comments out. Use for /delete-comment, or to remove, review or ban code comments.
---

# Delete comment

Code is law. A comment is a claim no compiler checks.

`check-comments.mjs` sits beside this file; run it with `node` from the repo root. Directives a tool reads (lint ignores, type directives, licences, shebangs) are never comments to it.

1. `--list` prints every comment in the repo, or under the paths you name: file, line, text.
2. Sort each one. Open the code when the comment alone does not settle it.
   - **Tautology**: repeats the code.
   - **Stale**: describes code that is gone.
   - **Excuse**: lets a hack stand. File an issue in the repo's tracker: what the code does, why it is a hack, the proper fix.
   - **Decision record**: a non-obvious why. Move it into `docs/adr/NNNN-title.md` (Context, Decision, Consequences), one ADR per decision; many comments share one.
   A name, a type or a test that can carry what the comment said beats an ADR.
3. `--strip [paths]` deletes every comment under the paths. Run the formatter and the repo's checks.
4. Ratchet. Copy `check-comments.mjs` to `.agents/guardrails/`, run it there with `--update --init` to write `comments.json`, and add `node .agents/guardrails/check-comments.mjs` to the lint command. From then on a file may hold no more comments than its count there, and a new file none. `--update` lowers the counts. Code the repo does not own goes in `skip`.
5. Report the count per sort, the issues, the ADRs, and `--estimate`: the lines still to shed.
