import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { QueryClient } from "@tanstack/react-query";
import type { KlerosResponse } from "./useKleros";

// --- Mock queryClient before importing the module under test ---

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15000 },
  },
});

jest.mock("../queryClient", () => ({
  queryClient: mockQueryClient,
}));

// Now safe to import — the mock is hoisted by Jest
import {
  getCacheReaderQueryOptions,
  KLEROS_ERROR_STALE_TIME,
  KLEROS_STALE_TIME,
  KlerosTagsBatcher,
} from "./useKleros";

// --- Test helpers ---

function makeMockFetch(responseData: KlerosResponse) {
  return jest.fn<typeof globalThis.fetch>().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(responseData),
  } as Response);
}

function makeMockFetchFailing(status = 500) {
  return jest.fn<typeof globalThis.fetch>().mockResolvedValue({
    ok: false,
    status,
  } as Response);
}

/** Extract the parsed request body from the nth fetch mock call. */
function getFetchBody(mockFetch: jest.Mock, callIndex = 0) {
  const call = mockFetch.mock.calls[callIndex] as [string, RequestInit];
  return JSON.parse(call[1].body as string) as {
    chains: string[];
    addresses: string[];
  };
}

const API_URL = "https://scout-api.kleros.link";
const CHAIN_ID = "1";

const ADDR_A = "0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa";
const ADDR_B = "0xBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb";
const ADDR_C = "0xCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc";

const TAG_A = [
  {
    chain_id: "1",
    project_name: "ProjectA",
    name_tag: "TagA",
    public_note: "",
    website_link: "",
    verified_domains: [] as string[],
    token_attributes: null,
    data_origin_link: "",
  },
];
const TAG_B = [
  {
    chain_id: "1",
    project_name: "ProjectB",
    name_tag: "TagB",
    public_note: "",
    website_link: "",
    verified_domains: [] as string[],
    token_attributes: null,
    data_origin_link: "",
  },
];
const TAG_C = [
  {
    chain_id: "1",
    project_name: "ProjectC",
    name_tag: "TagC",
    public_note: "",
    website_link: "",
    verified_domains: [] as string[],
    token_attributes: null,
    data_origin_link: "",
  },
];

