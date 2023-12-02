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
    },
    baseUrl: "http://localhost:5173",
    video: true,
    env: {
      DEVNET_ERIGON_URL: "http://127.0.0.1:8545",
    },
  },
});
