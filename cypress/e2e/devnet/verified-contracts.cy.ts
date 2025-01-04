describe("Read Contract tests", () => {
  it("Should add and remove elements from a dynamic array", () => {
    // Deploy AllTypes contract
    cy.fixture("contracts/AllTypes/bytecode.txt").then((bytecode) => {
      cy.sendTx({ data: bytecode.trim() }).then(({ txReceipt }) => {
        // TODO: Remove this second transaction when ots_hasCode on the contract creation block is fixed
        cy.sendTx({});
        cy.interceptDirectory(
          `${Cypress.env("DEVNET_SOURCIFY_SOURCE")}/contracts/full_match/1337/${
            txReceipt.contractAddress
          }/`,
          "contracts/AllTypes",
        );

        // Visit contract's Read Contract page
        cy.visit("/address/" + txReceipt.contractAddress + "/readContract");
        cy.get('[data-test="read-function"]')
          .contains("getVariableLengthStringArray")
          .parent()
          .as("func");
        cy.get("@func").find("input.w-full").type("one");
        cy.get("@func").find("button").contains("Add Element").click();
        cy.get("@func").find("input.w-full").eq(1).type("two");
        cy.get("@func").find("button").contains("Add Element").click();
        cy.get("@func").find("input.w-full").eq(2).type("three");

        cy.get("@func").find("input.w-full").eq(0).should("have.value", "one");
        cy.get("@func").find("input.w-full").eq(1).should("have.value", "two");
        cy.get("@func")
          .find("input.w-full")
          .eq(2)
          .should("have.value", "three");

        // Remove the 2nd element
        cy.get("@func")
          .find("[data-test='remove-array-element']")
          .eq(1)
          .click();
        cy.get("@func").find("input.w-full").eq(0).should("have.value", "one");
        cy.get("@func")
          .find("input.w-full")
          .eq(1)
          .should("have.value", "three");

        // Add another array element
        cy.get("@func").find("button").contains("Add Element").click();
        cy.get("@func").find("input.w-full").eq(2).type("new");

        cy.get("@func").find("input.w-full").eq(0).should("have.value", "one");
        cy.get("@func")
          .find("input.w-full")
          .eq(1)
          .should("have.value", "three");
        cy.get("@func").find("input.w-full").eq(2).should("have.value", "new");

        // Remove the 1st element
        cy.get("@func")
          .find("[data-test='remove-array-element']")
          .eq(0)
          .click();
        cy.get("@func")
          .find("input.w-full")
          .eq(0)
          .should("have.value", "three");
        cy.get("@func").find("input.w-full").eq(1).should("have.value", "new");

        // Query
        cy.get("@func").find("button").contains("Query").click();

        cy.get("@func")
          .contains("ret_0 [0]")
          .parents("tr")
          .eq(0)
          .contains("three");
        cy.get("@func")
          .contains("ret_0 [1]")
          .parents("tr")
          .eq(0)
          .contains("new");
      });
    });
  });
});
