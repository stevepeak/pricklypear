import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatThreadTimestamp } from './formatTimestamp';

describe('formatThreadTimestamp', () => {
  let mockNow: Date;

  beforeEach(() => {
    // Mock "now" as Jan 15, 2025, 14:30:00 (Wednesday)
    mockNow = new Date('2025-01-15T14:30:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('today', () => {
    it("formats today's date with just time", () => {
      const today = new Date('2025-01-15T10:15:00Z');
      const result = formatThreadTimestamp(today);

      expect(result).toMatch(/^\d{2}:\d{2} (AM|PM)$/i);
      expect(result).not.toContain('Yesterday');
      expect(result).not.toContain(',');
    });

    it('formats current moment correctly', () => {
      const result = formatThreadTimestamp(mockNow);

      expect(result).toMatch(/^\d{2}:\d{2} (AM|PM)$/i);
    });

    it('formats early morning today', () => {
      // Use local date
      const earlyMorning = new Date(2025, 0, 15, 0, 1);
      const result = formatThreadTimestamp(earlyMorning);

      expect(result).toMatch(/^12:01 AM$/i);
    });

    it('formats late night today', () => {
      // Use local date
      const lateNight = new Date(2025, 0, 15, 23, 59);
      const result = formatThreadTimestamp(lateNight);

      expect(result).toMatch(/^11:59 PM$/i);
    });
  });

  describe('yesterday', () => {
    it('formats yesterday\'s date with "Yesterday" prefix', () => {
      // Use local date
      const yesterday = new Date(2025, 0, 14, 10, 15);
      const result = formatThreadTimestamp(yesterday);

      expect(result).toContain('Yesterday');
      expect(result).toMatch(/Yesterday, \d{2}:\d{2} (AM|PM)/i);
    });

    it('formats yesterday at midnight', () => {
      // Use local date
      const yesterdayMidnight = new Date(2025, 0, 14, 0, 0);
      const result = formatThreadTimestamp(yesterdayMidnight);

      expect(result).toContain('Yesterday');
    });

    it('formats yesterday late evening', () => {
      // Use local date
      const yesterdayEvening = new Date(2025, 0, 14, 23, 59);
      const result = formatThreadTimestamp(yesterdayEvening);

      expect(result).toContain('Yesterday');
    });
  });

  describe('this week', () => {
    it('formats dates in current week with day name', () => {
      // Monday of current week (week starts on Monday) - use local time
      const monday = new Date(2025, 0, 13, 10, 0);
      const result = formatThreadTimestamp(monday);

      expect(result).toMatch(/^Mon, \d{2}:\d{2} (AM|PM)$/i);
      expect(result).not.toContain('Yesterday');
    });

    it('formats Tuesday with day abbreviation', () => {
      // Use local date
      const tuesday = new Date(2025, 0, 14, 15, 30);
      const result = formatThreadTimestamp(tuesday);

      // Should show "Yesterday" since mockNow is Wednesday
      expect(result).toContain('Yesterday');
    });

    it('formats earlier in the week', () => {
      // Monday - use local time
      const earlyWeek = new Date(2025, 0, 13, 9, 0);
      const result = formatThreadTimestamp(earlyWeek);

      expect(result).toMatch(/Mon, \d{2}:\d{2} (AM|PM)/i);
    });
  });

  describe('older dates', () => {
    it('formats dates from previous week with full format', () => {
      const lastWeek = new Date('2025-01-08T10:00:00Z');
      const result = formatThreadTimestamp(lastWeek);

      expect(result).toMatch(
        /^[A-Z][a-z]{2} \d{1,2}, [A-Z][a-z]{2} \d{2}:\d{2} (AM|PM)$/i
      );
      expect(result).toContain('Jan');
      expect(result).toContain('8');
    });

    it('formats dates from previous month', () => {
      const lastMonth = new Date('2024-12-25T15:00:00Z');
      const result = formatThreadTimestamp(lastMonth);

      expect(result).toContain('Dec');
      expect(result).toContain('25');
      expect(result).toMatch(/\d{2}:\d{2} (AM|PM)/i);
    });

    it('formats dates from last year', () => {
      const lastYear = new Date('2024-06-15T12:00:00Z');
      const result = formatThreadTimestamp(lastYear);

      expect(result).toContain('Jun');
      expect(result).toContain('15');
    });
  });

  describe('edge cases', () => {
    it('handles date at exact midnight', () => {
      // Use local date
      const midnight = new Date(2025, 0, 15, 0, 0);
      const result = formatThreadTimestamp(midnight);

      // Should be formatted as today
      expect(result).toMatch(/12:00 AM/i);
    });

    it('handles date at end of day', () => {
      // Use local date
      const endOfDay = new Date(2025, 0, 15, 23, 59, 59);
      const result = formatThreadTimestamp(endOfDay);

      expect(result).toMatch(/11:59 PM/i);
    });

    it('handles dates far in the past', () => {
      // Use local date
      const farPast = new Date(2020, 0, 1, 12, 0);
      const result = formatThreadTimestamp(farPast);

      expect(result).toContain('Jan');
      expect(result).toContain('1');
      // Note: year is not included in the format
    });

    it('handles dates in the future', () => {
      // Use local date
      const future = new Date(2025, 11, 31, 23, 59);
      const result = formatThreadTimestamp(future);

      expect(result).toContain('Dec');
      expect(result).toContain('31');
    });
  });

  describe('consistency', () => {
    it('returns consistent format for the same date called multiple times', () => {
      // Use local date
      const date = new Date(2025, 0, 10, 15, 30);

      const result1 = formatThreadTimestamp(date);
      const result2 = formatThreadTimestamp(date);
      const result3 = formatThreadTimestamp(date);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('handles Date objects and maintains immutability', () => {
      // Use local date
      const original = new Date(2025, 0, 10, 15, 30);
      const originalTime = original.getTime();

      formatThreadTimestamp(original);

      // Original date should not be mutated
      expect(original.getTime()).toBe(originalTime);
    });
  });
});
