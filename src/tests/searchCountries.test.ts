import { describe, it, expect, vi } from 'vitest';
import { searchCountries } from '../api/searchCountries';

describe('searchCountries', () => {
  it('should return data when API responds successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ name: 'France' }],
    });
    vi.stubGlobal('fetch', mockFetch);
    const controller = new AbortController();
    const result = await searchCountries('fra', controller.signal);
    expect(result).toEqual([{ name: 'France' }]);
    expect(mockFetch).toHaveBeenCalledWith('https://countries.dev/name/fra', {
      signal: controller.signal,
    });
  });
});
