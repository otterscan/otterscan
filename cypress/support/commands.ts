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

function getProvider(): ethers.JsonRpcApiProvider {
  return new ethers.JsonRpcProvider(
    Cypress.env("DEVNET_ERIGON_URL") || "http://127.0.0.1:8545",
    undefined,
    // Speed up polling time from 4000ms => 100ms
    { polling: true, pollingInterval: 100 },
  );
}

function getDefaultPrivateKey(): string {
  return (
    Cypress.env("DEVNET_ACCOUNT_KEY") ||
    ethers.sha256(ethers.toUtf8Bytes("erigon devnet key"))
  );
}

// Send a transaction using the devnet key
Cypress.Commands.add(
  "sendTx",
  (txReq: TransactionRequest, privateKey?: string) => {
    return cy.wrap(
      (async () => {
        const provider = getProvider();
        // Temporary fix for https://github.com/ethers-io/ethers.js/issues/4713
        provider.pollingInterval = 100;
        const wallet = new ethers.Wallet(
          privateKey || getDefaultPrivateKey(),
          provider,
        );
        const tx = await wallet.sendTransaction(txReq);
        const txReceipt = await tx.wait();
        return { tx, txReceipt, wallet };
      })(),
      { timeout: 15_000 },
    );
  },
);

// Ensure the mock price oracle is deployed
Cypress.Commands.add("ensurePriceOracle", () => {
  return cy
    .fixture("contracts/AggregatorV3Mock/bytecode.txt")
    .then((priceOracleBytecode) => {
      cy.wrap(
        (async () => {
          const priceOracleDeployerKey = ethers.sha256(
            ethers.toUtf8Bytes("devnet price oracle"),
          );
          const provider = getProvider();
          const deployerWallet = new ethers.Wallet(
            priceOracleDeployerKey,
            provider,
          );
          const priceOracleContractAddr =
            "0xd9f2239f5E91BdC2FBB977dBd31e58cfcB39D0e9";

          const deployerTxCount = await provider.getTransactionCount(
            deployerWallet.address,
          );
          if (deployerTxCount < 2) {
            // Send some funds to the deployer address
            const defaultWallet = new ethers.Wallet(
              getDefaultPrivateKey(),
              provider,
            );
            await defaultWallet
              .sendTransaction({
                to: deployerWallet.address,
                value: ethers.parseEther("0.1"),
                nonce: deployerTxCount,
              })
              .then((tx) => tx.wait());

            // Deploy price oracle contract
            const txResponse = await deployerWallet.sendTransaction({
              data: priceOracleBytecode.trim(),
            });
            const txReceipt = await txResponse.wait();

            // Set price to 1234.5678
            const priceOracle = new ethers.Contract(
              priceOracleContractAddr,
              ["function setRoundData(int answer) public"],
              deployerWallet,
            );
            await priceOracle
              .setRoundData(ethers.parseUnits("1234.5678", 18), {
                nonce: deployerTxCount + 1,
              })
              .then((tx) => tx.wait());
          }
        })(),
        { timeout: 30_000 },
      );
    });
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
