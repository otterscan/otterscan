import { FC } from "react";
import { useAsyncError } from "react-router-dom";
import ConnectionErrorPanel from "./ConnectionErrorPanel";
import { ProbeError } from "./ProbeError";

const ProbeErrorHandler: FC = () => {
  const err = useAsyncError();
  if (!(err instanceof ProbeError)) {
    throw err;
  }

  return <ConnectionErrorPanel connStatus={err.status} nodeURL={err.nodeURL} />;
};

export default ProbeErrorHandler;
