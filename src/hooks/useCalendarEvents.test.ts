import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

type CalendarEventRow = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_by: string;
  thread_id: string | null;
  location: string | null;
};

/* ----------------------------- Helpers ----------------------------- */
function createEvent(id: number): CalendarEventRow {
  return {
    id: `event-${id}`,
    title: `Event ${id}`,
    description: null,
    start_time: new Date(2025, 0, id).toISOString(),
    end_time: new Date(2025, 0, id, 1).toISOString(),
    created_by: 'user-1',
    thread_id: null,
    location: null,
  };
}

/**
 * Builds the required mocks for a single test-run and returns the freshly
 * imported `useCalendarEvents` hook alongside all relevant spies.
 */
async function loadHook() {
  /* ------------------------- Supabase client ------------------------- */
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockInsert = vi.fn();
  const mockUpsert = vi.fn();

  // Provide sensible defaults that individual tests can still override
  mockSelect.mockImplementation(() => ({ order: mockOrder }));
  mockOrder.mockResolvedValue({ data: [], error: null });

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    order: mockOrder,
    insert: mockInsert,
    upsert: mockUpsert,
  }));

  const supabaseMock = { from: mockFrom };

  vi.doMock('@/integrations/supabase/client', () => ({
    supabase: supabaseMock,
  }));

  /* ----------------------- GlobalMessages mock ---------------------- */
  // Always return a noop unsubscribe function so the hook's cleanup never crashes
  const registerCalendarEventCallback = vi
    .fn()
    .mockImplementation(() => () => {});

  vi.doMock('@/contexts/GlobalMessagesContext', () => ({
    useGlobalMessages: () => ({
      registerCalendarEventCallback,
    }),
  }));

  /* ---------------------- requireCurrentUser mock -------------------- */
  vi.doMock('@/utils/authCache', () => ({
    requireCurrentUser: vi.fn(async () => ({
      id: 'user-1',
    })),
  }));

  /* -------------------------- Import hook --------------------------- */
  const { useCalendarEvents } = await import('./useCalendarEvents');

  return {
    // hook
    useCalendarEvents,

    // supabase
    supabaseMock,
    mockSelect,
    mockOrder,
    mockInsert,
    mockUpsert,

    // globals
    registerCalendarEventCallback,
  };
}

describe('useCalendarEvents', () => {
  beforeEach(() => {
    // Completely reset module graph and mocks between tests
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches events on mount and updates state', async () => {
    const { useCalendarEvents, supabaseMock, mockSelect, mockOrder } =
      await loadHook();

    // Arrange Supabase query
    mockSelect.mockReturnValueOnce({ order: mockOrder });
    mockOrder.mockResolvedValueOnce({
      data: [createEvent(1), createEvent(2)],
      error: null,
    });

    const { result } = renderHook(() => useCalendarEvents());

    // Initial render should be loading
    expect(result.current.isLoading).toBe(true);

    // Wait for async work to finish
    await act(async () => {});

    expect(supabaseMock.from).toHaveBeenCalledWith('calendar_events');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('start_time', { ascending: true });

    expect(result.current.events).toEqual([createEvent(1), createEvent(2)]);
    expect(result.current.isLoading).toBe(false);
  });

  it('reacts to real-time calendar event updates', async () => {
    const {
      useCalendarEvents,
      mockSelect,
      mockOrder,
      registerCalendarEventCallback,
    } = await loadHook();

    mockSelect.mockReturnValueOnce({ order: mockOrder });
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    // Capture registration callback
    let realtimeCb: (e: CalendarEventRow) => void = () => {};
    registerCalendarEventCallback.mockImplementation((fn) => {
      realtimeCb = fn;
      return () => {}; // unsubscribe noop
    });

    const { result } = renderHook(() => useCalendarEvents());

    await act(async () => {});

    // Add new event
    const newEvt = createEvent(3);
    act(() => realtimeCb(newEvt));
    expect(result.current.events).toEqual([newEvt]);

    // Update existing event
    const updatedEvt = { ...newEvt, title: 'Updated' };
    act(() => realtimeCb(updatedEvt));
    expect(result.current.events).toEqual([updatedEvt]);
  });

  it('createEvent inserts a new event and returns it', async () => {
    const { useCalendarEvents, mockInsert } = await loadHook();

    const inserted = createEvent(4);

    mockInsert.mockReturnValueOnce({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: inserted,
            error: null,
          }),
      }),
    });

    const { result } = renderHook(() => useCalendarEvents());

    const start = new Date(inserted.start_time);
    const end = new Date(inserted.end_time);

    let returned: CalendarEventRow | null = null;
    await act(async () => {
      returned = await result.current.createEvent(
        inserted.title,
        inserted.description,
        start,
        end
      );
    });

    expect(mockInsert).toHaveBeenCalledWith({
      title: inserted.title,
      description: inserted.description,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      created_by: 'user-1',
      thread_id: null,
      location: null,
    });
    expect(returned).toEqual(inserted);
  });

  it('updateParticipantStatus upserts participant and returns row', async () => {
    const { useCalendarEvents, mockUpsert } = await loadHook();

    const participantRow = {
      id: 'row-1',
      event_id: 'event-123',
      user_id: 'user-1',
      status: 'accepted',
    };

    mockUpsert.mockReturnValueOnce({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: participantRow,
            error: null,
          }),
      }),
    });

    const { result } = renderHook(() => useCalendarEvents());

    let resp: typeof participantRow | null = null;
    await act(async () => {
      resp = await result.current.updateParticipantStatus(
        participantRow.event_id,
        'accepted'
      );
    });

    expect(mockUpsert).toHaveBeenCalledWith({
      event_id: participantRow.event_id,
      user_id: 'user-1',
      status: 'accepted',
    });
    expect(resp).toEqual(participantRow);
  });
});
