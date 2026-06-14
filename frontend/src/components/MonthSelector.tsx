const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthSelector({
  year, month, onChange
}: MonthSelectorProps) {
  const handlePrev = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const handleNext = () => {
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePrev}
        className="w-8 h-8 flex items-center justify-center border border-zinc-700 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
      >
        ‹
      </button>
      <span className="text-sm font-medium text-white min-w-36 text-center">
        {MONTHS[month - 1]} {year}
      </span>
      <button
        onClick={handleNext}
        className="w-8 h-8 flex items-center justify-center border border-zinc-700 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
      >
        ›
      </button>
    </div>
  );
}