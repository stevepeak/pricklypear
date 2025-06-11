import { describe, it, expect } from 'vitest';
import * as index from './index';
import { uploadDocument } from './uploadDocument';

describe('documentService index', () => {
  it('re-exports uploadDocument', () => {
    expect(index.uploadDocument).toBe(uploadDocument);
  });
});
