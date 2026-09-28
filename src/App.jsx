import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import EmployeeList from './pages/admin/EmployeeList.jsx';
import DepartmentList from './pages/admin/DepartmentList.jsx';
import AttendanceManagement from './pages/admin/AttendanceManagement.jsx';
import PayrollManagement from './pages/admin/PayrollManagement.jsx';
import SalarySlipView from './pages/admin/SalarySlipView.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';

import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx';
import MyProfile from './pages/employee/MyProfile.jsx';
import MyAttendance from './pages/employee/MyAttendance.jsx';
import MyPayroll from './pages/employee/MyPayroll.jsx';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeeList />} />
              <Route path="/admin/departments" element={<DepartmentList />} />
              <Route path="/admin/attendance" element={<AttendanceManagement />} />
              <Route path="/admin/payroll" element={<PayrollManagement />} />
              <Route path="/admin/payroll/slip/:id" element={<SalarySlipView />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Route>

          {/* Employee Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/profile" element={<MyProfile />} />
              <Route path="/employee/attendance" element={<MyAttendance />} />
              <Route path="/employee/payroll" element={<MyPayroll />} />
              <Route path="/employee/payroll/slip/:id" element={<SalarySlipView />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
