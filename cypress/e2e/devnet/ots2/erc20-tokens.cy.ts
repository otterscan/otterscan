import { ethers } from "ethers";

describe("ERC-20 token transfers", () => {
  it("Should show the ERC-20 token transfers of a contract creation mint event", () => {
    // Deploy token contract
    cy.fixture("contracts/ERC20Token/bytecode.txt").then((bytecode) => {
      const wallet = ethers.Wallet.createRandom();
      cy.sendTx({ to: wallet.address, value: ethers.parseEther("0.05") });
      cy.sendTx({ data: bytecode.trim() }, wallet).then(({ tx, txReceipt }) => {
        // TODO: Remove this second transaction when ots_hasCode on the contract creation block is fixed
        cy.sendTx({}, wallet);

        // Sending this transaction will cause the contract creation transaction to appear in the list
        /*
        cy.sendTx(
          {
            to: txReceipt.contractAddress,
            data: "0xa9059cbb00000000000000000000000067b1d87101671b127f5f8714789c7192f7ad340e000000000000000000000000000000000000000000000000000000008b13d755",
          },
          wallet,
        );
        */
        cy.interceptDirectory(
          `${Cypress.env("DEVNET_SOURCIFY_SOURCE")}/contracts/full_match/1337/${
            txReceipt.contractAddress
          }/`,
          "contracts/ERC20Token",
        );

        // Visit ERC-20 token transfers page
        cy.visit("/address/" + txReceipt.from + "/erc20");

        cy.contains("A total of 1 transaction found");
        cy.get('[data-test="tx-hash"]').contains(txReceipt.hash);
      });
    });
  });
});
