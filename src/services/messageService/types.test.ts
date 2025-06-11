import { describe, it, expect } from 'vitest';
import * as types from './types';

describe('messageService types', () => {
  it('module loads', () => {
    expect(typeof types).toBe('object');
  });
});
