import AttendanceCell from './AttendanceCell';
import type { AttendanceStatus } from './AttendanceCell';

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
}

interface CalendarGridProps {
  year: number;
  month: number;
  firstDayOfMonth: number;
  records: AttendanceRecord[];
  onMarkAttendance: (date: string, status: AttendanceStatus) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCustomMonthDates(
  year: number,
  month: number,
  firstDay: number
): Date[] {
  let startDate: Date;
  let endDate: Date;

  if (firstDay === 1) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
  } else {
    const startMonth = month === 1 ? 12 : month - 1;
    const startYear = month === 1 ? year - 1 : year;
    startDate = new Date(startYear, startMonth - 1, firstDay);
    endDate = new Date(year, month - 1, firstDay - 1);
  }

  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function CalendarGrid({
  year,
  month,
  firstDayOfMonth,
  records,
  onMarkAttendance,
}: CalendarGridProps) {
  const dates = getCustomMonthDates(year, month, firstDayOfMonth);

  // map date string to status for quick lookup
  const statusMap: Record<string, AttendanceStatus> = {};
  records.forEach(r => {
    if (r.date) {
      statusMap[r.date.split('T')[0]] = r.status;
    }
  });

  // calculate summary counts
  const summary = records.reduce(
    (acc, r) => {
      if (r.status === 'Present') acc.present++;
      else if (r.status === 'Absent') acc.absent++;
      else if (r.status === 'Leave') acc.leave++;
      return acc;
    },
    { present: 0, absent: 0, leave: 0 }
  );

  const weekends = dates.filter(
    d => d.getDay() === 0 || d.getDay() === 6
  ).length;

  // pad start with empty cells based on first day of week
  const firstDayOfWeek = dates[0]?.getDay() || 0;
  const cells: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...dates,
  ];

  // pad end to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  // calculate total rows to detect last rows
  const totalRows = Math.ceil(cells.length / 7);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

      {/* day headers */}
      <div className="grid grid-cols-7 border-b border-zinc-800">
        {DAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* calendar cells */}
      <div className="grid grid-cols-7">
        {cells.map((date, index) => {
          const rowIndex = Math.floor(index / 7);
          // last 2 rows open menu upward
          const isLastRow = rowIndex >= totalRows - 2;

          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="h-16 border-b border-r border-zinc-800 bg-black"
              />
            );
          }

          const dateStr = date.toISOString().split('T')[0];
          const status = statusMap[dateStr] || null;

          return (
            <AttendanceCell
              key={dateStr}
              date={date}
              status={status}
              onMark={onMarkAttendance}
              isLastRow={isLastRow}
            />
          );
        })}
      </div>

      {/* legend + summary */}
      <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-600">Legend:</span>
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Present
          </span>
          <span className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Absent
          </span>
          <span className="flex items-center gap-1.5 text-xs text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            Leave
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-600">Summary:</span>
          <span className="text-xs text-green-400">
            Present: {summary.present}
          </span>
          <span className="text-xs text-red-400">
            Absent: {summary.absent}
          </span>
          <span className="text-xs text-yellow-400">
            Leave: {summary.leave}
          </span>
          <span className="text-xs text-zinc-600">
            Weekends: {weekends}
          </span>
        </div>
      </div>

    </div>
  );
}