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
  hireDate: string;
  records: AttendanceRecord[];
  onMarkAttendance: (date: string, status: AttendanceStatus) => void;
}

const DAYS        = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getCycleDates(year: number, month: number, firstDay: number): Date[] {
  let startDate: Date;
  let endDate: Date;

  if (firstDay === 1) {
    startDate = new Date(year, month - 1, 1);
    endDate   = new Date(year, month, 0);
  } else {
    const startMonth = month === 1 ? 12 : month - 1;
    const startYear  = month === 1 ? year - 1 : year;
    startDate = new Date(startYear, startMonth - 1, firstDay);
    endDate   = new Date(year, month - 1, firstDay - 1);
  }

  const dates: Date[] = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarGrid({
  year,
  month,
  firstDayOfMonth,
  hireDate,
  records,
  onMarkAttendance,
}: CalendarGridProps) {
  const dates       = getCycleDates(year, month, firstDayOfMonth);
  const hireDateObj = new Date(hireDate + 'T00:00:00');

  const lastDate = dates[dates.length - 1];
  if (hireDate && lastDate && hireDateObj > lastDate) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
        <p className="text-zinc-500 text-sm">Employee was not hired during this period</p>
        <p className="text-zinc-700 text-xs mt-1">Hire date: {hireDate}</p>
      </div>
    );
  }

  const statusMap: Record<string, AttendanceStatus> = {};
  records.forEach(r => {
    if (r.date) statusMap[r.date.split('T')[0]] = r.status;
  });

  const summary = { present: 0, absent: 0, leave: 0 };
  records.forEach(r => {
    const d = new Date(r.date + 'T00:00:00');
    if (d < hireDateObj) return;
    if (r.status === 'Present') summary.present++;
    else if (r.status === 'Absent') summary.absent++;
    else if (r.status === 'Leave')  summary.leave++;
  });

  const weekends = dates.filter(d => {
    const cmp = new Date(d); cmp.setHours(0, 0, 0, 0);
    return (d.getDay() === 0 || d.getDay() === 6) && cmp >= hireDateObj;
  }).length;

  const firstDayOfWeek = dates[0]?.getDay() ?? 0;
  const cells: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...dates,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const totalRows      = Math.ceil(cells.length / 7);
  const cycleStartDate = dates[0];

  type GridRow = {
    rowIndex: number;
    rowCells: (Date | null)[];
    banner?: string;
  };

  const rows: GridRow[] = [];
  for (let r = 0; r < totalRows; r++) {
    const rowCells = cells.slice(r * 7, r * 7 + 7);
    let banner: string | undefined;

    for (const cell of rowCells) {
      if (
        cell &&
        cell.getDate() === 1 &&
        toDateStr(cell) !== toDateStr(cycleStartDate) // skip if it's the cycle's own start
      ) {
        banner = `${MONTHS_FULL[cell.getMonth()]} ${cell.getFullYear()}`;
        break;
      }
    }

    rows.push({ rowIndex: r, rowCells, banner });
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

      {/* Banner for the START month of a cross-month cycle */}
      {firstDayOfMonth > 1 && (
        <div className="bg-zinc-800/60 border-b border-zinc-700/60 px-4 py-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            {MONTHS_FULL[cycleStartDate.getMonth()]} {cycleStartDate.getFullYear()}
          </span>
          <div className="flex-1 h-px bg-zinc-700/50" />
        </div>
      )}

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-zinc-800">
        {DAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-zinc-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Rows */}
      {rows.map(({ rowIndex, rowCells, banner }) => (
        <div key={rowIndex}>

          {/* Mid-grid month-change banner */}
          {banner && (
            <div className="bg-zinc-800/60 border-y border-zinc-700/40 px-4 py-1.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
                {banner}
              </span>
              <div className="flex-1 h-px bg-zinc-700/50" />
            </div>
          )}

          <div className="grid grid-cols-7">
            {rowCells.map((date, colIndex) => {
              const cellIndex = rowIndex * 7 + colIndex;
              const isLastRow = rowIndex >= totalRows - 2;

              if (!date) {
                return (
                  <div
                    key={`empty-${cellIndex}`}
                    className="h-16 border-b border-r border-zinc-800 bg-black"
                  />
                );
              }

              const dateStr = toDateStr(date);
              const status  = statusMap[dateStr] ?? null;

              const cmp = new Date(date); cmp.setHours(0, 0, 0, 0);
              const isBeforeHire = hireDate ? cmp < hireDateObj : false;

              return (
                <AttendanceCell
                  key={dateStr}
                  date={date}
                  status={status}
                  onMark={onMarkAttendance}
                  isLastRow={isLastRow}
                  showMonth={false}
                  disabled={isBeforeHire}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend + Summary */}
      <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-600">Legend:</span>
          {[
            { label: 'Present',     dot: 'bg-green-500',  color: 'text-green-400'  },
            { label: 'Absent',      dot: 'bg-red-500',    color: 'text-red-400'    },
            { label: 'Leave',       dot: 'bg-yellow-400', color: 'text-yellow-400' },
            { label: 'Before hire', dot: 'bg-zinc-700',   color: 'text-zinc-600'   },
          ].map(({ label, dot, color }) => (
            <span key={label} className={`flex items-center gap-1.5 text-xs ${color}`}>
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              {label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-600">Summary:</span>
          <span className="text-xs text-green-400">Present: {summary.present}</span>
          <span className="text-xs text-red-400">Absent: {summary.absent}</span>
          <span className="text-xs text-yellow-400">Leave: {summary.leave}</span>
          <span className="text-xs text-zinc-600">Weekends: {weekends}</span>
        </div>
      </div>
    </div>
  );
}