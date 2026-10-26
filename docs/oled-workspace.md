# OLED central workspace

`dist/oled.css` is loaded last for the local app and embedded build. Its selectors stay under `.shell`: black (#000) workspace, near-black panels and editor/results, neutral borders, existing gold highlights. Global sidebar and tutor remain outside this scope, with their existing green/gold colors and sizing.

A small, static crescent and stars are drawn with an inline SVG background on the topbar pseudo-element. It has no pointer events, makes no network request, and is hidden on narrow screens. No layout, lesson, storage or inference behavior changes.

## Sidebar disclosure

The three-line button before the breadcrumb opens/closes the existing navigation. `sidebar.js` stores only the layout preference in `techpath.sidebar.v1`, separately from learning backups. Desktop defaults to visible; narrow screens default to closed. Closing removes the left workspace margin without rerendering the lesson or changing tutor styles. Mobile uses an overlay with a backdrop; Escape closes it and returns focus to the button. `aria-expanded`, `aria-controls` and inert state track visibility. Preferences survive routes and reloads.

`node .techpath-local/sidebar-check.cjs` with bundled Playwright: exit 0 (toggle/ARIA, full width, route/reload persistence, editor draft, keyboard/Escape, mobile/backdrop and overflow). `node checks-python-ui.mjs`, `node build.mjs`, `node checks-mcp.mjs`, `git diff --check`: exit 0 after the sidebar change. Build now includes 24 assets; 41 lessons remain. No SQL or AI call.

Verified locally on 2026-10-26:

- `node .techpath-local/oled-check.cjs` (bundled Playwright via NODE_PATH): exit 0. Compares sidebar/tutor colors, backgrounds, border, font, padding and width against pre-edit computed styles; all unchanged. Checks black central background, near-black cards, ornament hit-testing, Python theory/practice, SQL, overview, library, settings and mobile width. Zero inference requests. Screenshots under `.techpath-local/oled-qa/`.
- `node checks-python-ui.mjs` (same Playwright runtime): exit 0. Existing six-lesson UI, keyboard, progress and backup checks pass.
- `node build.mjs`: exit 0, 23 assets/41 lessons.
- `node checks-mcp.mjs`: exit 0.
- `git diff --check`: exit 0.

No SQL execution, AI inference, commit, push, deployment or dependency installation. Preview remains on port 4189. Sidebar/tutor source and the pre-existing provider edits were not changed.
