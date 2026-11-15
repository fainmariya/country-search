import { setupCountrySearch } from './app.js';
const header = document.createElement('header');
header.className = 'hero';

const subtitle = document.createElement('p');
subtitle.className = 'hero__label';
subtitle.textContent = '🌍 COUNTRY EXPLORER';

const heading = document.createElement('h1');
heading.textContent = 'Discover the world.';

const description = document.createElement('p');
description.className = 'hero__description';
description.textContent =
  'Explore countries, cultures and places around the globe.';

const searchInput = document.createElement('input');
searchInput.className = 'search-input';
searchInput.placeholder = 'Search for a country...';
searchInput.setAttribute('aria-label', 'Search for a country');

header.append(subtitle, heading, description, searchInput);
document.body.append(header);
const resultsContainer = document.createElement('div');
resultsContainer.className = 'countries-container';

document.body.append(resultsContainer);
setupCountrySearch(searchInput, resultsContainer);
