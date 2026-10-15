import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreatorDashboardPage } from './pages/CreatorDashboardPage';
import { PostEditorPage } from './pages/PostEditorPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <Routes>
                  {/* Public Dispatches */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/posts/:slug" element={<PostDetailPage />} />

                  {/* Auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Authenticated User Profile */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Creator Studio & Editor */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['creator', 'admin']}>
                        <CreatorDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/editor"
                    element={
                      <ProtectedRoute allowedRoles={['creator', 'admin']}>
                        <PostEditorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/editor/:id"
                    element={
                      <ProtectedRoute allowedRoles={['creator', 'admin']}>
                        <PostEditorPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Console */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
