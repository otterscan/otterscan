describe("Advanced search", () => {
  const navigateAndAssert = (
    address: string,
    initialUrl: string,
    initialHash: string,
    navAssertions: [
      direction: "next" | "prev" | "back",
      expectedHash: string,
    ][],
    txHashIndex: number,
  ) => {
    cy.visit(initialUrl);
    cy.get('[data-test="address"]', { timeout: 15_000 }).contains(address);
    cy.get('[data-test="tx-hash"]')
      .eq(txHashIndex)
      .invoke("text")
      .should("equal", initialHash);

    navAssertions.forEach(([direction, expectedHash]) => {
      if (direction === "back") {
        cy.go("back");
      } else {
        cy.get(`[data-test="nav-${direction}"]`).first().click();
      }
      cy.get('[data-test="tx-hash"]')
        .eq(txHashIndex)
        .invoke("text")
        .should("equal", expectedHash);
    });
  };

  it("Should load correct intra-block transaction hash", () => {
    const address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const initialUrl =
      "/address/0xdAC17F958D2ee523a2206206994597C13D831ec7/txs/next?h=0x0af4ac9aa2654a5a66b988dae5daedd1b22fe3dfa5af2ab5d205f656f22805a3";
    const initialHash =
      "0xf9ef591307c4790f95324797f423b8a6ce443ce748d3b574ef7a9e12d2d681cb";
    const navAssertions: [direction: "next" | "prev", expectedHash: string][] =
      [
        [
          "prev",
          "0x299e208b92b4c46c5a270991c7849216ca9b23d9a34607a221bf590d7eb435cd",
        ],
        [
          "prev",
          "0xf2c7a6dfc21803a7af7c76e9d46fa40b963528de02e0ee2801ac66a6d099d3bf",
        ],
        [
          "next",
          "0x299e208b92b4c46c5a270991c7849216ca9b23d9a34607a221bf590d7eb435cd",
        ],
        [
          "next",
          "0xf9ef591307c4790f95324797f423b8a6ce443ce748d3b574ef7a9e12d2d681cb",
        ],
      ];
    navigateAndAssert(address, initialUrl, initialHash, navAssertions, 1);
  });

  it("Should correctly step in both directions through a block with over 100 relevant transactions", () => {
    const address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const initialUrl =
      "/address/0xdAC17F958D2ee523a2206206994597C13D831ec7/txs/prev?h=0xb8c6d15e5fceb17f52eae0e1e633d9aa481db2bef23c1483519a1c894ff6f283";
    const initialHash =
      "0xaef7598e47d575f7fa9da8bab05dc4436f9080a6c46a53ef76dc81d41577e8f2";
    const navAssertions: [direction: "next" | "prev", expectedHash: string][] =
      [
        [
          "prev",
          "0xae317b3f6e9b7850667e9b416e4a46163e27ada1256e0e098cb6dc56cb024ed0",
        ],
        [
          "prev",
          "0xda402b7b7996010df5d8f2da29befa913c3177c872404e0f9182e78b29af0958",
        ],
        [
          "prev",
          "0xbdfb45c4c44af4e7aa675605e4eec3f54a0900d19f50aed863cdcaa4a57be85b",
        ],
        [
          "prev",
          "0x822549f2f90dea7cfca983a3ccbc6e4e592213255ab700d0a20e2b957572435d",
        ],
        [
          "prev",
          "0x3ce32d07f22bb8af8674a2d256b275ca330c1d5ae0b8fa77d93ff441874d15b2",
        ],
        [
          "prev",
          "0x7283a46089e1b0869eeb10e047fe460461fe1003023c653c21f46bef575f00cb",
        ],
        [
          "prev",
          "0x43860882e3573bbb83e6f63029b66735e46eb65c1c5e06224e696d9091336d6a",
        ],
        [
          "prev",
          "0xdda36e94f471efc717dd51c63f29c1d3a87ec3f208a94441d21406202937d4b3",
        ],
        [
          "prev",
          "0x3f95684f86ee25f2bbf0e8ee521392ac8277ceeadac9e7501153856336a96052",
        ],
        [
          "next",
          "0xdda36e94f471efc717dd51c63f29c1d3a87ec3f208a94441d21406202937d4b3",
        ],
        [
          "next",
          "0x43860882e3573bbb83e6f63029b66735e46eb65c1c5e06224e696d9091336d6a",
        ],
        [
          "next",
          "0x7283a46089e1b0869eeb10e047fe460461fe1003023c653c21f46bef575f00cb",
        ],
        [
          "next",
          "0x3ce32d07f22bb8af8674a2d256b275ca330c1d5ae0b8fa77d93ff441874d15b2",
        ],
        [
          "next",
          "0x822549f2f90dea7cfca983a3ccbc6e4e592213255ab700d0a20e2b957572435d",
        ],
        [
          "next",
          "0xbdfb45c4c44af4e7aa675605e4eec3f54a0900d19f50aed863cdcaa4a57be85b",
        ],
        [
          "next",
          "0xda402b7b7996010df5d8f2da29befa913c3177c872404e0f9182e78b29af0958",
        ],
        [
          "next",
          "0xae317b3f6e9b7850667e9b416e4a46163e27ada1256e0e098cb6dc56cb024ed0",
        ],
        [
          "next",
          "0xaef7598e47d575f7fa9da8bab05dc4436f9080a6c46a53ef76dc81d41577e8f2",
        ],
      ];
    navigateAndAssert(address, initialUrl, initialHash, navAssertions, 1);
  });

  it("Should navigate with the browser's back button after two prev paginations", () => {
    const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const initialUrl =
      "/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/txs/last";
    const initialHash =
      "0x32e725433af17709360462be3ee194bba4994650fe697b5677339531a5db99a9";
    const navAssertions: [
      direction: "next" | "prev" | "back",
      expectedHash: string,
    ][] = [
      [
        "prev",
        "0x012616c16fc2dbffe6dfba0f450aca81624743a684e176cea208e499a1af9b62",
      ],
      [
        "prev",
        "0x64426b39b22e76b9679c86292d16e1ca1f68a144a9029ec49efdae1f900db8d8",
      ],
      [
        "back",
        "0x012616c16fc2dbffe6dfba0f450aca81624743a684e176cea208e499a1af9b62",
      ],
    ];
    navigateAndAssert(address, initialUrl, initialHash, navAssertions, 0);
  });
});
