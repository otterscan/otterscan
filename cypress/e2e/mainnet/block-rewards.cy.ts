describe("ETH mainnet block rewards", () => {
  it("Should be 5 ETH pre-Byzantium", () => {
    cy.visit("/block/4369999");
    cy.get('[data-test="block-reward"]').invoke("text").should("equal", "5");
  });

  it("Should be 3 ETH post-Byzantium", () => {
    cy.visit("/block/4370000");
    cy.get('[data-test="block-reward"]').invoke("text").should("equal", "3");
  });

  it("Should be 3 ETH pre-Constantinople", () => {
    cy.visit("/block/7279999");
    cy.get('[data-test="block-reward"]').invoke("text").should("equal", "3");
  });

  it("Should be 2 ETH post-Constantinople", () => {
    cy.visit("/block/7280000");
    cy.get('[data-test="block-reward"]').invoke("text").should("equal", "2");
  });

  it("Should be 2 ETH pre-merge", () => {
    cy.visit("/block/15537393");
    cy.get('[data-test="block-reward"]').invoke("text").should("equal", "2");
  });

  it("Should be 0 ETH post-merge", () => {
    cy.visit("/block/15537394");
    cy.get('[data-test="block-reward"]').invoke("text").should("equal", "0");
  });
});
