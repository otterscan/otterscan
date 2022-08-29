import { useContext } from "react";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { RuntimeContext } from "./useRuntime";

// 12s
const SLOT_TIME = 12;

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

export const useFinalizedSlot = () => {
  const { config } = useContext(RuntimeContext);

  // Each slot is 12s, so program SWR to revalidate at this interval
  const { data, error } = useSWR(
    config?.beaconAPI
      ? `${config?.beaconAPI}/eth/v1/beacon/headers/finalized`
      : null,
    jsonFetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: SLOT_TIME * 1000,
    }
  );

  if (error) {
    return undefined;
  }
  return data;
};

export const useBeaconGenesis = () => {
  const { config } = useContext(RuntimeContext);

  const { data, error } = useSWRImmutable(
    config?.beaconAPI ? `${config?.beaconAPI}/eth/v1/beacon/genesis` : null,
    jsonFetcher
  );

  if (error) {
    return undefined;
  }
  return data;
};

export const useSlotTime = (slot: number | undefined): number | undefined => {
  const genesis = useBeaconGenesis();
  if (slot === undefined || genesis === undefined) {
    return undefined;
  }

  const rawDate = genesis.data.genesis_time;
  return parseInt(rawDate) + slot * SLOT_TIME;
};
