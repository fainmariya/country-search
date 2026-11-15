import { searchCountries } from './api/searchCountries.js';
import { debounce } from './utils/debounce.js';
import { mapCountryResponse } from './utils/mapCountryResponse.js';
import { renderCountries } from './ui/renderCountries.js';
import type { CountryApiResponse } from './types/country.js';

export function setupCountrySearch(
  input: HTMLInputElement,
  resultsContainer: HTMLDivElement,
): void {
  let activeController: AbortController | null = null;

  const debouncedSearch = debounce(async () => {
    if (!activeController) return;
    const timeoutSignal = AbortSignal.timeout(5000);
    const combinedSignal = AbortSignal.any([
      activeController.signal,
      timeoutSignal,
    ]);
    resultsContainer.textContent = 'Loading countries...';
    try {
      const countries = await searchCountries(input.value, combinedSignal);
      if (combinedSignal.aborted) return;
      if (countries.length === 0) {
        resultsContainer.textContent = 'No countries found.';
        return;
      }
      const mappedCountries = countries.map((country) =>
        mapCountryResponse(country as CountryApiResponse),
      );

      renderCountries(mappedCountries, resultsContainer);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      if (error instanceof Error && error.name === 'TimeoutError') {
        resultsContainer.textContent = 'Request timed out. Please try again.';
        return;
      }
      console.log('Caught error:', error);
    }
  }, 300);

  input.addEventListener('input', () => {
    activeController?.abort();
    activeController = new AbortController();
    debouncedSearch();
    console.log(input.value);
  });
}
