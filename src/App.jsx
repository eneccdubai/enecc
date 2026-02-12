import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PropertiesProvider } from './contexts/PropertiesContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PropertiesPortfolio from './components/PropertiesPortfolio'
import OwnerContact from './components/OwnerContact'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'
import DatabaseSetup from './components/DatabaseSetup'

// Lazy load heavy components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const AllProperties = lazy(() => import('./components/AllProperties'))
const PropertyDetail = lazy(() => import('./components/PropertyDetail'))
const Settings = lazy(() => import('./components/Settings'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
  </div>
)

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

// Home Router - always shows landing page
function HomeRouter() {
  return (
    <PropertiesProvider>
      <Hero />
      <PropertiesPortfolio />
      <OwnerContact />
      <Footer />
    </PropertiesProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-white transition-colors">
              <Navbar />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<HomeRouter />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/contact" element={
                    <>
                      <Contact />
                      <Footer />
                    </>
                  } />
                  <Route
                    path="/dashboard"
                    element={<Navigate to="/" replace />}
                  />
                  <Route
                    path="/all-properties"
                    element={
                      <PropertiesProvider>
                        <AllProperties />
                      </PropertiesProvider>
                    }
                  />
                  <Route
                    path="/property/:id"
                    element={
                      <PropertiesProvider>
                        <PropertyDetail />
                      </PropertiesProvider>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <PropertiesProvider>
                          <AdminDashboard />
                        </PropertiesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/setup" element={<DatabaseSetup />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
