import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Import components
import Layout from './components/layout/Layout';
import Homepage from './components/pages/Homepage';
import { Login, Register, ChangePassword } from './components/auth/AuthComponents';
import Dashboard from './components/pages/Dashboard';
import { NotesList, NoteForm, NoteDetail } from './components/notes/NotesComponents';
import Profile from './components/pages/Profile';
// import Members from './components/pages/Members';
// import Subscription from './components/pages/Subscription';

// Import auth actions
import { fetchProfile } from './store/slices/authSlice';
import Members from './components/pages/Members';
import Subscription from './components/pages/Subscription';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Only Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  // Fetch user profile on app start if token exists
  useEffect(() => {
    if (token && isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Notes Routes */}
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotesList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoteForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoteForm isEdit={true} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoteDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Profile Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChangePassword />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/members"
            element={
              <AdminRoute>
                <Layout>
                  <Members />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <AdminRoute>
                <Layout>
                  <Subscription />
                </Layout>
              </AdminRoute>
            }
          />

          {/* Catch all route - redirect to dashboard if authenticated, otherwise home */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;