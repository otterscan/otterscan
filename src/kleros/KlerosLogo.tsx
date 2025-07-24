import React, { HTMLAttributes } from "react";
import klerosSymbolWhite from "./kleros-symbol-white-flat.svg";
import klerosSymbol from "./kleros-symbol.svg";

const KlerosLogo: React.FC<HTMLAttributes<HTMLImageElement>> = (props) => (
  <>
    <img
      {...props}
      className={`${props.className || "h-4 w-4"} dark:hidden`}
      src={klerosSymbol}
      alt="Kleros Scout"
      title="Verified by Kleros Scout"
    />
    <img
      {...props}
      className={`${props.className || "h-4 w-4"} hidden dark:block`}
      src={klerosSymbolWhite}
      alt="Kleros Scout"
      title="Verified by Kleros Scout"
    />
  </>
);

export default KlerosLogo;
