import React, { useContext, useRef, useState } from "react";
import ContentFrame from "../components/ContentFrame";
import StandardFrame from "../components/StandardFrame";
import StandardSubtitle from "../components/StandardSubtitle";
import StandardTextarea from "../components/StandardTextarea";
import TransactionLink from "../components/TransactionLink";
import { RuntimeContext } from "../useRuntime";

const BroadcastTransactionPage: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const txFieldRef = useRef<HTMLTextAreaElement>(null);
  const [rawTx, setRawTx] = useState<string>("");
  const [resultState, setResultState] = useState<{
    success: boolean | null;
    result: string;
  }>({ success: null, result: "" });

  async function submitTx() {
    const trimmedRawTx = rawTx.trim();
    if (trimmedRawTx.length > 2) {
      try {
        const txHash = await provider.send("eth_sendRawTransaction", [
          trimmedRawTx,
        ]);
        setResultState({ success: true, result: txHash });
      } catch (e: any) {
        setResultState({ success: false, result: e.toString() });
      }
    } else {
      setResultState({
        success: false,
        result: "Please enter a raw signed transaction.",
      });
    }
  }

  return (
    <StandardFrame>
      <StandardSubtitle>Broadcast Transaction</StandardSubtitle>
      <ContentFrame>
        <div className="space-y-3 py-4">
          <div>
            This page lets you broadcast a raw signed transaction to the
            network. Enter the transaction in hexadecimal format below:
          </div>
          <StandardTextarea
            onChange={(e) => setRawTx(e.target.value)}
            readOnly={false}
            placeholder={"0x..."}
          ></StandardTextarea>
          <div>
            <button
              className="bg-skin-button-fill text-skin-button hover:bg-skin-button-hover-fill py-1 px-2 rounded border inline-flex items-center"
              onClick={submitTx}
            >
              Send Transaction
            </button>
          </div>
          {resultState.success === false && (
            <div>
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-2.5 rounded relative break-words"
                role="alert"
              >
                <strong className="font-bold">Error!</strong> Failed to
                broadcast transaction:{" "}
                <div className="font-mono">{resultState.result}</div>
              </div>
            </div>
          )}
          {resultState.success && (
            <div
              className="bg-green-100 border border-green-300 text-green-700 px-4 py-2.5 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Success!</strong> Transaction hash:{" "}
              <span className="flex">
                <TransactionLink txHash={resultState.result} />
              </span>
            </div>
          )}
        </div>
      </ContentFrame>
    </StandardFrame>
  );
};

export default BroadcastTransactionPage;
