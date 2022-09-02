import React from "react";
import { useSearchParams } from "react-router-dom";
import AddressMainPage from "./AddressMainPage";

const AddressTransactionByNonce = React.lazy(
  () => import("./AddressTransactionByNonce")
);

/**
 * This is the default handler for /address/* URL path.
 *
 * It can redirect to different child components depending on search
 * query params, so it is not possible to use default path routing
 * mechanisms to declarative-model them.
 */
const Address: React.FC = () => {
  // Search address by nonce === transaction @ nonce
  const [searchParams] = useSearchParams();
  const rawNonce = searchParams.get("nonce");
  if (rawNonce !== null) {
    return <AddressTransactionByNonce rawNonce={rawNonce} />;
  }

  // Standard address main page with tabs
  return <AddressMainPage />;
};

export default Address;
