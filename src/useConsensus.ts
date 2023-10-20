import { useContext, useMemo } from "react";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { jsonFetcher, jsonFetcherWithErrorHandling } from "./fetcher";
import { RuntimeContext } from "./useRuntime";

// TODO: get these from config
export const SLOTS_PER_EPOCH = 32;
export const SECONDS_PER_SLOT = 12;
export const EPOCHS_AFTER_HEAD = 1;

export const HEAD_SLOT_REFRESH_INTERVAL = 12 * 1000;
export const HEAD_EPOCH_REFRESH_INTERVAL = 60 * 1000;
export const FINALIZED_SLOT_REFRESH_INTERVAL = 60 * 1000;

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

const useValidatorURL = (validatorIndex: number | string) => {
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
  committeeIndex: number,
) => {
  const { config } = useContext(RuntimeContext);
  if (config?.beaconAPI === undefined) {
    return null;
  }
  return `${config.beaconAPI}/eth/v1/beacon/states/head/committees?epoch=${epochNumber}&slot=${slotNumber}&index=${committeeIndex}`;
};

export const useSlot = (slotNumber: number) => {
  const url = useBeaconBlockURL(slotNumber);
  const { data, error, isLoading, isValidating } = useSWR(
    url,
    jsonFetcherWithErrorHandling,
  );

  return {
    slot: data,
    error,
    isLoading,
    isValidating,
  };
};

export const useBlockRoot = (slotNumber: number) => {
  const url = useBlockRootURL(slotNumber);
  const { data, error, isLoading, isValidating } = useSWRImmutable(
    url,
    jsonFetcherWithErrorHandling,
  );

  if (isLoading || isValidating) {
    return {
      blockRoot: undefined,
      error,
      isLoading,
    };
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("data" in data) ||
    data.data === null
  ) {
    return {
      blockRoot: undefined,
      error,
      isLoading,
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
      isLoading,
    };
  }

  return {
    blockRoot: data.data.root,
    error,
    isLoading,
  };
};

export const useValidator = (validatorIndex: number | string) => {
  const url = useValidatorURL(validatorIndex);
  const { data, error } = useSWR(url, jsonFetcherWithErrorHandling);
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

export const useReversedSlotsFromEpoch = (epochNumber: number): number[] => {
  const slots = useSlotsFromEpoch(epochNumber);
  const reversed = useMemo(() => {
    const r = [...slots];
    return r.reverse();
  }, [slots]);

  return reversed;
};

// Note: this API seems really slow in LH; workaround it
// to not block the entire UI:
// https://github.com/sigp/lighthouse/issues/3770
//
// DO NOT SUSPEND ON PURPOSE!!!
export const useProposerMap = (epochNumber: number) => {
  const url = useEpochProposersURL(epochNumber);
  const { data: proposers } = useSWRImmutable(
    url,
    jsonFetcherWithErrorHandling,
  );

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

// 0xFFFFFFFFFFFFFFFF; used to indicate it has not happened yet
const MAX_EPOCH = "18446744073709551615";

export const useEpochTimestamp = (epoch: any) => {
  const genesisTime = useGenesisTime();
  if (epoch === undefined || genesisTime === undefined) {
    return undefined;
  }
  if (epoch === MAX_EPOCH) {
    return undefined;
  }
  return genesisTime + epoch * SLOTS_PER_EPOCH * SECONDS_PER_SLOT;
};

export const useSlotTimestamp = (slot: number | undefined) => {
  const genesisTime = useGenesisTime();
  if (slot === undefined || genesisTime === undefined) {
    return undefined;
  }
  return genesisTime + slot * SECONDS_PER_SLOT;
};

export const useCommittee = (slotNumber: number, committeeIndex: number) => {
  const epochNumber = slot2Epoch(slotNumber);
  const url = useCommitteeURL(epochNumber, slotNumber, committeeIndex);
  const { data, error } = useSWRImmutable(url, jsonFetcherWithErrorHandling);
  if (error) {
    return undefined;
  }
  return data;
};

/**
 * They refresh automatically on purpose because the accepted tags are
 * moving targets
 */
const useDynamicHeader = (
  tag: "finalized" | "head",
  refreshInterval: number = 1000,
) => {
  const url = useBeaconHeaderURL(tag);
  const { data, error } = useSWR(url, jsonFetcher, {
    refreshInterval,
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
export const useHeadSlotNumber = (
  refreshInterval: number = HEAD_SLOT_REFRESH_INTERVAL,
): number | undefined => {
  const slot = useDynamicHeader("head", refreshInterval);
  return parseSlotNumber(slot);
};

export const useFinalizedSlotNumber = (
  refreshInterval: number = FINALIZED_SLOT_REFRESH_INTERVAL,
): number | undefined => {
  const slot = useDynamicHeader("finalized", refreshInterval);
  return parseSlotNumber(slot);
};

export const useHeadEpochNumber = (
  refreshInterval: number = HEAD_EPOCH_REFRESH_INTERVAL,
) => {
  const headSlot = useHeadSlotNumber(refreshInterval);
  if (headSlot === undefined) {
    return undefined;
  }
  return slot2Epoch(headSlot);
};
