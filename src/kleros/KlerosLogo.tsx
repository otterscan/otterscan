import React from "react";
import klerosSymbol from "./kleros-symbol.svg";
import klerosSymbolWhite from "./kleros-symbol-white-flat.svg";

const KlerosLogo: React.FC = () => (
  <>
    <img
      className="h-4 w-4 dark:hidden"
      src={klerosSymbol}
      alt="Kleros Scout"
      title="Verified by Kleros Scout"
    />
    <img
      className="h-4 w-4 hidden dark:block"
      src={klerosSymbolWhite}
      alt="Kleros Scout"
      title="Verified by Kleros Scout"
    />
  </>
);

export default KlerosLogo;