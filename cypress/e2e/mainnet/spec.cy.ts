describe("Direct navigation by URL", () => {
  it("Loads a block page by hash", () => {
    cy.visit(
      "/block/0xaf53d2fe59e1c849f157be75e2b47b4f8b4d551e55ed27d98ec58eee420df3a7",
    );
    cy.get('[data-test="block-height-text"]', { timeout: 10000 }).contains(
      `18,600,400`,
    );
  });
});
