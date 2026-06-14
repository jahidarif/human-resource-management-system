import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CalendarGrid from '../components/CalendarGrid';
import type { AttendanceRecord } from '../components/CalendarGrid';
import MonthSelector from '../components/MonthSelector';
import type { AttendanceStatus } from '../components/AttendanceCell';

// must match your .env FIRST_DAY_OF_MONTH
const FIRST_DAY_OF_MONTH = 1;

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
}

export default function AttendancePage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [range, setRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  useEffect(() => {
    fetchAttendance();
  }, [year, month, employeeId]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${employeeId}`);
      setEmployee(response.data.data);
    } catch {
      navigate('/dashboard');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/attendance/${employeeId}?year=${year}&month=${month}`
      );
      setRange(response.data.range);
      setRecords(
        response.data.records.map((r: any) => ({
          date: r.date.split('T')[0],
          status: r.status,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (
    date: string,
    status: AttendanceStatus
  ) => {
    if (!status) {
      // clear — remove from local state
      setRecords(prev => prev.filter(r => r.date !== date));
      return;
    }

    try {
      await api.post('/attendance', {
        employeeId: Number(employeeId),
        date,
        status,
      });

      // update local state immediately (no refetch needed)
      setRecords(prev => {
        const existing = prev.findIndex(r => r.date === date);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { date, status };
          return updated;
        }
        return [...prev, { date, status }];
      });
    } catch (err) {
      console.error('Failed to mark attendance');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-zinc-500 hover:text-white transition-colors text-sm"
              >
                ← Back
              </button>
              <h1 className="text-xl font-medium text-white">
                Attendance Calendar
              </h1>
            </div>
            {employee && (
              <p className="text-sm text-zinc-400">
                {employee.firstName} {employee.lastName}
                <span className="ml-2 text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                  {employee.role}
                </span>
              </p>
            )}
            {range.startDate && (
              <p className="text-xs text-zinc-600 mt-1">
                Cycle: {range.startDate} → {range.endDate}
              </p>
            )}
          </div>

          <MonthSelector
            year={year}
            month={month}
            onChange={(y, m) => {
              setYear(y);
              setMonth(m);
            }}
          />
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-zinc-500 text-sm">
              Loading attendance...
            </p>
          </div>
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            firstDayOfMonth={FIRST_DAY_OF_MONTH}
            records={records}
            onMarkAttendance={handleMarkAttendance}
          />
        )}

      </div>
    </div>
  );
}