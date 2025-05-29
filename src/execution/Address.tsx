import { FC, lazy } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/Address";
import AddressMainPage from "./AddressMainPage";

const AddressTransactionByNonce = lazy(
  () => import("./AddressTransactionByNonce"),
);

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // TODO: How can we access the runtime from the loader?
  /*
  runtime.then((rt) => {
    if (isAddress(params.addressOrName)) {
      const query = hasCodeQuery(rt.provider, params.addressOrName, "latest");
      queryClient.prefetchQuery(query);
    }
  });
  */
  return null;
}

/**
 * This is the default handler for /address/* URL path.
 *
 * It can redirect to different child components depending on search
 * query params, so it is not possible to use default path routing
 * mechanisms to declarative-model them.
 */
const Address: FC = () => {
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
