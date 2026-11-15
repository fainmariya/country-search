import { searchCountries } from './api/searchCountries.js';
import { debounce } from './utils/debounce.js';
import { mapCountryResponse } from './utils/mapCountryResponse.js';
import { renderCountries } from './ui/renderCountries.js';
export function setupCountrySearch(input, resultsContainer) {
    let activeController = null;
    function showError(message) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = message;
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry';
        retryButton.addEventListener('click', () => {
            input.dispatchEvent(new Event('input'));
        });
        resultsContainer.replaceChildren(errorMessage, retryButton);
    }
    const debouncedSearch = debounce(async () => {
        if (!activeController)
            return;
        const timeoutSignal = AbortSignal.timeout(5000);
        const combinedSignal = AbortSignal.any([
            activeController.signal,
            timeoutSignal,
        ]);
        resultsContainer.textContent = 'Loading countries...';
        try {
            const countries = await searchCountries(input.value, combinedSignal);
            if (combinedSignal.aborted)
                return;
            if (countries.length === 0) {
                resultsContainer.textContent = 'No countries found.';
                return;
            }
            const mappedCountries = countries.map((country) => mapCountryResponse(country));
            renderCountries(mappedCountries, resultsContainer);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            if ((error instanceof Error || error instanceof DOMException) &&
                error.name === 'TimeoutError') {
                showError('Request timed out. Please try again.');
                return;
            }
            showError('Something went wrong. Please try again.');
        }
    }, 300);
    input.addEventListener('input', () => {
        activeController?.abort();
        activeController = new AbortController();
        debouncedSearch();
        console.log(input.value);
    });
}
//# sourceMappingURL=app.js.map