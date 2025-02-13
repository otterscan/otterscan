import { ethers, ZeroAddress } from "ethers";

describe("Search results", () => {
  const usdOracleDeployerKey = ethers.sha256(
    ethers.toUtf8Bytes("devnet price oracle"),
  );
  it("Shows the USD transaction values with wide viewports", () => {
    // Deploy mock USD price contract
    cy.fixture("contracts/AggregatorV3Mock/bytecode.txt").then((bytecode) => {
      cy.sendTx({
        to: "0xb0a147c1aa8084F9E5785AbbA4BfDfcdB279a956",
        value: 100000000000000000n,
      }).then(({ txReceipt }) => {
        cy.sendTx({ data: bytecode.trim() }, usdOracleDeployerKey).then(
          ({ txReceipt }) => {
            // Set native token price to 1234.5678
            cy.sendTx(
              {
                to: "0xd9f2239f5E91BdC2FBB977dBd31e58cfcB39D0e9",
                data: "0xa4381d1f000000000000000000000000000000000000000000000042ed11e914577f8000",
              },
              usdOracleDeployerKey,
            ).then(({ txReceipt3 }) => {
              // Send a positive-value transaction of 0.0245
              cy.sendTx({ to: ZeroAddress, value: 2450000000000000n });
              cy.viewport(1600, 900);

              // Visit address that was sent value
              cy.visit("/address/" + ZeroAddress);

              cy.get(':nth-child(1) > [data-test="tx-value"]').contains(
                "0.00245 ETH",
              );
              cy.get(':nth-child(1) > [data-test="tx-value"]')
                .contains("$")
                .should("not.be.visible");
              cy.viewport(2400, 900);
              cy.get(':nth-child(1) > [data-test="tx-value"]')
                .contains("$3.02")
                .should("be.visible");
            });
          },
        );
      });
    });
  });
});
