import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

interface EmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  hireDate: string;
  salary: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  hireDate?: string;
  salary?: string;
  general?: string;
}

const ROLES = [
  'Software Engineer',
  'Product Manager',
  'UI/UX Designer',
  'HR Manager',
  'Accountant',
  'Data Analyst',
  'DevOps Engineer',
  'Marketing Specialist',
  'Sales Executive',
  'Operations Manager',
];

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState<EmployeeForm>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    hireDate: '',
    salary: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      const emp = response.data.data;
      setForm({
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        role: emp.role,
        hireDate: emp.hireDate,
        salary: String(emp.salary),
      });
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.firstName.trim())
      newErrors.firstName = 'First name is required';
    else if (form.firstName.length < 2)
      newErrors.firstName = 'First name must be at least 2 characters';

    if (!form.lastName.trim())
      newErrors.lastName = 'Last name is required';
    else if (form.lastName.length < 2)
      newErrors.lastName = 'Last name must be at least 2 characters';

    if (!form.email.trim())
      newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email))
      newErrors.email = 'Invalid email address';

    if (!form.role.trim())
      newErrors.role = 'Role is required';

    if (!form.hireDate)
      newErrors.hireDate = 'Hire date is required';

    if (!form.salary)
      newErrors.salary = 'Salary is required';
    else if (isNaN(Number(form.salary)) || Number(form.salary) < 0)
      newErrors.salary = 'Salary must be a positive number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined, general: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role,
      hireDate: form.hireDate,
      salary: Number(form.salary),
    };

    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" text="Loading employee..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-medium text-white">
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

          {errors.general && (
            <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded-lg">
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none
                    bg-zinc-800 text-white placeholder-zinc-600
                    ${errors.firstName
                      ? 'border border-red-500'
                      : 'border border-zinc-700 focus:border-blue-500'
                    }`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none
                    bg-zinc-800 text-white placeholder-zinc-600
                    ${errors.lastName
                      ? 'border border-red-500'
                      : 'border border-zinc-700 focus:border-blue-500'
                    }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
                className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none
                  bg-zinc-800 text-white placeholder-zinc-600
                  ${errors.email
                    ? 'border border-red-500'
                    : 'border border-zinc-700 focus:border-blue-500'
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none
                  bg-zinc-800 text-white
                  ${errors.role
                    ? 'border border-red-500'
                    : 'border border-zinc-700 focus:border-blue-500'
                  }`}
              >
                <option value="">Select a role</option>
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.role && (
                <p className="text-xs text-red-400 mt-1">{errors.role}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Hire Date
                </label>
                <input
                  type="date"
                  name="hireDate"
                  value={form.hireDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none
                    bg-zinc-800 text-white
                    ${errors.hireDate
                      ? 'border border-red-500'
                      : 'border border-zinc-700 focus:border-blue-500'
                    }`}
                />
                {errors.hireDate && (
                  <p className="text-xs text-red-400 mt-1">{errors.hireDate}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Salary ($)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                  className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none
                    bg-zinc-800 text-white placeholder-zinc-600
                    ${errors.salary
                      ? 'border border-red-500'
                      : 'border border-zinc-700 focus:border-blue-500'
                    }`}
                />
                {errors.salary && (
                  <p className="text-xs text-red-400 mt-1">{errors.salary}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-4 py-2.5 text-sm border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Save Changes' : 'Add Employee'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}