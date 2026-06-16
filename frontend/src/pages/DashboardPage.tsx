import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  hireDate: string;
  salary: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data);
    } catch {
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(e => e.id !== id));
      setDeleteId(null);
    } catch {
      setError('Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-white">
              Employees
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {loading
                ? 'Loading...'
                : `${employees.length} total employees`
              }
            </p>
          </div>
          <button
            onClick={() => navigate('/employees/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Employee
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-80 px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchEmployees}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner size="lg" text="Loading employees..." />
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Hire Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Salary</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-zinc-600 text-sm">
                      {search
                        ? 'No employees match your search'
                        : 'No employees found'
                      }
                    </td>
                  </tr>
                ) : (
                  filtered.map(emp => (
                    <tr key={emp.id} className="hover:bg-zinc-800 transition-colors">
                      <td className="px-4 py-3 text-zinc-500 text-xs">#{emp.id}</td>
                      <td className="px-4 py-3 font-medium text-white">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{emp.email}</td>
                      <td className="px-4 py-3">
                        <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md">
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{emp.hireDate}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        ${emp.salary.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/employees/${emp.id}/edit`)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/attendance/${emp.id}`)}
                            className="text-xs text-green-400 hover:text-green-300 transition-colors"
                          >
                            Attendance
                          </button>
                          <button
                            onClick={() => setDeleteId(emp.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-base font-medium text-white mb-2">
              Delete Employee
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure? This will permanently delete the
              employee and all their attendance records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}