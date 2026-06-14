import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import AttendancePage from './pages/AttendancePage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* public route */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* root redirects to login */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/employees/new"
            element={
              <PrivateRoute>
                <EmployeeFormPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/employees/:id/edit"
            element={
              <PrivateRoute>
                <EmployeeFormPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/attendance/:employeeId"
            element={
              <PrivateRoute>
                <AttendancePage />
              </PrivateRoute>
            }
          />

          {/* catch all unknown routes → login */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;