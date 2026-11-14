import { HttpError } from './HttpError';

export async function searchCountries(
  query: string,
  signal: AbortSignal,
): Promise<unknown[]> {
  const url = `https://countries.dev/name/${query}`;
  const response = await fetch(url, { signal });

  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new HttpError(response.status);
  }
  return await response.json();
}
