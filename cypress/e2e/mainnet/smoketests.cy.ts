describe("Basic navigation", () => {
  it("Should load vitalik.eth address", () => {
    // From the home page, go to vitalik.eth address page, expect it finds it
    cy.visit("/");
    cy.get('[data-test="home-search-input"]').type(`vitalik.eth{enter}`);

    cy.get('[data-test="address"]', { timeout: 15_000 }).contains(
      "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    );

    // Go to last page, check if it has a full 25 entries page
    cy.get('[data-test="nav-last"]').first().click();
    cy.get('[data-test="page-count"]')
      .first()
      .invoke("text")
      .should("equal", "25");

    // Examine the first transaction hash
    cy.get('[data-test="tx-hash"]')
      .first()
      .invoke("text")
      .should(
        "equal",
        "0x32e725433af17709360462be3ee194bba4994650fe697b5677339531a5db99a9",
      );

    // Go back 2 pages
    cy.get('[data-test="nav-prev"]').first().click();
    cy.get('[data-test="tx-hash"]')
      .first()
      .invoke("text")
      .should(
        "equal",
        "0x012616c16fc2dbffe6dfba0f450aca81624743a684e176cea208e499a1af9b62",
      );

    cy.get('[data-test="nav-prev"]').first().click();
    cy.get('[data-test="tx-hash"]')
      .first()
      .invoke("text")
      .should(
        "equal",
        "0x64426b39b22e76b9679c86292d16e1ca1f68a144a9029ec49efdae1f900db8d8",
      );

    // Go forward 1 page (test forward is working)
    cy.get('[data-test="nav-next"]').first().click();
    cy.get('[data-test="tx-hash"]')
      .first()
      .invoke("text")
      .should(
        "equal",
        "0x012616c16fc2dbffe6dfba0f450aca81624743a684e176cea208e499a1af9b62",
      );

    // Click second tx, open tx page
    cy.get('[data-test="tx-hash"]').eq(1).click();
    cy.location("pathname").should(
      "equal",
      "/tx/0x9b8964cd49910fd7494fb8359912b8925bf7417126a3e5a0a3f69e0166ad437e",
    );
    cy.get('[data-test="tx-hash"]')
      .invoke("text")
      .should(
        "equal",
        "0x9b8964cd49910fd7494fb8359912b8925bf7417126a3e5a0a3f69e0166ad437e",
      );
    cy.get('[data-test="status"]').invoke("text").should("equal", "Success");
  });
});
