# 13. FormDialog is centred without a transform

## Context

The ported dialog centres itself with `left: 50%`, `top: 50%` and a translate of minus half its size. An element with a translate becomes the containing block for `position: fixed` parts inside it. The editor's selection toolbar places itself with `position: fixed` and coordinates measured from the window, so inside such a dialog it appeared far from the selected words.

## Decision

`FormDialog` in `src/suite/work.tsx` overrides the centring: `inset: 0`, `margin: auto`, `height: fit-content` and `translate: none`. It also turns off the dialog's open and close motion, which animates a transform. The ported dialog in `src/ui/dialog.tsx` is not changed.

## Consequences

A dialog built on `FormDialog` may hold the editor. A dialog an app builds straight from the ported `DialogContent` and puts an editor in needs the same four classes and `motion="instant"`. Adding a translate, transform or filter to `FormDialog`'s content brings the fault back.
