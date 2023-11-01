import React from "react";
import TimestampAge from "../components/TimestampAge";
import { DsBlockObj } from '@zilliqa-js/core/dist/types/src/types'
import { commify } from "ethers";
import { addHexPrefix, pubKeyToAddr, zilliqaToOtterscanTimestamp } from "../utils/utils";
import DSBlockLink from "../components/DSBlockLink";
import TransactionAddress from "../execution/components/TransactionAddress";
import HexValue from "../components/HexValue";

type DSBlockItemProps = {
  block: DsBlockObj; 
  selectedAddress?: string;
};

const DSBlockItem: React.FC<DSBlockItemProps > = ( { block, selectedAddress } ) => {

  return (
    <div
    className="grid grid-cols-12 items-baseline gap-x-1 border-t border-gray-200 text-sm 
    hover:bg-skin-table-hover px-2 py-3"
    >
    <span>
    <DSBlockLink blockTag={block.header.BlockNum} />
    </span>
    <span>
      {commify(block.header.Difficulty)}
    </span>
    <span>
      {commify(block.header.DifficultyDS)}
    </span>
    <TimestampAge timestamp={zilliqaToOtterscanTimestamp(block.header.Timestamp)}/>
    <span className="col-span-4 truncate">
    <TransactionAddress
      address={pubKeyToAddr(block.header.LeaderPubKey)}
      selectedAddress={selectedAddress}
      miner={true}
    />
    </span>
    <span className="col-span-4 truncate">
    <HexValue value={addHexPrefix(block.header.PrevHash)} />
    </span>
    </div>
  );
};

export default DSBlockItem;
