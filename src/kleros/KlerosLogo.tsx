import React from "react";
import klerosSymbol from "./kleros-symbol-white-flat.svg";

const KlerosLogo: React.FC = () => (
  <img
    className="h-4 w-4"
    src={klerosSymbol}
    alt="Kleros Scout"
    title="Verified by Kleros Scout"
  />
);

export default KlerosLogo;