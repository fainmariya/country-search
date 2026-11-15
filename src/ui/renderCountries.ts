import type { Country } from '../types/country.js';

export function renderCountries(
  countries: Country[],
  container: HTMLDivElement,
): void {
  container.replaceChildren();
  countries.forEach((country) => {
    const card = document.createElement('article');
    card.className = 'country-card';

    const title = document.createElement('h2');
    title.textContent = country.name;
    const flag = document.createElement('span');
    flag.textContent = country.flag;
    flag.className = 'country-flag';
    flag.setAttribute('role', 'img');
    flag.setAttribute('aria-label', `Flag of ${country.name}`);

    const capital = document.createElement('p');
    capital.textContent = `Capital: ${country.capital}`;

    const region = document.createElement('p');
    region.textContent = `Region: ${country.region}`;

    const population = document.createElement('p');
    population.textContent = `Population: ${country.population.toLocaleString('en-US')}`;
    const languages = document.createElement('p');
    languages.textContent = `Languages: ${country.languages.join(', ')}`;
    card.append(flag, title, capital, region, population, languages);
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
    container.append(card);
  });
}
