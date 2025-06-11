import { describe, it, expect } from 'vitest';
import * as index from './index';
import { getMessages } from './get-messages';

describe('messageService index', () => {
  it('re-exports getMessages', () => {
    expect(index.getMessages).toBe(getMessages);
  });
});
