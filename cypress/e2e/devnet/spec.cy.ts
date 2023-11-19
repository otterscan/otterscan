describe("Devnet tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("Has a warning header with the chain ID", () => {
    cy.get('[data-test="warning-header-network-name"]').contains(
      "You are on ChainID: 1337",
    );
  });
});
