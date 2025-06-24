import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';

// Pages
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import AppsPage from './pages/AppsPage';
import JasperIQPage from './pages/JasperIQPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ProjectEditorPage from './pages/ProjectEditorPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import UserDataDeletionPage from './pages/UserDataDeletionPage';
import FacebookCallbackPage from './pages/auth/FacebookCallbackPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout components
import { DashboardLayout } from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/delete-my-data" element={<UserDataDeletionPage />} />
              
              {/* OAuth callback routes */}
              <Route path="/auth/facebook/callback" element={<FacebookCallbackPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
              
              {/* Protected routes with dashboard layout */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
              </Route>

              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProjectsPage />} />
              </Route>

              <Route 
                path="/apps" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AppsPage />} />
              </Route>

              <Route 
                path="/jasper-iq" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<JasperIQPage />} />
              </Route>

              <Route 
                path="/integrations" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<IntegrationsPage />} />
              </Route>

              {/* Project editor - full screen without sidebar */}
              <Route 
                path="/editor/:projectId" 
                element={
                  <ProtectedRoute>
                    <ProjectEditorPage />
                  </ProtectedRoute>
                } 
              />

              {/* 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="!z-[9999]"
          />
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;