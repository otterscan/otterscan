import { useContext, useState } from "react";
import { TransactionData } from "../../../types";
import { RuntimeContext } from "../../../useRuntime";
import RevertTrace from "./RevertTrace";

interface RevertTraceToggleProps {
  txData: TransactionData;
}

const RevertTraceToggle: React.FC<RevertTraceToggleProps> = ({ txData }) => {
  const [visible, setVisible] = useState(false);
  const { config } = useContext(RuntimeContext);

  if (config?.revertTraces?.enabled === false) {
    return null;
  }

  return visible ? (
    <div className="flex">
      <div className="rounded-lg bg-red-50 p-2">
        Revert trace:
        <RevertTrace txHash={txData.transactionHash} />
      </div>
    </div>
  ) : (
    <button
      className="rounded border bg-skin-button-fill px-2 py-1 text-xs text-skin-button hover:bg-skin-button-hover-fill focus:outline-none w-fit"
      type="submit"
      onClick={() => setVisible(true)}
    >
      Show Revert Trace
    </button>
  );
};

export default RevertTraceToggle;
