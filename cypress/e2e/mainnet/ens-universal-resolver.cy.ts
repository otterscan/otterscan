describe("ENS Universal Resolver", () => {
  it("Should resolve ur.integration-tests.eth", () => {
    // ENS publishes ur.integration-tests.eth with a wildcard CCIP-Read resolver
    // that legacy resolution can't reach — only the Universal Resolver returns
    // an address. If this passes, the patch is wired up.
    cy.visit("/");
    cy.get('[data-test="home-search-input"]').type(
      `ur.integration-tests.eth{enter}`,
    );

    cy.get('[data-test="address"]', { timeout: 15_000 }).contains(
      "0x2222222222222222222222222222222222222222",
    );
  });
});
