export async function searchCountries(
  query: string,
  signal: AbortSignal,
): Promise<unknown[]> {
  const url = `https://countries.dev/name/${query}`;
  const response = await fetch(url, { signal });
  return await response.json();
}
