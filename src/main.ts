import { setupCountrySearch } from './app.js';
const searchInput = document.createElement('input');
searchInput.placeholder = 'Search for a country...';
document.body.append(searchInput);
setupCountrySearch(searchInput);
