import React from "react";
import { useParams } from "react-router-dom";
import TransactionPageContent from "./TransactionPageContent";

const Transaction: React.FC = () => {
  const { txhash } = useParams();
  if (txhash === undefined) {
    throw new Error("txhash couldn't be undefined here");
  }
  return <TransactionPageContent txhash={txhash} />;
};

export default Transaction;
