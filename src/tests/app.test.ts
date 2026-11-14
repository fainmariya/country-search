// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupCountrySearch } from '../app';

describe('setupCountrySearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('aborts previous request immediately on new input', () => {
    const fetchMock = vi.fn((...args: [string, RequestInit]) => {
      void args;
      return new Promise<Response>(() => {});
    });

    vi.stubGlobal('fetch', fetchMock);

    const input = document.createElement('input');
    setupCountrySearch(input);

    input.value = 'fr';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const options = fetchMock.mock.calls[0]?.[1];
    const signal = options?.signal;

    if (!signal) {
      throw new Error('AbortSignal was not passed to fetch');
    }

    expect(signal.aborted).toBe(false);

    input.value = 'fra';
    input.dispatchEvent(new Event('input'));

    expect(signal.aborted).toBe(true);
  });

  it('ignores stale response after request cancellation', async () => {
    let resolveFirst!: (response: Response) => void;

    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => firstResponse)
      .mockImplementationOnce(() => Promise.resolve(new Response('[]')));

    vi.stubGlobal('fetch', fetchMock);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const input = document.createElement('input');
    setupCountrySearch(input);

    input.value = 'fr';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    input.value = 'fra';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith('Countries:', []);

    const oldCountries = [{ name: 'Old country' }];

    resolveFirst(new Response(JSON.stringify(oldCountries), { status: 200 }));

    await vi.advanceTimersByTimeAsync(1);

    expect(consoleSpy).not.toHaveBeenCalledWith('Countries:', oldCountries);
  });
});
