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
    const resultsContainer = document.createElement('div');
    setupCountrySearch(input, resultsContainer);

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

    const input = document.createElement('input');
    const resultsContainer = document.createElement('div');
    setupCountrySearch(input, resultsContainer);

    input.value = 'fr';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    input.value = 'fra';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(resultsContainer.textContent).toBe('No countries found.');

    const oldCountries = [{ name: 'Old country' }];

    resolveFirst(new Response(JSON.stringify(oldCountries), { status: 200 }));

    await vi.advanceTimersByTimeAsync(1);

    expect(resultsContainer.textContent).not.toContain('Old country');
  });
  it('retries search after an API error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response('[]', { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const input = document.createElement('input');
    const resultsContainer = document.createElement('div');

    setupCountrySearch(input, resultsContainer);

    input.value = 'fra';
    input.dispatchEvent(new Event('input'));

    await vi.advanceTimersByTimeAsync(300);

    const retryButton = resultsContainer.querySelector('button');

    expect(retryButton?.textContent).toBe('Retry');

    retryButton?.click();

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(resultsContainer.textContent).toBe('No countries found.');
  });
  it('shows timeout error and retry button', async () => {
    const timeoutController = new AbortController();

    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
    const fetchMock = vi.fn((_url: string, options: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => {
          reject(options.signal?.reason);
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const input = document.createElement('input');
    const resultsContainer = document.createElement('div');

    setupCountrySearch(input, resultsContainer);

    input.value = 'fr';
    input.dispatchEvent(new Event('input'));

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    timeoutController.abort(
      new DOMException('Request timed out', 'TimeoutError'),
    );

    await vi.advanceTimersByTimeAsync(1);

    expect(resultsContainer.textContent).toContain('Request timed out');

    const retryButton = resultsContainer.querySelector('button');

    expect(retryButton).not.toBeNull();
    expect(retryButton?.textContent).toBe('Retry');
  });
});
