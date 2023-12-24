describe("Home and navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("Loads the logo text", () => {
    cy.get('[data-test="logotext"]').contains("Otterscan");
  });
  it("Searches by block number", () => {
    const blockNumber = "10";
    cy.get('[data-test="home-search-input"]').type(`${blockNumber}{enter}`);
    cy.url().should("include", `/block/${blockNumber}`);
    cy.get('[data-test="block-number"]').contains(`#${blockNumber}`);
  });
  it("Loads the latest block via useLatestBlockHeader and displays it on the home page", () => {
    cy.get('[data-test="home-latest-block-header"]', { timeout: 10000 });
  });
});
