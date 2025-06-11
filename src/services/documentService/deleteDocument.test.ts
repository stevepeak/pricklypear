import { describe, it, expect, vi, beforeEach } from 'vitest';

const selectMock = vi.fn();
const singleMock = vi.fn();
const deleteMock = vi.fn();
const removeMock = vi.fn();
const eqMock = vi.fn();

const builder = {
  select: selectMock,
  delete: deleteMock,
  eq: eqMock,
  single: singleMock,
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => builder),
    storage: { from: vi.fn(() => ({ remove: removeMock })) },
  },
}));

const { deleteDocument } = await import('./deleteDocument');

beforeEach(() => {
  vi.clearAllMocks();
  selectMock.mockReturnValue(builder);
  eqMock.mockReturnValue(builder);
  removeMock.mockResolvedValue({ error: null });
});

describe('deleteDocument', () => {
  it('deletes file and record', async () => {
    singleMock.mockResolvedValue({ data: { file_path: 'path' }, error: null });
    const eqSecond = vi.fn(() => Promise.resolve({ error: null }));
    const eqFirst = vi.fn(() => ({ eq: eqSecond }));
    deleteMock.mockReturnValue({ eq: eqFirst });
    await deleteDocument('d1', 'u1');
    expect(removeMock).toHaveBeenCalledWith(['path']);
    expect(deleteMock).toHaveBeenCalled();
  });

  it('throws on fetch error', async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: 'fail' } });
    await expect(deleteDocument('d1', 'u1')).rejects.toThrow(
      'Failed to fetch document: fail'
    );
  });
});
