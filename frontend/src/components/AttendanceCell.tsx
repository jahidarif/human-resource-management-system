import { useState } from 'react';

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | null;

interface AttendanceCellProps {
  date: Date;
  status: AttendanceStatus;
  onMark: (date: string, status: AttendanceStatus) => void;
  isLastRow?: boolean;
  showMonth?: boolean;
  disabled?: boolean;
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function AttendanceCell({
  date,
  status,
  onMark,
  isLastRow = false,
  showMonth = false,
  disabled = false,
}: AttendanceCellProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  // Safe local date formatting string (Avoids ISO timezone shift issues)
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const isInteractable = !isWeekend && !disabled;

  const getBgColor = () => {
    if (disabled) return 'bg-zinc-950';
    if (isWeekend) return 'bg-zinc-900';
    switch (status) {
      case 'Present': return 'bg-green-950 border-green-900';
      case 'Absent': return 'bg-red-950 border-red-900';
      case 'Leave': return 'bg-yellow-950 border-yellow-900';
      default: return 'bg-zinc-900 border-zinc-800';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'Present': return 'bg-green-500';
      case 'Absent': return 'bg-red-500';
      case 'Leave': return 'bg-yellow-400';
      default: return null;
    }
  };

  const dot = getStatusDot();

  return (
    <div
      className={`relative h-16 border-b border-r border-zinc-800 p-1.5
        ${getBgColor()}
        ${isInteractable ? 'cursor-pointer' : 'cursor-default'}
      `}
      onMouseEnter={() => isInteractable && setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* month label */}
      {showMonth && !disabled && (
        <div className="text-xs text-blue-400 font-medium leading-none mb-0.5">
          {MONTHS_SHORT[date.getMonth()]}
        </div>
      )}

      <span className={`text-xs font-medium
        ${disabled
          ? 'text-zinc-800'
          : isWeekend ? 'text-zinc-700' : 'text-zinc-300'
        }
      `}>
        {date.getDate()}
      </span>

      {/* before hire date indicator */}
      {disabled && (
        <div className="mt-0.5">
          <span className="text-xs text-zinc-800">—</span>
        </div>
      )}

      {dot && !disabled && (
        <div className="mt-0.5 flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="text-xs text-zinc-500">
            {status?.charAt(0)}
          </span>
        </div>
      )}

      {showMenu && isInteractable && (
        <div
          className={`absolute left-0 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-28
            ${isLastRow ? 'bottom-full mb-1' : 'top-full mt-1'}
          `}
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          {(['Present', 'Absent', 'Leave'] as AttendanceStatus[]).map(s => (
            <button
              key={s as string}
              onClick={(e) => {
                e.stopPropagation();
                onMark(dateStr, s);
                setShowMenu(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition-colors
                ${status === s
                  ? 'text-white font-medium'
                  : 'text-zinc-400'
                }
              `}
            >
              {s === 'Present' && '🟢 '}
              {s === 'Absent' && '🔴 '}
              {s === 'Leave' && '🟡 '}
              {s}
            </button>
          ))}
          <hr className="border-zinc-700 my-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMark(dateStr, null);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-700 transition-colors"
          >
            ✕ Clear
          </button>
        </div>
      )}
    </div>
  );
}