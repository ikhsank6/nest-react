import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import WebsiteLayout from '@/layouts/WebsiteLayout';
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
// CMS Pages (Admin)
import CarouselList from '@/pages/cms/carousel/CarouselList';
import NewsCategoryList from '@/pages/cms/news-category/NewsCategoryList';
import NewsList from '@/pages/cms/news/NewsList';
import AboutUsPage from '@/pages/cms/about-us/AboutUsPage';
// Website Pages (Public)
import HomePage from '@/pages/website/HomePage';
import NewsPage from '@/pages/website/NewsPage';
import NewsDetailPage from '@/pages/website/NewsDetailPage';
import AboutPage from '@/pages/website/AboutPage';
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

function AuthRoute({ children }: { children: React.ReactNode }) {
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
          {/* ===================== */}
          {/* PUBLIC WEBSITE ROUTES */}
          {/* ===================== */}
          <Route path="/" element={<WebsiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:slug" element={<NewsDetailPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>

          {/* =================== */}
          {/* AUTH ROUTES (Login) */}
          {/* =================== */}
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <AuthLayout />
              </AuthRoute>
            }
          >
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
          
          {/* Legacy routes - redirect to new auth routes */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
          <Route path="/reset-password" element={<Navigate to="/auth/reset-password" replace />} />

          {/* Verify email - standalone route (no redirect if authenticated) */}
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* 403 Forbidden */}
          <Route path="/forbidden" element={<Forbidden />} />

          {/* ======================== */}
          {/* PROTECTED ADMIN ROUTES */}
          {/* ======================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Master Data Routes */}
            <Route path="master-data/users" element={<MenuProtectedRoute><UserList /></MenuProtectedRoute>} />
            <Route path="master-data/roles" element={<MenuProtectedRoute><RoleList /></MenuProtectedRoute>} />
            <Route path="master-data/menus" element={<MenuProtectedRoute><MenuList /></MenuProtectedRoute>} />
            
            {/* CMS Routes */}
            <Route path="cms/carousel" element={<MenuProtectedRoute><CarouselList /></MenuProtectedRoute>} />
            <Route path="cms/news-category" element={<MenuProtectedRoute><NewsCategoryList /></MenuProtectedRoute>} />
            <Route path="cms/news" element={<MenuProtectedRoute><NewsList /></MenuProtectedRoute>} />
            <Route path="cms/about-us" element={<MenuProtectedRoute><AboutUsPage /></MenuProtectedRoute>} />
            
            <Route path="notifications" element={<NotificationList />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Legacy dashboard routes - redirect to admin */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/master-data/*" element={<Navigate to="/admin/master-data/users" replace />} />
          <Route path="/cms/*" element={<Navigate to="/admin/cms/carousel" replace />} />
          <Route path="/notifications" element={<Navigate to="/admin/notifications" replace />} />
          <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
