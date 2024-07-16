import { LoaderFunctionArgs, redirect } from "react-router-dom";
import invariant from "tiny-invariant";
import { parseSearch } from "./search/search";

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  invariant(q !== null);

  const redir = parseSearch(q);
  if (redir === undefined) {
    // This probably means we didn't handle some search criteria and
    // should actually not happen
    throw new Response("Not Found", { status: 404 });
  }
  return redirect(redir);
};
