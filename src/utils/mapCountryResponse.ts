import type { CountryApiResponse, Country } from '../types/country';

export function mapCountryResponse(raw: CountryApiResponse): Country {
  void raw;
  throw new Error('Not implemented');
}
