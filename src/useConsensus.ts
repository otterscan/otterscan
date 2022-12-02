import { useContext, useMemo } from "react";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { BigNumber } from "@ethersproject/bignumber";
import { RuntimeContext } from "./useRuntime";

// TODO: get these from config
export const SLOTS_PER_EPOCH = 32;
export const SECONDS_PER_SLOT = 12;

// TODO: remove duplication with other json fetchers
const jsonFetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    }
    return null;
  } catch (err) {
    console.warn(`error while getting beacon data: url=${url} err=${err}`);
    return null;
  }
};

export const useGenesis = () => {
  const { config } = useContext(RuntimeContext);
  const url = config?.beaconAPI
    ? `${config?.beaconAPI}/eth/v1/beacon/genesis`
    : null;
  const { data, error } = useSWRImmutable(url, jsonFetcher);
  if (error) {
    return undefined;
  }
  return data;
};

const useBeaconHeaderURL = (tag: string) => {
  const { config } = useContext(RuntimeContext);
  if (config?.beaconAPI === undefined) {
    return null;
  }
  return `${config.beaconAPI}/eth/v1/beacon/headers/${tag}`;
};

const useBeaconBlockURL = (slotNumber: number) => {
  const { config } = useContext(RuntimeContext);
  if (config?.beaconAPI === undefined) {
    return null;
  }
  return `${config.beaconAPI}/eth/v2/beacon/blocks/${slotNumber}`;
};

const useBlockRootURL = (slotNumber: number) => {
  const { config } = useContext(RuntimeContext);
  if (config?.beaconAPI === undefined) {
    return null;
  }
  return `${config.beaconAPI}/eth/v1/beacon/blocks/${slotNumber}/root`;
};

const useValidatorURL = (validatorIndex: number) => {
  const { config } = useContext(RuntimeContext);
  if (config?.beaconAPI === undefined) {
    return null;
  }
  return `${config.beaconAPI}/eth/v1/beacon/states/head/validators/${validatorIndex}`;
};

const useEpochProposersURL = (epochNumber: number) => {
  const { config } = useContext(RuntimeContext);
  if (config?.beaconAPI === undefined) {
    return null;
  }
  return `${config.beaconAPI}/eth/v1/validator/duties/proposer/${epochNumber}`;
};

const useCommitteeURL = (
  epochNumber: number,
  slotNumber: number,
  committeeIndex: number
) => {
  const { config } = useContext(RuntimeContext);
  if (config?.beaconAPI === undefined) {
    return null;
  }
  return `${config.beaconAPI}/eth/v1/beacon/states/head/committees?epoch=${epochNumber}&slot=${slotNumber}&index=${committeeIndex}`;
};

export const useSlot = (slotNumber: number) => {
  const headSlot = useHeadSlot();
  const url = useBeaconBlockURL(slotNumber);
  const headSlotAsNumber =
    headSlot && parseInt(headSlot.data.header.message.slot);
  const { data, error } = useSWR(headSlotAsNumber ? url : null, jsonFetcher, {
    revalidateOnFocus: false,
    refreshInterval: slotNumber > headSlotAsNumber ? 1000 : 0,
  });
  if (error) {
    return undefined;
  }
  return data;
};

export const useBlockRoot = (slotNumber: number) => {
  const headSlot = useHeadSlot();
  const headSlotAsNumber = parseInt(headSlot.data.header.message.slot);

  const url = useBlockRootURL(slotNumber);
  const { data, error } = useSWR(url, jsonFetcher, {
    revalidateOnFocus: false,
    refreshInterval: slotNumber > headSlotAsNumber ? 1000 : 0,
  });
  if (error) {
    return undefined;
  }
  return data;
};

export const useValidator = (validatorIndex: number) => {
  const url = useValidatorURL(validatorIndex);
  const { data, error } = useSWRImmutable(url, jsonFetcher);
  if (error) {
    return undefined;
  }
  return data;
};

