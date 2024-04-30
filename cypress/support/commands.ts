/// <reference types="cypress" />
import {
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse,
  Wallet,
  ethers,
} from "ethers";

Cypress.Commands.add(
  "interceptDirectory",
  (baseUrl: string, directory: string) => {
    cy.intercept(baseUrl + "**", (req) => {
      const filePath = req.url.replace(baseUrl, "");
      req.reply({
        fixture: directory + "/" + filePath,
      });
    });
  },
);

// Send a transaction using the devnet key
Cypress.Commands.add("sendTx", (txReq: TransactionRequest) => {
  return cy.wrap(
    (async () => {
      const provider = new ethers.JsonRpcProvider(
        Cypress.env("DEVNET_ERIGON_URL"),
        undefined,
        // Speed up polling time from 4000ms => 100ms
        { polling: true, pollingInterval: 100 },
      );
      // Temporary fix for https://github.com/ethers-io/ethers.js/issues/4713
      provider.pollingInterval = 100;
      const wallet = new ethers.Wallet(
        Cypress.env("DEVNET_ACCOUNT_KEY") ||
          ethers.sha256(ethers.toUtf8Bytes("erigon devnet key")),
        provider,
      );
      const tx = await wallet.sendTransaction(txReq);
      const txReceipt = await tx.wait();
      return { tx, txReceipt, wallet };
    })(),
    { timeout: 15_000 },
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      interceptDirectory(baseUrl: string, directory: string): Chainable<void>;
      sendTx(txReq: TransactionRequest): Chainable<{
        tx: TransactionResponse;
        txReceipt: TransactionReceipt;
        wallet: Wallet;
      }>;
    }
  }
}
