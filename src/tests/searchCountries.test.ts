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
  it('should return an empty array when API responds with 404', async () => {
    const mockJson = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: mockJson,
    });
    vi.stubGlobal('fetch', mockFetch);
    const controller = new AbortController();
    const result = await searchCountries('btr', controller.signal);
    expect(result).toEqual([]);
    expect(mockJson).not.toHaveBeenCalled();
  });
});
