import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import Dashboard from '@/pages/dashboard/Dashboard';
import UserList from '@/pages/users/UserList';
import RoleList from '@/pages/roles/RoleList';
import MenuList from '@/pages/menus/MenuList';
import Forbidden from '@/pages/errors/Forbidden';
import { useAuthStore } from '@/stores/auth.store';
import { ThemeProvider } from '@/components/theme-provider';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return null; // Or a loading spinner
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Route that checks menu access
function MenuProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hasMenuAccess = useAuthStore((state) => state.hasMenuAccess);
  
  // Check if user has access to current path
  if (!hasMenuAccess(location.pathname)) {
    return <Forbidden />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return null;
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="system"
        />
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <AuthLayout />
              </PublicRoute>
            }
          >
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Verify email - standalone route (no redirect if authenticated) */}
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* 403 Forbidden */}
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<MenuProtectedRoute><UserList /></MenuProtectedRoute>} />
            <Route path="roles" element={<MenuProtectedRoute><RoleList /></MenuProtectedRoute>} />
            <Route path="menus" element={<MenuProtectedRoute><MenuList /></MenuProtectedRoute>} />
            <Route path="menu-access" element={<Navigate to="/roles" replace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
