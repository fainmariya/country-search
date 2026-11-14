import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from '../utils/mapCountryResponse';
import type { CountryApiResponse } from '../types/country';

describe('mapCountryResponse', () => {
  it('should transform API response into Country data', () => {
    const raw: CountryApiResponse = {
      name: 'France',
      capital: 'Paris',
      region: 'Europe',
      population: 68000000,
      flag: '🇫🇷',
      languages: [{ name: 'French' }],
    };
    const result = mapCountryResponse(raw);
    expect(result).toEqual({
      name: 'France',
      capital: 'Paris',
      region: 'Europe',
      population: 68000000,
      flag: '🇫🇷',
      languages: ['French'],
    });
  });
});
