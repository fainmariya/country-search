import { searchCountries } from './api/searchCountries.js';
import { debounce } from './utils/debounce.js';

export function setupCountrySearch(input: HTMLInputElement): void {
  let activeController: AbortController | null = null;

  const debouncedSearch = debounce(async () => {
    if (!activeController) return;
    const timeoutSignal = AbortSignal.timeout(5000);
    const combinedSignal = AbortSignal.any([
      activeController.signal,
      timeoutSignal,
    ]);
    try {
      const countries = await searchCountries(input.value, combinedSignal);
      if (combinedSignal.aborted) return;
      console.log('Countries:', countries);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      if (error instanceof Error && error.name === 'TimeoutError') {
        console.log('Request timed out');
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
