import type { CountryApiResponse, Country } from '../types/country';

export function mapCountryResponse(raw: CountryApiResponse): Country {
  const languages = raw.languages.map((language) => language.name);
  return {
    name: raw.name,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    flag: raw.flag,
    languages,
  };
}
