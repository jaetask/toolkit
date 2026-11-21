# 2. The emoji picker and comment reactions are ported from the agent-native Content app

## Context

The suite needed an emoji picker panel and reaction chips for comments. The agent-native Content app has both, but they are app code, not part of its toolkit, so the credit in `LICENSE` and `README.md` for the ported toolkit folders does not name them.

## Decision

`src/suite/emoji.tsx` is ported from the agent-native Content app's `app/components/editor/EmojiPicker.tsx` and `CommentReactions.tsx` (MIT, Copyright (c) 2026 Builder.io, Inc.). The names and props are the same. Two things differ: the app's translations are plain English strings here, and the popover is the toolkit's ported Popover from `src/ui/popover.tsx`.

## Consequences

This file is the record of where that code came from and of its licence; the MIT licence asks that the copyright notice stays with the code. The names and props in `src/suite/emoji.tsx` should not be changed without a reason, so the file can be compared with its source. The strings are English only.
