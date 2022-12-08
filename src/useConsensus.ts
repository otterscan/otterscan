import { useContext, useMemo } from "react";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { RuntimeContext } from "./useRuntime";

// TODO: get these from config
export const SLOTS_PER_EPOCH = 32;
export const SECONDS_PER_SLOT = 12;

// TODO: remove duplication with other json fetchers
// TODO: deprecated and remove
const jsonFetcher = async (url: string): Promise<unknown> => {
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

const jsonFetcherWithErrorHandling = async (url: string) => {
  const res = await fetch(url);
  if (res.ok) {
    return res.json();
  }
  throw res;
};

export const slot2Epoch = (slotNumber: number) =>
  Math.floor(slotNumber / SLOTS_PER_EPOCH);

const useGenesisURL = () => {
  const { config } = useContext(RuntimeContext);
  if (config?.beaconAPI === undefined) {
    return null;
  }
  return `${config.beaconAPI}/eth/v1/beacon/genesis`;
};

export const useGenesisTime = (): number | undefined => {
  const url = useGenesisURL();
  const { data, error } = useSWRImmutable(url, jsonFetcher);

  if (!error && !data) {
    return undefined;
  }
  if (error) {
    return undefined;
  }

  if (typeof data !== "object" || data === null) {
    return undefined;
  }
  if (
    !("data" in data) ||
    typeof data.data !== "object" ||
    data.data === null
  ) {
    return undefined;
  }
  if (
    !("genesis_time" in data.data) ||
    typeof data.data.genesis_time !== "string"
  ) {
    return undefined;
  }
  const genesisTime = parseInt(data.data.genesis_time);
  if (isNaN(genesisTime)) {
    return undefined;
  }
  return genesisTime;
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
  const url = useBeaconBlockURL(slotNumber);
  const { data, error } = useSWR(url, jsonFetcherWithErrorHandling, {
    revalidateOnFocus: false,
  });

  return {
    slot: data,
    error,
    isLoading: !data && !error,
  };
};

export const useBlockRoot = (slotNumber: number) => {
  const url = useBlockRootURL(slotNumber);
  const { data, error } = useSWRImmutable(url, jsonFetcher);

  if (!data) {
    return {
      blockRoot: undefined,
      error,
      isLoading: !data && !error,
    };
  }

  if (typeof data !== "object" || !("data" in data) || data.data === null) {
    return {
      blockRoot: undefined,
      error,
      isLoading: !data && !error,
    };
  }
  if (
    typeof data.data !== "object" ||
    !("root" in data.data) ||
    typeof data.data.root !== "string"
  ) {
    return {
      blockRoot: undefined,
      error,
      isLoading: !data && !error,
    };
  }

  return {
    blockRoot: data.data.root,
    error,
    isLoading: !data && !error,
  };
};

export const useValidator = (validatorIndex: number) => {
  const url = useValidatorURL(validatorIndex);
  const { data, error } = useSWRImmutable(url, jsonFetcher);
  if (error) {
    return undefined;
  }
  return data;
};

export const useSlotsFromEpoch = (epochNumber: number): number[] => {
  const slots = useMemo(() => {
    const startSlot = epochNumber * SLOTS_PER_EPOCH;
    const endSlot = startSlot + SLOTS_PER_EPOCH - 1;

    const s: number[] = [];
    for (let i = startSlot; i <= endSlot; i++) {
      s.push(i);
    }
    return s;
  }, [epochNumber]);

  return slots;
};

// Note: this API seems really slow in LH; workaround it
// to not block the entire UI:
// https://github.com/sigp/lighthouse/issues/3770
//
// DO NOT SUSPEND ON PURPOSE!!!
export const useProposers = (epochNumber: number) => {
  const url = useEpochProposersURL(epochNumber);
  const { data, error } = useSWRImmutable(url, jsonFetcher);
  if (error) {
    console.error(error);
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
    if (typeof proposers !== "object" || !("data" in proposers)) {
      return undefined;
    }
    if (!Array.isArray(proposers.data)) {
      return undefined;
    }

    const m: Record<string, string> = {};
    for (const e of proposers.data as unknown[]) {
      if (typeof e !== "object" || e === null) {
        return undefined;
      }
      if (!("slot" in e) || !("validator_index" in e)) {
        return undefined;
      }
      if (typeof e.slot !== "string" || typeof e.validator_index !== "string") {
        return undefined;
      }
      m[e.slot] = e.validator_index;
    }
    return m;
  }, [proposers]);

  return proposerMap;
};

export const useEpochTimestamp = (epoch: any) => {
  const genesisTime = useGenesisTime();

  const calcTS = useMemo(() => {
    if (!genesisTime || !epoch) {
      return undefined;
    }

    return genesisTime + epoch * SLOTS_PER_EPOCH * SECONDS_PER_SLOT;
  }, [genesisTime, epoch]);

  return calcTS;
};

export const useSlotTimestamp = (slot: number | undefined) => {
  const genesisTime = useGenesisTime();
  if (slot === undefined || genesisTime === undefined) {
    return undefined;
  }
  return genesisTime + slot * SECONDS_PER_SLOT;
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
  // Program SWR to revalidate the head every 1s
  const url = useBeaconHeaderURL(tag);
  const { data, error } = useSWR(url, jsonFetcher, {
    revalidateOnFocus: false,
    refreshInterval: 1000,
  });

  if (error) {
    console.error(error);
    return undefined;
  }
  return data;
};

const parseSlotNumber = (slot: unknown): number | undefined => {
  if (!slot || typeof slot !== "object") {
    return undefined;
  }
  if (
    !("data" in slot) ||
    typeof slot.data !== "object" ||
    slot.data === null
  ) {
    return undefined;
  }
  if (
    !("header" in slot.data) ||
    typeof slot.data.header !== "object" ||
    slot.data.header === null
  ) {
    return undefined;
  }
  if (
    !("message" in slot.data.header) ||
    typeof slot.data.header.message !== "object" ||
    slot.data.header.message === null
  ) {
    return undefined;
  }
  if (
    !("slot" in slot.data.header.message) ||
    typeof slot.data.header.message.slot !== "string"
  ) {
    return undefined;
  }
  const slotAsNumber = parseInt(slot.data.header.message.slot);
  if (isNaN(slotAsNumber)) {
    return undefined;
  }

  return slotAsNumber;
};

// TODO: useMemo
export const useHeadSlotNumber = (): number | undefined => {
  const slot = useDynamicHeader("head");
  return parseSlotNumber(slot);
};

export const useFinalizedSlotNumber = (): number | undefined => {
  const slot = useDynamicHeader("finalized");
  return parseSlotNumber(slot);
};

export const useHeadEpoch = () => {
  const headSlot = useHeadSlotNumber();
  if (headSlot === undefined) {
    return undefined;
  }
  return slot2Epoch(headSlot);
};
