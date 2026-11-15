import { setupCountrySearch } from './app.js';
const searchInput = document.createElement('input');
searchInput.placeholder = 'Search for a country...';
document.body.append(searchInput);
const resultsContainer = document.createElement('div');
resultsContainer.className = 'countries-container';

document.body.append(resultsContainer);
setupCountrySearch(searchInput, resultsContainer);
