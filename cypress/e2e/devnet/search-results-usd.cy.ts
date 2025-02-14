import { ZeroAddress } from "ethers";

describe("USD value shown in transaction results in large-width viewports only", () => {
  before(() => {
    // Deploy mock USD price contract
    cy.ensurePriceOracle();
    // Send a positive-value transaction of 0.0245
    cy.sendTx({ to: ZeroAddress, value: 2450000000000000n });
  });

  it("Does not show transaction USD values in smaller viewports", () => {
    cy.viewport(1600, 900);
    // Visit address that was sent value
    cy.visit("/address/" + ZeroAddress);
    cy.get(':nth-child(1) > [data-test="tx-value"]').contains("0.00245 ETH");
    cy.get(':nth-child(1) > [data-test="tx-value"]')
      .contains("$")
      .should("not.be.visible");
  });

  it("Shows transaction USD values in larger viewports", () => {
    cy.viewport(2400, 900);
    cy.visit("/address/" + ZeroAddress);
    cy.get(':nth-child(1) > [data-test="tx-value"]')
      .contains("$3.02")
      .should("be.visible");
  });
});
