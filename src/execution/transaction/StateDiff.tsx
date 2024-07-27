import { getAddress } from "ethers";
import React, { useContext } from "react";
import ContentFrame from "../../components/ContentFrame";
import DisplayInteger from "../../components/DisplayInteger";
import ElementDiff from "../../components/ElementDiff";
import { neutralPreset } from "../../components/FiatValue";
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
  let keyIndex = 0;

  // Filter out state diffs with no changes
  groups = groups.filter(
    (group) => !(isStateDiffGroup(group) && group.diffs.length === 0),
  );

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    const last = i == groups.length - 1;
    function getBranch(key?: string | number): JSX.Element | null {
      // This is the L-shaped line that drops down to a child element
      if (depth > 0 && depth < 3) {
        return (
          <React.Fragment key={key !== undefined ? key.toString() : key}>
            <div className="absolute h-6 w-5 -translate-y-3 border-b border-l"></div>
            {!last && depth > 1 && (
              <div className="absolute left-0 h-full w-5 translate-y-3 border-l"></div>
            )}
          </React.Fragment>
        );
      }
      return null;
    }

    if (isStateDiffGroup(group)) {
      result.push(
        <React.Fragment key={keyIndex++}>
          {depth === 1 && getBranch()}
          <div className={depth > 0 ? "relative flex" : ""}>
            {depth !== 1 && getBranch()}
            <div
              className={
                depth === 0
                  ? ""
                  : depth < 3
                    ? "ml-5 rounded border px-2 pt-1 pb-2 hover:border-gray-500"
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
              <div
                className={`${depth < 2 ? "ml-5" : ""} space-y-3 self-stretch`}
              >
                {buildStateDiffTree(group.diffs, depth + 1)}
              </div>
            </div>
          </div>
        </React.Fragment>,
      );
    } else {
      result.push(getBranch(keyIndex++));
      let values: [string | null, string | null] = [group.from, group.to];
      let diffElement: null | React.ReactElement = null;
      let formatter: (value: string) => React.ReactNode | null = (
        value: string,
      ) => <>{value}</>;
      let showType = true;
      let showBorder = true;
      switch (group.type) {
        case "storageChange":
          formatter = (value: string) => <Uint256Decoder r={BigInt(value)} />;
          showType = false;
          showBorder = false;
          break;
        case "code":
          formatter = (value: string) => <HexValue value={value} />;
          break;
        case "nonce":
          values = [
            group.from == null ? null : BigInt(group.from).toString(),
            group.to === null ? null : BigInt(group.to).toString(),
          ];
          formatter = (value: string) => <DisplayInteger numberStr={value} />;
          break;
        case "balance":
          if (values[0] !== null && values[1] !== null) {
            let balanceDiff = BigInt(values[1]) - BigInt(values[0]);
            diffElement = (
              <>
                {balanceDiff >= 0n ? "+" : ""}
                <NativeTokenAmountAndFiat
                  value={balanceDiff}
                  explicitPlus={true}
                  {...neutralPreset}
                />
              </>
            );
          }
          formatter = (value: string) => (
            <NativeTokenAmountAndFiat
              value={BigInt(value)}
              {...neutralPreset}
            />
          );
          break;
        default:
          break;
      }
      const expanded = false;
      result.push(
        <div
          key={keyIndex++}
          className={`relative flex ${last ? "" : "border-l"}`}
        >
          <div
            className={`ml-5 py-1 ${showBorder ? "px-2 rounded border hover:border-gray-500" : ""} ${
              expanded ? "w-full" : ""
            }`}
          >
            <div>
              <span className="font-code">{showType ? group.type : null}</span>
              <div>
                <div className={showType ? "ml-5 space-y-3 self-stretch" : ""}>
                  <ElementDiff
                    oldElem={values[0] !== null ? formatter(values[0]) : null}
                    newElem={values[1] !== null ? formatter(values[1]) : null}
                    diffElem={diffElement}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>,
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
