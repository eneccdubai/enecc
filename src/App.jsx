import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PropertiesProvider } from './contexts/PropertiesContext'
import { BookingsProvider } from './contexts/BookingsContext'
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
const ClientDashboard = lazy(() => import('./components/ClientDashboard'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const BookingForm = lazy(() => import('./components/BookingForm'))
const Checkout = lazy(() => import('./components/Checkout'))
const PropertiesSearch = lazy(() => import('./components/PropertiesSearch'))
const AllProperties = lazy(() => import('./components/AllProperties'))
const PropertyDetail = lazy(() => import('./components/PropertyDetail'))
const Settings = lazy(() => import('./components/Settings'))
const CalendarExport = lazy(() => import('./components/CalendarExport'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white">
    <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
  </div>
)

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Dashboard Router - shows properties search for all logged-in users
function DashboardRouter() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <PropertiesProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <PropertiesSearch />
      </Suspense>
    </PropertiesProvider>
  )
}

// Home Router - redirects logged-in users to dashboard
function HomeRouter() {
  const { currentUser, loading } = useAuth()
  const [propertyFilters, setPropertyFilters] = React.useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  // If user is logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  const handleFilterChange = (filters) => {
    setPropertyFilters(filters)
  }

  // If user is not logged in, show landing page
  return (
    <PropertiesProvider>
      <Hero onFilterChange={handleFilterChange} />
      <PropertiesPortfolio filters={propertyFilters} />
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
            <div className="min-h-screen bg-cream-50 transition-colors">
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
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/all-properties"
                    element={
                      <ProtectedRoute>
                        <PropertiesProvider>
                          <AllProperties />
                        </PropertiesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/property/:id"
                    element={
                      <ProtectedRoute>
                        <PropertiesProvider>
                          <PropertyDetail />
                        </PropertiesProvider>
                      </ProtectedRoute>
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
                    path="/my-bookings"
                    element={
                      <ProtectedRoute>
                        <BookingsProvider>
                          <ClientDashboard />
                        </BookingsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking"
                    element={
                      <ProtectedRoute>
                        <PropertiesProvider>
                          <BookingsProvider>
                            <BookingForm />
                          </BookingsProvider>
                        </PropertiesProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <BookingsProvider>
                          <Checkout />
                        </BookingsProvider>
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
                  {/* Public route for iCalendar export */}
                  <Route path="/calendar/:token" element={<CalendarExport />} />
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