/** Wait for the microtask queue and any pending async work to settle. */
async function flushBatcher(): Promise<void> {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// --- Tests ---

describe("KlerosTagsBatcher", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockQueryClient.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("batches multiple addresses into a single fetch call", async () => {
    const responseData: KlerosResponse = {
      addresses: [{ [ADDR_A]: TAG_A }, { [ADDR_B]: TAG_B }],
    };
    globalThis.fetch = makeMockFetch(responseData);

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);

    batcher.schedule(ADDR_A);
    batcher.schedule(ADDR_B);

    await flushBatcher();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    // Verify the request body contains both addresses
    const body = getFetchBody(globalThis.fetch as jest.Mock);
    expect(body.addresses).toContain(ADDR_A);
    expect(body.addresses).toContain(ADDR_B);
    expect(body.addresses).toHaveLength(2);
  });

  test("deduplicates same address registered twice", async () => {
    const responseData: KlerosResponse = {
      addresses: [{ [ADDR_A]: TAG_A }],
    };
    globalThis.fetch = makeMockFetch(responseData);

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);

    batcher.schedule(ADDR_A);
    batcher.schedule(ADDR_A);
    batcher.schedule(ADDR_A);

    await flushBatcher();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const body = getFetchBody(globalThis.fetch as jest.Mock);
    expect(body.addresses).toEqual([ADDR_A]);
  });

  test("seeds individual cache entries from batch response", async () => {
    const responseData: KlerosResponse = {
      addresses: [
        { [ADDR_A]: TAG_A },
        { [ADDR_B]: TAG_B },
        { [ADDR_C]: TAG_C },
      ],
    };
    globalThis.fetch = makeMockFetch(responseData);

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);

    batcher.schedule(ADDR_A);
    batcher.schedule(ADDR_B);
    batcher.schedule(ADDR_C);

    await flushBatcher();

    // Each address should have its own cache entry
    const cachedA = mockQueryClient.getQueryData([
      "kleros",
      CHAIN_ID,
      ADDR_A,
    ]) as KlerosResponse;
    const cachedB = mockQueryClient.getQueryData([
      "kleros",
      CHAIN_ID,
      ADDR_B,
    ]) as KlerosResponse;
    const cachedC = mockQueryClient.getQueryData([
      "kleros",
      CHAIN_ID,
      ADDR_C,
    ]) as KlerosResponse;

    expect(cachedA).toBeDefined();
    expect(cachedA.addresses).toHaveLength(1);
    expect(cachedA.addresses[0][ADDR_A]).toEqual(TAG_A);

    expect(cachedB).toBeDefined();
    expect(cachedB.addresses).toHaveLength(1);
    expect(cachedB.addresses[0][ADDR_B]).toEqual(TAG_B);

    expect(cachedC).toBeDefined();
    expect(cachedC.addresses).toHaveLength(1);
    expect(cachedC.addresses[0][ADDR_C]).toEqual(TAG_C);
  });

  test("seeds empty addresses array for address not found in response", async () => {
    // API returns data for ADDR_A but not ADDR_B
    const responseData: KlerosResponse = {
      addresses: [{ [ADDR_A]: TAG_A }],
    };
    globalThis.fetch = makeMockFetch(responseData);

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);

    batcher.schedule(ADDR_A);
    batcher.schedule(ADDR_B);

    await flushBatcher();

    const cachedA = mockQueryClient.getQueryData([
      "kleros",
      CHAIN_ID,
      ADDR_A,
    ]) as KlerosResponse;
    const cachedB = mockQueryClient.getQueryData([
      "kleros",
      CHAIN_ID,
      ADDR_B,
    ]) as KlerosResponse;

    expect(cachedA.addresses).toHaveLength(1);
    expect(cachedB).toBeDefined();
    expect(cachedB.addresses).toHaveLength(0);
  });

  test("skips addresses already fresh in cache", async () => {
    // Pre-seed a fresh cache entry for ADDR_A
    mockQueryClient.setQueryData(
      ["kleros", CHAIN_ID, ADDR_A],
      { addresses: [{ [ADDR_A]: TAG_A }] } satisfies KlerosResponse,
      { updatedAt: Date.now() },
    );

    const responseData: KlerosResponse = {
      addresses: [{ [ADDR_B]: TAG_B }],
    };
    globalThis.fetch = makeMockFetch(responseData);

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);

    batcher.schedule(ADDR_A); // should be skipped (fresh)
    batcher.schedule(ADDR_B); // should be fetched

    await flushBatcher();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const body = getFetchBody(globalThis.fetch as jest.Mock);
    expect(body.addresses).toEqual([ADDR_B]);
  });

  test("does not fetch when all addresses are fresh", async () => {
    // Pre-seed both addresses
    mockQueryClient.setQueryData(
      ["kleros", CHAIN_ID, ADDR_A],
      { addresses: [{ [ADDR_A]: TAG_A }] } satisfies KlerosResponse,
      { updatedAt: Date.now() },
    );
    mockQueryClient.setQueryData(
      ["kleros", CHAIN_ID, ADDR_B],
      { addresses: [{ [ADDR_B]: TAG_B }] } satisfies KlerosResponse,
      { updatedAt: Date.now() },
    );

    globalThis.fetch = makeMockFetch({ addresses: [] });

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);

    batcher.schedule(ADDR_A);
    batcher.schedule(ADDR_B);

    await flushBatcher();

    // No pending addresses → no microtask scheduled → no fetch
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("seeds empty cache (negative caching) on failed API response", async () => {
    globalThis.fetch = makeMockFetchFailing(500);

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);

    batcher.schedule(ADDR_A);

    await flushBatcher();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    // Negative caching: a defined empty entry is seeded so the observer gets
    // a stable value and the batcher skips re-scheduling during the error window.
    const cached = mockQueryClient.getQueryData([
      "kleros",
      CHAIN_ID,
      ADDR_A,
    ]) as KlerosResponse;
    expect(cached).toBeDefined();
    expect(cached.addresses).toHaveLength(0);
  });

  test("negative-cached address re-schedules after error stale time", async () => {
    // Pre-seed a fully expired negative-cache entry (age === KLEROS_STALE_TIME).
    mockQueryClient.setQueryData(
      ["kleros", CHAIN_ID, ADDR_A],
      { addresses: [] } satisfies KlerosResponse,
      { updatedAt: Date.now() - KLEROS_STALE_TIME },
    );

    const responseData: KlerosResponse = {
      addresses: [{ [ADDR_A]: TAG_A }],
    };
    globalThis.fetch = makeMockFetch(responseData);

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);
    batcher.schedule(ADDR_A);

    await flushBatcher();

    // The expired entry should have triggered a fresh fetch.
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const cached = mockQueryClient.getQueryData([
      "kleros",
      CHAIN_ID,
      ADDR_A,
    ]) as KlerosResponse;
    expect(cached.addresses).toHaveLength(1);
    expect(cached.addresses[0][ADDR_A]).toEqual(TAG_A);
  });

  test("negative-cached address is skipped while within error stale window", async () => {
    // Back-date exactly as flush() does: KLEROS_ERROR_STALE_TIME remains.
    const backdatedAt =
      Date.now() - KLEROS_STALE_TIME + KLEROS_ERROR_STALE_TIME;
    mockQueryClient.setQueryData(
      ["kleros", CHAIN_ID, ADDR_A],
      { addresses: [] } satisfies KlerosResponse,
      { updatedAt: backdatedAt },
    );

    globalThis.fetch = makeMockFetch({ addresses: [] });

    const batcher = new KlerosTagsBatcher(API_URL, CHAIN_ID);
    batcher.schedule(ADDR_A);

    await flushBatcher();

    // Still within the error stale window → should not fetch.
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("separate batchers for different chains do not interfere", async () => {
    const chainId2 = "42161";
    const responseChain1: KlerosResponse = {
      addresses: [{ [ADDR_A]: TAG_A }],
    };
    const responseChain2: KlerosResponse = {
      addresses: [{ [ADDR_A]: TAG_B }],
    };

    let callCount = 0;
    globalThis.fetch = jest
      .fn<typeof globalThis.fetch>()
      .mockImplementation((_url, init) => {
        callCount++;
        const reqBody = JSON.parse(init?.body as string);
        const data =
          reqBody.chains[0] === CHAIN_ID ? responseChain1 : responseChain2;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
        } as Response);
      });

    const batcher1 = new KlerosTagsBatcher(API_URL, CHAIN_ID);
    const batcher2 = new KlerosTagsBatcher(API_URL, chainId2);

    batcher1.schedule(ADDR_A);
    batcher2.schedule(ADDR_A);

    await flushBatcher();

    expect(callCount).toBe(2);

    const cachedChain1 = mockQueryClient.getQueryData([
      "kleros",
      CHAIN_ID,
      ADDR_A,
    ]) as KlerosResponse;
    const cachedChain2 = mockQueryClient.getQueryData([
      "kleros",
      chainId2,
      ADDR_A,
    ]) as KlerosResponse;

    expect(cachedChain1.addresses[0][ADDR_A]).toEqual(TAG_A);
    expect(cachedChain2.addresses[0][ADDR_A]).toEqual(TAG_B);
  });
});

describe("getCacheReaderQueryOptions", () => {
  test("returns enabled:false so useQuery never auto-fetches", () => {
    const opts = getCacheReaderQueryOptions(CHAIN_ID, ADDR_A);
    expect(opts.enabled).toBe(false);
  });

  test("query key matches the batcher cache entry key", () => {
    const opts = getCacheReaderQueryOptions(CHAIN_ID, ADDR_A);
    expect(opts.queryKey).toEqual(["kleros", CHAIN_ID, ADDR_A]);
  });

  test("queryFn is a no-op (returns null, never throws)", async () => {
    const opts = getCacheReaderQueryOptions(CHAIN_ID, ADDR_A);
    const fn = opts.queryFn as () => unknown;
    expect(typeof fn).toBe("function");
    await expect(Promise.resolve(fn())).resolves.toBeNull();
  });
});