const useEpoch = (
  epochNumber: number
): [startSlot: number, endSlot: number] => {
  const startSlot = epochNumber * SLOTS_PER_EPOCH;
  const endSlot = (epochNumber + 1) * SLOTS_PER_EPOCH - 1;
  return [startSlot, endSlot];
};

export const useSlotsFromEpoch = (epochNumber: number): number[] => {
  const [startSlot, endSlot] = useEpoch(epochNumber);
  const slots = useMemo(() => {
    const s: number[] = [];
    for (let i = startSlot; i <= endSlot; i++) {
      s.push(i);
    }
    return s;
  }, [startSlot, endSlot]);

  return slots;
};

export const useProposers = (epochNumber: number) => {
  const url = useEpochProposersURL(epochNumber);
  const { data, error } = useSWRImmutable(url, jsonFetcher);
  if (error) {
    return undefined;
  }
  return data;
};

export const useProposerMap = (epochNumber: number) => {
  const proposers = useProposers(epochNumber);
  const proposerMap = useMemo(() => {
    if (!proposers) {
      return undefined;
    }

    const m: Record<string, string> = {};
    for (const e of proposers.data) {
      m[e.slot] = e.validator_index;
    }
    return m;
  }, [proposers]);

  return proposerMap;
};

export const useEpochTimestamp = (epoch: any) => {
  const genesis = useGenesis();

  const calcTS = useMemo(() => {
    if (!genesis || !epoch) {
      return undefined;
    }

    const genesisTS = BigNumber.from(genesis.data.genesis_time);
    const epochTS = BigNumber.from(epoch);
    return genesisTS.add(epochTS.mul(SLOTS_PER_EPOCH * SECONDS_PER_SLOT));
  }, [genesis, epoch]);

  return calcTS;
};

export const useSlotTimestamp = (slot: any) => {
  const genesis = useGenesis();

  const calcTS = useMemo(() => {
    if (!genesis || !slot) {
      return undefined;
    }

    const genesisTS = BigNumber.from(genesis.data.genesis_time);
    const slotTS = BigNumber.from(slot);
    return genesisTS.add(slotTS.mul(SECONDS_PER_SLOT));
  }, [genesis, slot]);

  return calcTS;
};

export const useCommittee = (slotNumber: number, committeeIndex: number) => {
  const epochNumber = Math.trunc(slotNumber / SLOTS_PER_EPOCH);
  const url = useCommitteeURL(epochNumber, slotNumber, committeeIndex);
  const { data, error } = useSWRImmutable(url, jsonFetcher);
  if (error) {
    return undefined;
  }
  return data;
};

/**
 * They refresh automatically on purpose because the accepted tags are
 * moving targets
 */
const useDynamicHeader = (tag: "finalized" | "head") => {
  const { config } = useContext(RuntimeContext);

  // Program SWR to revalidate the head every 1s
  const url = useBeaconHeaderURL(tag);
  const { data, error } = useSWR(url, jsonFetcher, {
    revalidateOnFocus: false,
    refreshInterval: 1000,
  });

  if (error) {
    return undefined;
  }
  return data;
};

export const useFinalizedSlot = () => {
  return useDynamicHeader("finalized");
};

export const useHeadSlot = () => {
  return useDynamicHeader("head");
};

export const useHeadEpoch = () => {
  const headSlot = useHeadSlot();
  const headEpoch = useMemo(() => {
    if (headSlot === undefined) {
      return undefined;
    }
    return Math.floor(
      parseInt(headSlot.data.header.message.slot) / SLOTS_PER_EPOCH
    );
  }, [headSlot]);

  return headEpoch;
};

export const useSlotTime = (slot: number | undefined): number | undefined => {
  const genesis = useGenesis();
  if (slot === undefined || genesis === undefined) {
    return undefined;
  }

  const rawDate = genesis.data.genesis_time;
  return parseInt(rawDate) + slot * SECONDS_PER_SLOT;
};
