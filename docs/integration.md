# TechPath host integration

## Architecture

Sites private access gate -> Worker `/mcp` -> read-only lesson/profile tools + MCP Apps UI resource. UI runs the same curriculum and local learning flow. A deliberate button click previews and sends a message through the MCP Apps host bridge. The host's current conversation supplies the assistant and selected model; the app never selects a replacement model or creates a paid API request.

The UI resource is self-contained (inline CSS/JS, no external fonts, no nested iframe) with an empty CSP resource/connect allowlist. It handshakes using `ui/initialize`, handles `ui/notifications/tool-result`, and sends `ui/message`. The optional official `window.openai.sendFollowUpMessage` compatibility API is used only when present and the standard bridge has not initialized. An uncertain send is never automatically replayed.

## Data and access

- Sites verifies caller access before forwarding `/mcp`; audience remains private.
- MCP tool `get_techpath_profile` returns only learner-approved course preferences, not private contact details or chat logs.
- `get_techpath_lesson` excludes reference solutions unless explicitly requested with `include_solution=true`.
- Draft code/errors are supplied only on the learner's send click, after a visible preview. No SSMS access is claimed.
- No raw conversation-reading API, authentication token extraction, browser UI automation relay or new chat creation is used.
- The app does not set, query or claim to verify the host's selected model. Keep GPT-6.1 Sol / Light selected in the host UI.
- Browser-local persistence and optional host widget-state are separate from model context. The JSON backup remains the portable source for progress between browser environments.

## Native entrypoint

`open_techpath` metadata declares `_meta.ui.resourceUri` and the thread entrypoint using `openai/ui`. `resources/read` returns `text/html;profile=mcp-app`. Legacy output-template metadata is included for compatible hosts. Tools remain usable when UI rendering is unavailable.

## Verification boundary

`checks-mcp.mjs` verifies RPC contracts, explicit-only sends, no implicit solution disclosure, message-source validation and Worker HTTP routes. A successful build/deployment is not proof that a specific ChatGPT/Codex client loads the UI or sends a live message. Verify that separately after the generated plugin is installed and visible to the current chat. If connection needs user approval, report it rather than claiming end-to-end completion.
