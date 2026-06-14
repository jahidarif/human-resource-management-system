import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined, general: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', form);
      login(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Invalid email or password'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">HRM Portal</div>
            <div className="text-xs text-gray-400">Human Resource Management</div>
          </div>
        </div>

        <h1 className="text-xl font-medium text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Sign in to your admin account to continue
        </p>

        <hr className="border-gray-100 mb-5" />

        {/* General Error */}
        {errors.general && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@hrm.com"
                className={`w-full px-3 py-2.5 pr-9 text-sm border rounded-lg outline-none transition-all
                  ${errors.email
                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 pr-9 text-sm border rounded-lg outline-none transition-all
                  ${errors.password
                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Only authorized HR personnel can access this portal.
        </p>

      </div>
    </div>
  );
}