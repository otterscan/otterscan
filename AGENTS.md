# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (React + TypeScript). Notable subfolders: `components/`, `execution/`, `search/`, `utils/`, hooks like `use*.ts(x)`. UI stories live alongside code as `*.stories.tsx`.
- Assets: `public/` (static), `.storybook/` (Storybook config), `docs/` (project docs), `nginx/` (container config), `dist/` (build output).
- Tests: Unit tests co-located in `src/` as `*.test.ts(x)`; E2E specs under `cypress/e2e/`.

## Build, Test, and Development Commands
- `npm start`: Run Vite dev server at `http://localhost:5173`.
- `npm run start-devnet`: Start with local devnet config (`VITE_CONFIG_JSON`).
- `npm run build`: Type-check then build production bundle into `dist/`.
- `npm run preview`: Serve the built app locally.
- `npm test`: Run Jest unit tests.
- `npm run storybook` / `npm run build-storybook`: Run/build component docs.
- `npm run cy:run-mainnet` / `npm run cy:run-devnet`: Run Cypress E2E suites.
- Docker helpers: `docker-build`, `docker-start`, `docker-hub-start`, and matching `*-stop`.

## Coding Style & Naming Conventions
- Language: TypeScript + React 19, Vite.
- Formatting: Prettier with organize-imports; Tailwind CSS is enabled. Run `npx prettier -w .` before pushing.
- Linting: ESLint extends `react-app` defaults.
- Naming: Components in `PascalCase` (`ComponentName.tsx`), hooks prefixed `use*`, utilities under `utils/`, tests `*.test.ts(x)` next to subjects.

## Testing Guidelines
- Unit: Jest via `ts-jest` (`testEnvironment: node`). Place tests beside code: `thing.test.ts`.
- E2E: Cypress under `cypress/e2e/`. Ensure the dev server is reachable and, for devnet flows, Erigon/Sourcify endpoints from `cypress.config.ts` are available.
- Add tests for new logic and edge cases; update Storybook stories for visual changes.

## Commit & Pull Request Guidelines
- Messages: Short, imperative, and descriptive (e.g., "Fix spacing in validator view"). Version bumps typically follow "Bump <pkg> from A to B (#PR)".
- PRs: Include clear description, linked issues, and screenshots or videos for UI changes. Note any config/env impacts. Keep diffs focused and pass CI (build + tests).

## Security & Configuration Tips
- Do not commit secrets. Use `.env.*` locally (Vite reads `VITE_*` at build time).
- For local devnet, confirm `DEVNET_ERIGON_URL` and `DEVNET_SOURCIFY_SOURCE` (see `cypress.config.ts`).
