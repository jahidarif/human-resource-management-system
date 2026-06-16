import {
  getCustomMonthRange,
  getCycleMonthForHireDate,
} from '../src/services/attendanceService';

describe('Calendar date boundary algorithm (unit tests)', () => {

  describe('getCustomMonthRange — standard month (FIRST_DAY=1)', () => {
    it('returns full calendar month for a 31-day month', () => {
      const result = getCustomMonthRange(2026, 7, 1);
      expect(result).toEqual({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
      });
    });

    it('returns full calendar month for February (28 days, non-leap)', () => {
      const result = getCustomMonthRange(2026, 2, 1);
      expect(result).toEqual({
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });
    });

    it('returns 29 days for February in a leap year', () => {
      const result = getCustomMonthRange(2028, 2, 1);
      expect(result).toEqual({
        startDate: '2028-02-01',
        endDate: '2028-02-29',
      });
    });
  });

  describe('getCustomMonthRange — custom cycle (variable FIRST_DAY)', () => {
    it('matches the exact example from requirements: FIRST_DAY=21, October → Sep 21 to Oct 20', () => {
      const result = getCustomMonthRange(2026, 10, 21);
      expect(result).toEqual({
        startDate: '2026-09-21',
        endDate: '2026-10-20',
      });
    });

    it('handles FIRST_DAY=25 boundary correctly across months', () => {
      const result = getCustomMonthRange(2026, 8, 25);
      expect(result).toEqual({
        startDate: '2026-07-25',
        endDate: '2026-08-24',
      });
    });

    it('handles year rollover when viewing January with custom start day', () => {
      const result = getCustomMonthRange(2026, 1, 21);
      expect(result).toEqual({
        startDate: '2025-12-21',
        endDate: '2026-01-20',
      });
    });

    it('handles FIRST_DAY=26 producing a 1-day overlap correctly', () => {
      const result = getCustomMonthRange(2026, 9, 26);
      expect(result).toEqual({
        startDate: '2026-08-26',
        endDate: '2026-09-25',
      });
    });
  });

  describe('getCycleMonthForHireDate — hire date cycle assignment', () => {
    it('places hire date on the cycle start day into the NEXT month cycle', () => {
      // requirement example: hired July 26, FIRST_DAY=26
      // → belongs to "August" cycle (July 26 - August 25)
      const result = getCycleMonthForHireDate('2026-07-26', 26);
      expect(result).toEqual({ year: 2026, month: 8 });
    });

    it('places hire date before the cycle start day into the CURRENT month cycle', () => {
      // hired July 10, FIRST_DAY=26 → belongs to "July" cycle (June 26 - July 25)
      const result = getCycleMonthForHireDate('2026-07-10', 26);
      expect(result).toEqual({ year: 2026, month: 7 });
    });

    it('handles December → January year rollover for cycle assignment', () => {
      // hired Dec 26, FIRST_DAY=26 → belongs to "January" cycle next year
      const result = getCycleMonthForHireDate('2026-12-26', 26);
      expect(result).toEqual({ year: 2027, month: 1 });
    });

    it('returns hire month directly when FIRST_DAY=1 (standard calendar)', () => {
      const result = getCycleMonthForHireDate('2026-07-15', 1);
      expect(result).toEqual({ year: 2026, month: 7 });
    });
  });
});