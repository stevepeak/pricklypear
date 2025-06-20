import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { useCalendarEvents } from './useCalendarEvents';

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

/* ------------------------------------------------------------------ */
/*                              Mocks                                 */
/* ------------------------------------------------------------------ */

const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();
const mockUpsert = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  order: mockOrder,
  insert: mockInsert,
  upsert: mockUpsert,
}));

const supabaseMock = {
  from: mockFrom,
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: supabaseMock,
}));

/* ----------------------- GlobalMessages mock ---------------------- */
const registerCalendarEventCallback = vi.fn();

vi.mock('@/contexts/GlobalMessagesContext', () => ({
  useGlobalMessages: () => ({
    registerCalendarEventCallback,
  }),
}));

/* ---------------------- requireCurrentUser mock -------------------- */
vi.mock('@/utils/authCache', () => ({
  requireCurrentUser: vi.fn(async () => ({
    id: 'user-1',
  })),
}));

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

describe('useCalendarEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches events on mount and updates state', async () => {
    // arrange supabase query
    mockSelect.mockReturnValueOnce({
      order: mockOrder,
    });
    mockOrder.mockResolvedValueOnce({
      data: [createEvent(1), createEvent(2)],
      error: null,
    });

    const { result } = renderHook(() => useCalendarEvents());

    // first render => loading should be true
    expect(result.current.isLoading).toBe(true);

    // wait for the hook to finish async work
    await act(async () => {});

    expect(supabaseMock.from).toHaveBeenCalledWith('calendar_events');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('start_time', { ascending: true });

    expect(result.current.events).toEqual([createEvent(1), createEvent(2)]);
    expect(result.current.isLoading).toBe(false);
  });

  it('reacts to real-time calendar event updates', async () => {
    mockSelect.mockReturnValueOnce({
      order: mockOrder,
    });
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    let callback: (evt: CalendarEventRow) => void = () => {};
    registerCalendarEventCallback.mockImplementation((fn: typeof callback) => {
      callback = fn;
      return () => {
        // noop unsubscribe
      };
    });

    const { result } = renderHook(() => useCalendarEvents());

    await act(async () => {});

    // add new event
    const newEvt = createEvent(3);
    act(() => {
      callback(newEvt);
    });

    expect(result.current.events).toEqual([newEvt]);

    // update existing event
    const updated = { ...newEvt, title: 'Updated' };
    act(() => {
      callback(updated);
    });

    expect(result.current.events).toEqual([updated]);
  });

  it('createEvent inserts a new event and returns it', async () => {
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
