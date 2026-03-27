# AgentCommerce Frontend (React) — Copilot Instructions

## Quick start (developer workflow)
- `npm install` to install dependencies.
- `npm start` runs dev server (CRA, hot reload).
- `npm test` runs React Testing Library via CRA.
- `npm run build` produces optimized output under `build/`.
- Optional: set `REACT_APP_API_URL` to override default backend in `src/api.js`.

## Big picture architecture
- Single-page CRA app; no router.
- Main user flow lives in `src/App.js` as a six-step onboarding wizard:
  - step state uses `useState` and `useEffect`
  - `Step1`..`Step6` components are in the same file
  - UI primitives: `Btn`, `Field`, `Card`, `Progress`, `MultiSelect`
- Admin dashboard is in `src/AdminDashboard.js` with filters, summary, store details, and patch actions.
- Shared API client in `src/api.js`:
  - `apiGet`, `apiPost`, `apiPatch`
  - base is `process.env.REACT_APP_API_URL || "https://agentcomerce-backend.up.railway.app/api"`.
  - respects JSON-safe parsing and throws on non-2xx.

## Data flows / endpoints (project-specific)
- Onboarding step to validate credentials calls `apiPost('/validate-credentials', payload)`.
- Admin loads dashboard from `apiGet('/admin/dashboard')` and store detail from `apiGet('/admin/stores/:id')`.
- Admin saves changes via `apiPatch('/admin/stores/:id', form)` and logs via `apiPost('/admin/stores/:id/logs', ...)`.
- Credential validate step has developer bypass code with hardcoded secret: `khuzaimashams / khuzaimashams`.
- Backend-unreachable path in Step2 treats network errors as success (client-side format validation is then the guard).

## Style & patterns in this codebase
- Tailwind utility-first classes permuted by `cx` / `cls` helpers.
- Components are mostly function-based with local controlled state and no global store.
- Direct in-file constants for dropdown options (`statusOptions`, `planOptions`, `DELIVERY_OPTIONS`, etc.).
- Visual info message components (like `Instruction`) are used to reduce JSX repetition.

## What agents should do first on changes
1. Identify which UI is touched (onboard vs admin). `src/App.js` is onboarding, `src/AdminDashboard.js` is admin operations.
2. Keep endpoint names exact for backend compatibility.
3. Add new URIs in `src/api.js` and reuse existing helpers.
4. Maintain semantic Tailwind classes and reuse existing button variants (`primary`, `ghost`, `white`).
5. Verify manual in-browser behavior under `npm start` and preserve `deposit` feature style plus validation.

## Debugging + test hints
- Hot reload on `npm start`; network calls viewable in browser devtools to confirm path and payload.
- It is common to trigger admin API via query / filter selection in UI.
- No dedicated unit tests in current repo; add small React Testing Library tests in `src/App.test.js` and extend if needed.

## Project-specific gotchas
- spinner / loading state derived from `validating`, `saving`, `loading` booleans in components.
- Store fields are mostly uncontrolled except for explicit `setForm` mapping in `mapForm` (see `AdminDashboard.js`).
- `src/App.js` validates Shopify vs WooCommerce separately; any platform changes should be in the same step logic.
