---
name: remove-the-human
description: Turn what a person had to do by hand into something the system does by itself. After a stretch of work or a retro, finds each place a human was needed, offers the strongest fix for each, and builds the ones the user picks, one at a time. Use for /remove-the-human, after a retro, or when asked what we learned or what to automate.
---

# Remove the human

After a piece of work, look at everything a person had to do by hand: correct the agent, answer a question it should not have needed to ask, grant a permission again, repeat a rule, catch a mistake in review, retype the same steps. Each is a place the agent could not be trusted to get it right alone. Find the strongest thing that makes it unnecessary next time, so the person's attention goes only to what truly needs judgement.

1. **Gather.** Take the retro's findings when one was run; otherwise read this conversation. Read the [trail](../trail/SKILL.md) log; `guardrails.py friction` ranks its tags. Friction or a decision the conversation holds and the log lacks: log it first.
2. **List** each place a human was needed, in one line: what they had to do, what it cost. Merge repeats. A repeat outranks a one-off.
3. **Sort** each onto the strongest rung that holds it:
   - **Environment**: the setup made the wrong way easy or the right way impossible: access the agent lacked, information it could not reach, a slow or missing tool, a file it could not find.
   - **Guardrail**: a type, lint, test or hook would have stopped it.
   - **Skill**: a job done by hand more than once.
   - **Communication**: how we ask, report or name things. One line in AGENTS.md, for judgement only.
   A place where the human was truly needed is dropped.
4. **Offer.** A numbered list, worst first. Each line: what the human did, its rung, the fix, its size, and who can make it: the agent alone, or the user (a publish, an access grant, a purchase).
5. **Wait.** The user picks numbers, changes one, or drops one. Take the feedback into the list and show it again.
6. **Build** the picked ones one at a time with [pave](../pave/SKILL.md). After each, walk the wrong path once and show it fail, then ask for the next. What is not picked becomes an issue.
7. **Report** what changed and what is left.
