# Repository Guidelines

This guide helps contributors work effectively on Otterscan.

## Project Structure & Module Organization

- `src/`: React + TypeScript source (components, hooks, features). Tests live alongside code as `*.test.ts(x)`.
- `public/`: Static assets served by Vite.
- `.storybook/`: Storybook config and previews.
- `cypress/`: E2E tests (`cypress/e2e/**`).
- `docs/`: Project documentation; `dist/`: production build output.
- `scripts/`: Local helper scripts (devnet, Docker).

## Build, Test, and Development Commands

- `npm start`: Start Vite dev server at `http://localhost:5173`.
- `npm run build`: Type-check with `tsc` and produce optimized build.
- `npm run preview`: Serve the build locally for smoke checks.
- `npm test`: Run Jest unit tests.
- `npm run storybook` / `npm run build-storybook`: Develop or build component stories.
- `npm run cy:run-mainnet` / `npm run cy:run-devnet`: Run Cypress E2E suites.
- Docker: `npm run docker-build`, `npm run docker-start`, `npm run docker-stop`.
- Assets CDN (optional): `npm run assets-start` / `npm run assets-stop`.

Examples:

- Devnet config: `VITE_CONFIG_JSON=$(cat cypress/support/devnet-config.json) npm start`

## Coding Style & Naming Conventions

- Language: TypeScript, strict mode enabled.
- Formatting: Prettier with organize-imports (and Tailwind plugin). Run `npx prettier --write .` before pushing.
- Indentation: 2 spaces; file names use `camelCase.tsx` for components, `kebab-case` for assets.
- React: Functional components, hooks for state/data fetching; co-locate tests.

## Testing Guidelines

- Unit tests: Jest + Testing Library. Name as `*.test.ts` or `*.test.tsx` near sources.
- E2E: Cypress under `cypress/e2e/**`. Devnet tests expect a local Erigon/anvil; use scripts in `scripts/`.
- Coverage: Keep or raise existing coverage; add tests for new logic and edge cases.

## Commit & Pull Request Guidelines

- Commits: Imperative, concise subject; include scope when useful (e.g., `search:`). Reference issues/PRs (e.g., `#1234`).
- PRs: Clear description, motivation, and screenshots/GIFs for UI changes; link issues; note testing performed (unit/E2E); include Storybook updates when relevant.
- CI hygiene: Ensure `npm test` and E2E (as applicable) pass locally; run Prettier.

## Security & Configuration Tips

- Use `VITE_*` env vars for client-side config; keep secrets out of git. Local overrides belong in `.env.development.local`.
- When testing against Erigon, expose required APIs: `--http.api eth,erigon,trace,ots,ots2`.
