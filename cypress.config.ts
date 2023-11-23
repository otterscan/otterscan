import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    projectId: "rypdvn",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:5173",
  },
});
