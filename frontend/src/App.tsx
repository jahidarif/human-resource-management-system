import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import AttendancePage from './pages/AttendancePage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={<LoginPage />}
            />
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <DashboardPage />
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />
            <Route
              path="/employees/new"
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <EmployeeFormPage />
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />
            <Route
              path="/employees/:id/edit"
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <EmployeeFormPage />
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />
            <Route
              path="/attendance/:employeeId"
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <AttendancePage />
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />
            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;