# Architecture decision records

Decisions about the code live here, since comments are not kept in the code.

- [1. Ported parts stay interchangeable with the agent-native toolkit, and a test checks it](0001-ported-parts-stay-interchangeable.md)
- [2. The emoji picker and comment reactions are ported from the agent-native Content app](0002-emoji-parts-come-from-the-agent-native-content-app.md)
- [3. No ring or outline is drawn round a focused part](0003-no-focus-rings.md)
- [4. The suite's look is carried as the theme variables the ui parts read](0004-the-look-is-theme-variables.md)
- [5. A colour is chosen from swatches, never from a list of names](0005-colours-are-chosen-from-swatches.md)
- [6. Status is shown in grey, orange or green, never red](0006-status-is-never-red.md)
- [7. Every link goes through one Link component, and edit links carry ?from=](0007-one-link-component-and-from.md)
- [8. Markdown shows only pictures served by the app; others become links](0008-markdown-loads-only-the-apps-own-pictures.md)
- [9. A RowMenu item acts after the menu has closed and given up the focus](0009-row-menu-acts-after-the-menu-closes.md)
- [10. ViewToggle marks the chosen view with a class, not data-state](0010-view-toggle-marks-the-chosen-view-by-class.md)
- [11. PropertyPicker: a fixed anchor, numbers that start at 0 for a none choice, and one full-width line under the search box](0011-property-picker-anchor-numbers-and-search-line.md)
- [12. Stylesheets ship beside the compiled files, and the build checks the install first](0012-styles-ship-beside-compiled-files.md)
