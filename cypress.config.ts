import { defineConfig } from "cypress";
import fs from "fs";

export default defineConfig({
  e2e: {
    projectId: "rypdvn",
    setupNodeEvents(on, config) {
      on(
        "after:spec",
        (spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
          if (results && results.video) {
            // Do we have failures for any retry attempts?
            const failures = results.tests.some((test) =>
              test.attempts.some((attempt) => attempt.state === "failed"),
            );
            if (!failures) {
              // delete the video if the spec passed and no tests retried
              fs.unlinkSync(results.video);
            }
          }
        },
      );
      on("task", {
        // Run cy.task('log', <message>) to log something to stdout
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    baseUrl: "http://localhost:5173",
    // SyntaxHighlighter files may take several seconds to load in dev mode
    defaultCommandTimeout: 8_000,
    video: true,
    env: {
      DEVNET_ERIGON_URL: "http://localhost:8545",
      DEVNET_SOURCIFY_SOURCE: "http://localhost:7077",
    },
  },
});
