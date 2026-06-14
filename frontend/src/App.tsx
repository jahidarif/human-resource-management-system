import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page = Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root redirects to login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Protected routes go here later */}
          {/* <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;