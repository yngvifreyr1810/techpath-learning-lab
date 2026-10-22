# TechPath host integration

## Direct tutor (v0.3, primary web flow)

The standalone Site now opens a persistent tutor side panel. A review click snapshots the actual task, code, output/error, notes and question using `packet()`, then sends them once to the local connector. Follow-up questions stay in the same lesson conversation and include the latest draft when still viewing that lesson. Empty input is rejected; no typing or page-load event starts inference. Plain text rendering prevents code/HTML from executing in replies. Stop aborts the HTTP stream and requests `turn/interrupt`; errors never auto-replay inference.

Run `Start-TechPath.cmd` on each Windows device. Node serves the app and `/api/tutor/*` only on 127.0.0.1:4173, launches `codex app-server --stdio` on demand, and requires `account/read` to report a ChatGPT account before any generation. The selected model is explicitly `gpt-6.1-sol`, effort `low`, provider `openai`; there is no automatic model/provider fallback. TechPath does not extract or transmit authentication tokens. API key environment variables are removed from the child environment and API-key-only accounts are rejected. This uses existing plan limits; it is not unlimited free inference.

The hosted Site may connect to that local endpoint only after browser local-network policy allows it. Exact allowed Origin and Host checks, a fresh random per-process request token, JSON-only POSTs and bounded body size prevent arbitrary websites from invoking it. The token is held only in browser/process memory. No wildcard CORS or public listener is used. If the browser prevents hosted-to-loopback fetch, use the local UI and transfer progress through JSON. The plugin sandbox's restrictive CSP may also prevent direct local connections; the standalone Site/local UI is the primary path.

There is a separate persistent Codex conversation per browser identity and lesson. Server IDs are mapped in ignored `.techpath-local/sessions.json`; clients cannot select arbitrary Codex thread IDs. This never resumes or modifies the chat used to build the app. A learner-approved profile and tutoring instructions provide personalization; that is not a copy of the whole original conversation. Thread history remains in Codex on that device. Visible tutor history is included in JSON backup and restored by import, but moving it to another device does not transfer the underlying Codex thread.

Tutor prompts prohibit tools and the thread uses read-only sandbox restrictions; server-initiated approval/tool requests are rejected. This is not a SQL executor. Never report a query as actually run. The connector does not directly read SSMS.

Verification: v0.3 does not run automated tests or a sample paid/plan-consuming review. Validate the live model response by using the review button after connection; deployment success only establishes publication, not successful model inference.

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
