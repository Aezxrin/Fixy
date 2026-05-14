import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { TechniciansPage } from './pages/TechniciansPage';
import { CallsPage } from './pages/CallsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { FinanceDashboard } from './pages/FinanceDashboard';

import { ReportsPage } from './pages/ReportsPage';
import { MasterDataPage } from './pages/MasterDataPage';
import { ArchivePage } from './pages/ArchivePage';

// --- ШИНЭ: УХААЛАГ НҮҮР ХУУДАС ---
// Хэрэглэгчийн эрхээс хамаарч өөрийнх нь нүүр хуудас руу автоматаар үсэргэнэ
const SmartDashboard = () => {
  const user = useAuthStore((state) => state.user);
  
  // Number() ашигласнаар "2" эсвэл 2 ирсэн ч алдахгүй танина
  if (Number(user?.role_id) === 2) {
    return <Navigate to="/manager/requests" replace />;
  }
  if (Number(user?.role_id) === 3) {
    return <Navigate to="/finance/dashboard" replace />;
  }
  
  // Бусад үед буюу role_id === 1 (Admin) үед админы хянах самбарыг харуулна
  return <DashboardPage />;
};

export default function App() {
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Fixy Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            
            {/* --- ӨӨРЧЛӨГДСӨН: Хуучин DashboardPage байсныг SmartDashboard болгов --- */}
            <Route path="/" element={<SmartDashboard />} />
            
            <Route path="/users" element={<UsersPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/calls" element={<CallsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* МЕНЕЖЕРИЙН ХУУДСУУД */}
            <Route path="/manager/dashboard" element={<Navigate to="/manager/requests" replace />} />
            <Route path="/manager/requests" element={<ManagerDashboard />} />
            <Route path="/manager/complaints" element={<ManagerDashboard />} />
            <Route path="/manager/archive" element={<ManagerDashboard />} />
            <Route path="/manager/profiles" element={<ManagerDashboard />} />

            {/* Санхүүгийн дашборд */}
            <Route path="/finance/dashboard" element={<FinanceDashboard />} />

            {/* Бусад Админ Цэснүүд */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/master-data" element={<MasterDataPage />} />
            <Route path="/archive" element={<ArchivePage />} />
          </Route>
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}