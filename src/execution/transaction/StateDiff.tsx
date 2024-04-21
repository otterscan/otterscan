import { getAddress } from "ethers";
import React, { useContext } from "react";
import ContentFrame from "../../components/ContentFrame";
import DisplayInteger from "../../components/DisplayInteger";
import { balancePreset, neutralPreset } from "../../components/FiatValue";
import HexValue from "../../components/HexValue";
import NativeTokenAmountAndFiat from "../../components/NativeTokenAmountAndFiat";
import { TransactionData } from "../../types";
import {
  StateDiffElement,
  StateDiffGroup,
  useStateDiffTrace,
} from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import TransactionAddress from "../components/TransactionAddress";
import Uint256Decoder from "./decoder/Uint256Decoder";

type StateDiffProps = {
  txData: TransactionData;
};

function isStateDiffGroup(
  group: StateDiffGroup | StateDiffElement,
): group is StateDiffGroup {
  if ((group as StateDiffGroup).title !== undefined) {
    return true;
  }
  return false;
}

const buildStateDiffTree = (
  groups: (StateDiffGroup | StateDiffElement)[] | undefined,
  depth: number = 0,
) => {
  if (groups === undefined) {
    return <></>;
  }
  let result = [];

  // Filter out state diffs with no changes
  groups = groups.filter(
    (group) => !(isStateDiffGroup(group) && group.diffs.length === 0),
  );

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    const last = i == groups.length - 1;
    function getBranch() {
      // This is the L-shaped line that drops down to a child element
      if (depth > 0) {
        return (
          <>
            <div className="absolute h-6 w-5 -translate-y-3 border-b border-l"></div>
            {!last && depth > 1 && (
              <div className="absolute left-0 h-full w-5 translate-y-3 border-l"></div>
            )}
          </>
        );
      }
      return null;
    }

    if (isStateDiffGroup(group)) {
      result.push(
        <>
          {depth === 1 && getBranch()}
          <div className={depth > 0 ? "relative flex" : ""}>
            {depth !== 1 && getBranch()}
            <div
              className={
                depth === 0
                  ? ""
                  : depth < 3
                    ? "ml-5 rounded border px-1 py-0.5 hover:border-gray-500"
                    : "ml-5 py-0.5"
              }
            >
              {depth === 0 ? (
                <div className="relative flex">
                  <div className="rounded border px-1 py-0.5 hover:border-gray-500">
                    <TransactionAddress
                      address={getAddress(group.title)}
                      showCodeIndicator={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-3 font-code">{group.title}</div>
              )}
              <div className="ml-5 space-y-3 self-stretch">
                {buildStateDiffTree(group.diffs, depth + 1)}
              </div>
            </div>
          </div>
        </>,
      );
    } else {
      result.push(getBranch());
      let content = (values: [string, string], extra: string | null) => (
        <>
          <HexValue value={values[0]} /> &#8594; <HexValue value={values[1]} />{" "}
          {extra}
        </>
      );
      let showType = true;
      let values: [string | null, string | null] = [group.from, group.to];
      let extra = null;
      switch (group.type) {
        case "storageChange":
          content = (values, extra) => (
            <div>
              {values[0] !== null && values[0].startsWith("0x") ? (
                <div>
                  <Uint256Decoder r={BigInt(values[0])} />
                </div>
              ) : (
                <div>{values[0]}</div>
              )}
              &#8594;
              {values[1] !== null && values[1].startsWith("0x") ? (
                <div>
                  <Uint256Decoder r={BigInt(values[1])} />
                </div>
              ) : (
                <div>{values[1]}</div>
              )}
            </div>
          );
          showType = false;
          break;
        default:
          switch (group.type) {
            case "nonce":
              values = [
                group.from == null ? null : BigInt(group.from).toString(),
                group.to === null ? null : BigInt(group.to).toString(),
              ];
              content = (values, extra) => (
                <span>
                  {values[0] !== null && values[0].startsWith("0x") ? (
                    <DisplayInteger numberStr={values[0]} />
                  ) : (
                    values[0]
                  )}{" "}
                  <span className="px-2">&#8594;</span>{" "}
                  {values[1] !== null && values[1].startsWith("0x") ? (
                    <DisplayInteger numberStr={values[1]} />
                  ) : (
                    values[1]
                  )}
                </span>
              );
              break;
            case "balance":
              let diffElement: null | React.ReactElement = null;
              if (values[0] !== null && values[1] !== null) {
                let balanceDiff = BigInt(values[1]) - BigInt(values[0]);
                diffElement = (
                  <span className="ml-2">
                    ({balanceDiff >= 0n ? "+" : ""}
                    <NativeTokenAmountAndFiat
                      value={balanceDiff}
                      {...neutralPreset}
                    />
                    )
                  </span>
                );
              }
              content = (values, extra) => (
                <span>
                  {values[0] !== null && values[0].startsWith("0x") ? (
                    <NativeTokenAmountAndFiat
                      value={BigInt(values[0])}
                      {...balancePreset}
                    />
                  ) : (
                    values[0]
                  )}{" "}
                  <span className="px-2">&#8594;</span>{" "}
                  {values[1] !== null && values[1].startsWith("0x") ? (
                    <NativeTokenAmountAndFiat
                      value={BigInt(values[1])}
                      {...balancePreset}
                    />
                  ) : (
                    values[1]
                  )}{" "}
                  {diffElement}
                </span>
              );
              break;
            default:
              break;
          }
      }
      let valuesStrs: [string, string] = [
        values[0] ?? "(new)",
        values[1] ?? "(removed)",
      ];
      let expanded = false;
      result.push(
        <>
          <div className={`relative flex ${last ? "" : "border-l"}`}>
            <div
              className={`ml-5 rounded border px-1 py-0.5 hover:border-gray-500 ${
                expanded ? "w-full" : ""
              }`}
            >
              <div>
                <span className="font-code">
                  {showType ? group.type : null}
                </span>
                <div>
                  <div
                    className={showType ? "ml-5 space-y-3 self-stretch" : ""}
                  >
                    {content(valuesStrs, extra)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
      );
    }
  }
  return result;
};

const StateDiff: React.FC<StateDiffProps> = ({ txData }) => {
  const { provider } = useContext(RuntimeContext);
  const traces = useStateDiffTrace(provider, txData.transactionHash);

  return (
    <ContentFrame tabs>
      <div className="mb-5 mt-4 flex flex-col items-start space-y-3 overflow-x-auto text-sm">
        {traces ? (
          <>
            <div className="ml-5 space-y-3 self-stretch">
              {buildStateDiffTree(traces)}
            </div>
          </>
        ) : (
          <div className="h-7 w-96 rounded border px-1 py-1 hover:border-gray-500">
            <div className="h-full w-full animate-pulse rounded bg-gray-200"></div>
          </div>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(StateDiff);
