# Repository Guidelines

## Project Structure & Module Organization

- Source: TypeScript + React in `src/`. Key subfolders: `components/`, `execution/`, `search/`, `utils/`; hooks follow `use*.ts(x)`. UI stories live alongside code as `*.stories.tsx`.
- Assets & config: `public/` (static), `.storybook/` (Storybook), `docs/`, `nginx/`, `dist/` (build output).
- Tests: Unit tests co-located as `*.test.ts(x)`; E2E specs in `cypress/e2e/`.

## Build, Test, and Development Commands

- `npm start`: Run Vite dev server at `http://localhost:5173`.
- `npm run start-devnet`: Start with local devnet config (`VITE_CONFIG_JSON`).
- `npm run build`: Type-check then build production bundle to `dist/`.
- `npm run preview`: Serve the built app locally.
- `npm test`: Run Jest unit tests.
- `npm run storybook` / `npm run build-storybook`: Run/build component docs.
- `npm run cy:run-mainnet` / `npm run cy:run-devnet`: Run Cypress E2E suites.
- Docker helpers: `docker-build`, `docker-start`, `docker-hub-start`, and matching `*-stop`.

## Coding Style & Naming Conventions

- Language: TypeScript + React 19 (Vite); Tailwind CSS enabled.
- Formatting: Prettier with organize-imports. Run `npx prettier -w .` before pushing.
- Linting: ESLint extends `react-app` defaults.
- Naming: Components in `PascalCase` (`ComponentName.tsx`), hooks prefixed `use*`, utilities in `utils/`, tests `*.test.ts(x)` beside subjects.

## Testing Guidelines

- Unit: Jest via `ts-jest` (`testEnvironment: node`). Keep tests near code; focus on edge cases.
- E2E: Cypress in `cypress/e2e/`. Ensure dev server is reachable; for devnet flows, verify Erigon/Sourcify endpoints in `cypress.config.ts`.
- Visuals: Update Storybook stories for UI changes.

## Commit & Pull Request Guidelines

- Commits: Short, imperative, descriptive (e.g., "Fix spacing in validator view"). Version bumps: "Bump <pkg> from A to B (#PR)".
- PRs: Clear description, linked issues, and screenshots/videos for UI changes. Note config/env impacts. Keep diffs focused and pass CI (build + tests).

## Security & Configuration Tips

- Never commit secrets. Use `.env.*`; Vite reads `VITE_*` at build time.
- For local devnet, set `DEVNET_ERIGON_URL` and `DEVNET_SOURCIFY_SOURCE` per `cypress.config.ts`.

## Architecture Overview

- Client-only SPA: Built to static assets in `dist/` and served via `nginx/` or any static host; all data fetched at runtime.
- Data sources: Ethereum JSON-RPC (optimized for Erigon performance/features) and Sourcify for verified contract metadata/ABIs.
- No backend: Business logic lives in `src/` — `search/` for lookups, `execution/` for call/trace decoding, reusable UI in `components/`.
- Configuration: Endpoints provided via `VITE_*` env vars; devnet defaults and helpers live in `cypress.config.ts`.

## External Docs

- Reference: https://docs.otterscan.io/
- Coverage: Architecture, data sources (Erigon/Sourcify), deployment, configuration.
- Contributions: When changing APIs, flows, or UX, update external docs and related Storybook stories.
