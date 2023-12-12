describe("Read Contract tests", () => {
  it("Should get a correct response with array input", () => {
    cy.visit(
      "/address/0x536384FCd25b576265B6775F383D5ac408FF9dB7/readContract",
    );
    cy.get('[data-test="read-function"]')
      .contains("getAddressForCounterfactualWallet")
      .parent()
      .as("func");
    cy.get("@func")
      .find("input")
      .eq(0)
      .type("0x0000000000000000000000000000000000000001");
    cy.get("@func")
      .find("input")
      .eq(1)
      .type("0x0000000000000000000000000000000000000005");
    cy.get("@func").find("button").contains("Add Element").click();
    cy.get("@func")
      .find("input")
      .eq(2)
      .type("0x0000000000000000000000000000000000000006");
    cy.get("@func").find("button").contains("Add Element").click();
    cy.get("@func")
      .find("input")
      .eq(3)
      .type("0x0000000000000000000000000000000000000007");

    cy.get("@func")
      .find("input")
      .eq(1)
      .should("have.value", "0x0000000000000000000000000000000000000005");
    cy.get("@func")
      .find("input")
      .eq(2)
      .should("have.value", "0x0000000000000000000000000000000000000006");
    cy.get("@func")
      .find("input")
      .eq(3)
      .should("have.value", "0x0000000000000000000000000000000000000007");

    // Remove the 2nd element
    cy.get("@func").find("[data-test='remove-array-element']").eq(1).click();
    cy.get("@func")
      .find("input")
      .eq(1)
      .should("have.value", "0x0000000000000000000000000000000000000005");
    cy.get("@func")
      .find("input")
      .eq(2)
      .should("have.value", "0x0000000000000000000000000000000000000007");

    // Add another array element
    cy.get("@func").find("button").contains("Add Element").click();
    cy.get("@func")
      .find("input")
      .eq(3)
      .type("0x0000000000000000000000000000000000000008");

    cy.get("@func")
      .find("input")
      .eq(1)
      .should("have.value", "0x0000000000000000000000000000000000000005");
    cy.get("@func")
      .find("input")
      .eq(2)
      .should("have.value", "0x0000000000000000000000000000000000000007");
    cy.get("@func")
      .find("input")
      .eq(3)
      .should("have.value", "0x0000000000000000000000000000000000000008");

    // Remove the 1st element
    cy.get("@func").find("[data-test='remove-array-element']").eq(0).click();
    cy.get("@func")
      .find("input")
      .eq(1)
      .should("have.value", "0x0000000000000000000000000000000000000007");
    cy.get("@func")
      .find("input")
      .eq(2)
      .should("have.value", "0x0000000000000000000000000000000000000008");

    // Add other inputs
    cy.get("@func")
      .find("input")
      .eq(3)
      .type("0x0000000000000000000000000000000000000002");
    cy.get("@func")
      .find("input")
      .eq(4)
      .type("0x0000000000000000000000000000000000000000");

    // Query
    cy.get("@func").find("button").contains("Query").click();

    cy.get("@func")
      .contains("_wallet")
      .parents("tr")
      .eq(0)
      .contains("0x296d1362694fA673719D6F5dD6521c019ed1978C");
  });
});
