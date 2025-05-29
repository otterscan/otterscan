// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on("uncaught:exception", (err) => {
  // Disable Cypress uncaught exceptions from React hydration errors
  // This is a workaround for https://github.com/cypress-io/cypress/issues/27204 /
  // https://github.com/cypress-io/cypress/issues/31447
  if (
    err.message &&
    err.message.includes("https://react.dev/link/hydration-mismatch")
  ) {
    return false;
  }
});
