import { Wallet } from "ethers";

describe("Navigation", () => {
  it("Should navigate correctly on address transaction results pages with a single transaction", () => {
    // Send 26 transactions (25n + 1, with the default page size of 25)
    const targetAddr = Wallet.createRandom().address;
    const loopArr = Array.from({ length: 25 + 1 }, (value, index) => index);
    cy.wrap(loopArr)
      .each((index) => {
        cy.sendTx({
          to: targetAddr,
          value: 1_000_000_000n * BigInt(index + 1),
        });
      })
      .then(() => {
        cy.visit(`/address/${targetAddr}`);
        cy.get('[data-test="address"]', { timeout: 15_000 }).contains(
          targetAddr,
        );

        // Check that the first transaction is the most recent
        cy.get(":nth-child(1) > .min-w-48")
          .invoke("text")
          .should("contain", "0.000000026");
        // Check that the next page has the expected transaction
        cy.get('[data-test="nav-next"]').first().click();
        cy.get(":nth-child(1) > .min-w-48")
          .invoke("text")
          .should("contain", "0.000000001");
        // Go back
        cy.get('[data-test="nav-prev"]').first().click();
        cy.get(":nth-child(1) > .min-w-48")
          .invoke("text")
          .should("contain", "0.000000026");
        // Try again starting on the last page, going the other direction
        cy.get('[data-test="nav-last"]').first().click();
        cy.get(":nth-child(1) > .min-w-48")
          .invoke("text")
          .should("contain", "0.000000025");
        cy.get('[data-test="nav-prev"]').first().click();
        cy.get(":nth-child(1) > .min-w-48")
          .invoke("text")
          .should("contain", "0.000000026");
        cy.get('[data-test="nav-next"]').first().click();
        cy.get(":nth-child(1) > .min-w-48")
          .invoke("text")
          .should("contain", "0.000000025");
      });
  });
});
