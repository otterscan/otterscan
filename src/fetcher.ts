// TODO: remove duplication with other json fetchers
// TODO: deprecated and remove
export const jsonFetcher = async (url: string): Promise<unknown> => {
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

export const jsonFetcherWithErrorHandling = async (url: string) => {
  const res = await fetch(url);
  if (res.ok) {
    return res.json();
  }
  throw res;
};
