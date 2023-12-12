describe("Devnet tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("Has a warning header with the chain ID", () => {
    cy.get('[data-test="warning-header-network-name"]').contains(
      "You are on ChainID: 1337",
    );
  });
  it("Can navigate to a transaction's Trace tab and back", () => {
    cy.sendTx({
      to: "0x67b1d87101671b127f5f8714789C7192f7ad340e",
    }).then(({ txReceipt }) => {
      cy.visit("/tx/" + txReceipt.hash);
      // Click Trace button and make sure the trace loads
      cy.get("a").contains("Trace").click();
      cy.get("span").contains("<fallback>");
      cy.location("pathname").should(
        "equal",
        "/tx/" + txReceipt.hash + "/trace",
      );
      // Go back to the Overview tab
      cy.get("a").contains("Overview").click();
      cy.location("pathname").should("equal", "/tx/" + txReceipt.hash);
      cy.get('[data-test="tx-hash"]').contains(txReceipt.hash);
    });
  });
});
