import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CalendarGrid from '../components/CalendarGrid';
import type { AttendanceRecord } from '../components/CalendarGrid';
import type { AttendanceStatus } from '../components/AttendanceCell';
import MonthSelector from '../components/MonthSelector';
import LoadingSpinner from '../components/LoadingSpinner';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  hireDate: string;
}

function getInitialCycle(hireDate: string): {
  year: number;
  month: number;
  firstDay: number;
} {
  const [hireYear, hireMonth, hireDay] = hireDate.split('-').map(Number);

  if (hireDay === 1) {
    return { year: hireYear, month: hireMonth, firstDay: 1 };
  }

  const labelMonth = hireMonth === 12 ? 1 : hireMonth + 1;
  const labelYear  = hireMonth === 12 ? hireYear + 1 : hireYear;

  return { year: labelYear, month: labelMonth, firstDay: hireDay };
}

export default function AttendancePage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [year,     setYear]     = useState<number>(new Date().getFullYear());
  const [month,    setMonth]    = useState<number>(new Date().getMonth() + 1);
  const [firstDay, setFirstDay] = useState<number>(1);
  const [records,  setRecords]  = useState<AttendanceRecord[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [range,    setRange]    = useState({ startDate: '', endDate: '' });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { fetchEmployee(); }, [employeeId]);

  useEffect(() => {
    if (employee) fetchAttendance();
  }, [year, month, employee]);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${employeeId}`);
      const emp: Employee = res.data.data;
      setEmployee(emp);

      const { year: y, month: m, firstDay: fd } = getInitialCycle(emp.hireDate);
      setYear(y);
      setMonth(m);
      setFirstDay(fd);
    } catch {
      navigate('/dashboard');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(
        `/attendance/${employeeId}?year=${year}&month=${month}`
      );
      setRange(res.data.range);
      setRecords(
        res.data.records.map((r: any) => ({ date: r.date, status: r.status }))
      );
    } catch {
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (date: string, status: AttendanceStatus) => {
    if (!status) {
      setRecords(prev => prev.filter(r => r.date !== date));
      return;
    }

    setSaving(true);
    try {
      await api.post('/attendance', {
        employeeId: Number(employeeId),
        date,
        status,
      });

      setRecords(prev => {
        const idx = prev.findIndex(r => r.date === date);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { date, status };
          return updated;
        }
        return [...prev, { date, status }];
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">

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
              {saving && (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-xs text-zinc-500">Saving…</span>
                </div>
              )}
            </div>

            {employee && (
              <p className="text-sm text-zinc-400">
                {employee.firstName} {employee.lastName}
                <span className="ml-2 text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                  {employee.role}
                </span>
                <span className="ml-2 text-xs text-zinc-600">
                  Hired: {employee.hireDate}
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
            firstDay={firstDay}
            onChange={(y, m) => { setYear(y); setMonth(m); }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner size="lg" text="Loading attendance…" />
          </div>
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            firstDayOfMonth={firstDay}
            hireDate={employee?.hireDate ?? ''}
            records={records}
            onMarkAttendance={handleMarkAttendance}
          />
        )}

      </div>
    </div>
  );
}