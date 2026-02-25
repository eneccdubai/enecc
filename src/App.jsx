import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PropertiesProvider } from './contexts/PropertiesContext'
import Hero from './components/Hero'
import PropertiesPortfolio from './components/PropertiesPortfolio'
import OwnerContact from './components/OwnerContact'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Login from './components/Login'
import DatabaseSetup from './components/DatabaseSetup'

// Lazy load heavy components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const AllProperties = lazy(() => import('./components/AllProperties'))
const PropertyDetail = lazy(() => import('./components/PropertyDetail'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
  </div>
)

// Admin Route - shows login if not authenticated, redirects if not admin
function AdminRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!currentUser) {
    return <Login />
  }

  if (userRole !== 'admin') {
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
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<HomeRouter />} />
                  <Route path="/contact" element={
                    <>
                      <Contact />
                      <Footer />
                    </>
                  } />
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
                      <AdminRoute>
                        <PropertiesProvider>
                          <AdminDashboard />
                        </PropertiesProvider>
                      </AdminRoute>
                    }
                  />
                  <Route path="/setup" element={<DatabaseSetup />} />
                  {/* Redirect old routes */}
                  <Route path="/login" element={<Navigate to="/admin" replace />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/settings" element={<Navigate to="/" replace />} />
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
