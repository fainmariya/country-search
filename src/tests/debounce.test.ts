import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { debounce } from '../utils/debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('should not call callback immediately', () => {
    const callback = vi.fn();
    const search = debounce(callback, 300);
    search();
    expect(callback).toHaveBeenCalledTimes(0);
  });
  it('should invoke the callback only after the specified delay', () => {
    const callback = vi.fn();
    const search = debounce(callback, 300);
    search();
    expect(callback).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);
  });
  it('should reset the timer on repeated calls', () => {
    const callback = vi.fn();
    const search = debounce(callback, 300);

    search();
    vi.advanceTimersByTime(200);
    search();
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
