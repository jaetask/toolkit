# 1. Ported parts stay interchangeable with the agent-native toolkit, and a test checks it

## Context

The ui parts, icons, hooks, design-system, provider and utils are ported from the agent-native toolkit. An app should be able to swap one toolkit for the other. A ported part could drift: lose an export, move, or swap its Radix base for a browser control.

## Decision

Every part recorded from the agent-native toolkit is kept at the same path, with the same exported names, on the same Radix packages. The record is `src/agent-native-parts.json`, read from that toolkit's `src/` on 2026-11-20. `src/interchangeable.test.ts` checks each recorded part: the file exists, it still exports every recorded name, it still imports every recorded Radix package, and it renders no browser `<select>`. A part that opens a menu, traps focus or takes arrow keys keeps its Radix base, so it can never fall back to a browser control. `src/index.ts` exports the parts as the agent-native toolkit's own entry does.

## Consequences

Renaming or removing an export of a ported part fails the test. Replacing a Radix import in a ported part fails the test. When the agent-native toolkit changes, `src/agent-native-parts.json` must be read again from it; the date above says how old the record is. Only theme values differ from the source.
