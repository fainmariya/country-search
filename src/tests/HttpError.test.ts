import { describe, it, expect } from 'vitest';
import { HttpError } from '../api/HttpError';

describe('HttpError', () => {
  it('should store HTTP status', () => {
    const error = new HttpError(500);
    expect(error.status).toBe(500);
    expect(error).toBeInstanceOf(Error);
  });
});
