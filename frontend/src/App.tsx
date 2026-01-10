import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import Dashboard from '@/pages/dashboard/Dashboard';
import UserList from '@/pages/master-data/users/UserList';
import RoleList from '@/pages/master-data/roles/RoleList';
import MenuList from '@/pages/master-data/menus/MenuList';
import NotificationList from '@/pages/notifications/NotificationList';
import Profile from '@/pages/profile/Profile';
import Forbidden from '@/pages/errors/Forbidden';
// CMS Pages
import CarouselList from '@/pages/cms/carousel/CarouselList';
import NewsCategoryList from '@/pages/cms/news-category/NewsCategoryList';
import NewsList from '@/pages/cms/news/NewsList';
import AboutUsList from '@/pages/cms/about-us/AboutUsList';
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
    <ThemeProvider defaultTheme="light" storageKey="theme">
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
            <Route path="reset-password" element={<ResetPassword />} />
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
            
            {/* Master Data Routes */}
            <Route path="master-data/users" element={<MenuProtectedRoute><UserList /></MenuProtectedRoute>} />
            <Route path="master-data/roles" element={<MenuProtectedRoute><RoleList /></MenuProtectedRoute>} />
            <Route path="master-data/menus" element={<MenuProtectedRoute><MenuList /></MenuProtectedRoute>} />
            
            {/* CMS Routes */}
            <Route path="cms/carousel" element={<MenuProtectedRoute><CarouselList /></MenuProtectedRoute>} />
            <Route path="cms/news-category" element={<MenuProtectedRoute><NewsCategoryList /></MenuProtectedRoute>} />
            <Route path="cms/news" element={<MenuProtectedRoute><NewsList /></MenuProtectedRoute>} />
            <Route path="cms/about-us" element={<MenuProtectedRoute><AboutUsList /></MenuProtectedRoute>} />
            
            <Route path="notifications" element={<NotificationList />} />
            <Route path="profile" element={<Profile />} />
            
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

