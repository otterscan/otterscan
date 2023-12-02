import { ethers } from "ethers";

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
    const hash = cy
      .wrap(
        (async () => {
          // Send a transaction
          const provider = new ethers.JsonRpcProvider(
            Cypress.env("DEVNET_ERIGON_URL"),
          );
          const wallet = new ethers.Wallet(
            ethers.sha256(ethers.toUtf8Bytes("erigon devnet key")),
            provider,
          );
          const tx = await wallet.sendTransaction({
            to: wallet.address,
            value: ethers.parseEther("1"),
          });
          await tx.wait();
          return tx.hash;
        })(),
        { timeout: 15_000 },
      )
      .then((hash) => {
        cy.visit("http://localhost:5173/tx/" + hash);
        // Click Trace button and make sure the trace loads
        cy.get("a").contains("Trace").click();
        cy.get("span").contains("<fallback>");
        cy.location("pathname").should("equal", "/tx/" + hash + "/trace");
        // Go back to the Overview tab
        cy.get("a").contains("Overview").click();
        cy.location("pathname").should("equal", "/tx/" + hash);
        cy.get('[data-test="tx-hash"]').contains(hash);
      });
  });
});
