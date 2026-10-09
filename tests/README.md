# Verification

Run `npm run build && npm test`.

Tests cover built route semantics, post ordering, dates, avatar fallbacks, shared typography, minimal home layout, archive history, Mermaid source completeness, SVG isolation and media geometry.

Browser verification covers responsive layout, search, theme persistence, archive filters and history, RSS copying, code copying, table-of-contents anchors and the full-screen media viewer. Build-dependent tests require a current `dist` directory.
