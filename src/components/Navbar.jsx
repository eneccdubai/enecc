import React, { useState, useEffect, useRef } from 'react'
import { Menu, X, Globe, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false)
  const { language, toggleLanguage, t } = useLanguage()
  const { currentUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú de perfil al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigation = (path) => {
    navigate(path)
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
    setIsMobileProfileOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      setIsMobileMenuOpen(false)
      setIsProfileMenuOpen(false)
      setIsMobileProfileOpen(false)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0]
    }
    return 'Usuario'
  }

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigation('/')}
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/enecc-logo.png"
                alt="ENECC"
                className="h-8 md:h-10"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <span className="text-3xl md:text-4xl font-display tracking-tight text-stone-900" style={{ display: 'none', fontWeight: 700 }}>
                ENECC
              </span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('/')}
              className="text-stone-700 hover:text-stone-900 transition-colors font-light text-sm tracking-wide"
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => handleNavigation('/all-properties')}
              className="text-stone-700 hover:text-stone-900 transition-colors font-light text-sm tracking-wide"
            >
              {t.nav.properties}
            </button>
            <button
              onClick={() => handleNavigation('/contact')}
              className="text-stone-700 hover:text-stone-900 transition-colors font-light text-sm tracking-wide"
            >
              {t.nav.contact}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-1.5 border border-stone-300 hover:border-stone-900 text-stone-700 hover:text-stone-900 transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium tracking-wider">{language === 'es' ? 'ES' : 'EN'}</span>
            </button>

            {/* Admin Menu (only visible when logged in as admin) */}
            {currentUser && isAdmin && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 border border-stone-300 hover:border-stone-900 text-stone-700 hover:text-stone-900 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-light">{getUserDisplayName()}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 shadow-lg">
                    <div className="px-4 py-3 border-b border-stone-200">
                      <p className="text-sm font-light text-stone-900 truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-stone-500 truncate">{currentUser?.email}</p>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => handleNavigation('/admin')}
                        className="w-full text-left px-4 py-2 text-sm font-light text-stone-700 hover:bg-stone-50 transition-colors flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{language === 'es' ? 'Panel Admin' : 'Admin Panel'}</span>
                      </button>
                    </div>

                    <div className="border-t border-stone-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-light text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{language === 'es' ? 'Cerrar Sesión' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Language Toggle Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-2.5 py-1 border border-stone-300 hover:border-stone-900 text-stone-700 hover:text-stone-900 transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-xs font-medium tracking-wider">{language === 'es' ? 'ES' : 'EN'}</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-stone-700 hover:text-stone-900 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200/50">
          <div className="px-4 pt-3 pb-4 space-y-2">
            {currentUser ? (
              <>
                {/* Menu móvil para usuarios logueados */}
                <button
                  onClick={() => handleNavigation('/')}
                  className="block w-full text-left px-4 py-3 text-stone-700 hover:text-stone-900 transition-colors font-light"
                >
                  {t.nav.home}
                </button>
                <button
                  onClick={() => handleNavigation('/all-properties')}
                  className="block w-full text-left px-4 py-3 text-stone-700 hover:text-stone-900 transition-colors font-light"
                >
                  {t.nav.properties}
                </button>
                <button
                  onClick={() => handleNavigation('/contact')}
                  className="block w-full text-left px-4 py-3 text-stone-700 hover:text-stone-900 transition-colors font-light"
                >
                  {t.nav.contact}
                </button>

                {/* Botón de Perfil expandible */}
                <div className="border-t border-stone-200/50 mt-2 pt-2">
                  <button
                    onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 text-stone-700 hover:text-stone-900 transition-colors font-light"
                  >
                    <div className="flex items-center space-x-2">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-6 h-6 rounded-full object-cover border border-stone-300"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>{language === 'es' ? 'Mi Perfil' : 'My Profile'}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMobileProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Opciones del perfil expandidas */}
                  {isMobileProfileOpen && (
                    <div className="bg-stone-50 py-2 space-y-1">
                      <div className="px-4 py-2 border-b border-stone-200 flex items-center space-x-2">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover border border-stone-300"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-light text-stone-900 truncate">{getUserDisplayName()}</p>
                          <p className="text-xs text-stone-500 truncate">{currentUser?.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleNavigation('/admin')}
                        className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors font-light flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{language === 'es' ? 'Panel Admin' : 'Admin Panel'}</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-light flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{language === 'es' ? 'Cerrar Sesión' : 'Logout'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Menu móvil para visitantes */}
                <button
                  onClick={() => handleNavigation('/')}
                  className="block w-full text-left px-4 py-3 text-stone-700 hover:text-stone-900 transition-colors font-light"
                >
                  {t.nav.home}
                </button>
                <button
                  onClick={() => handleNavigation('/all-properties')}
                  className="block w-full text-left px-4 py-3 text-stone-700 hover:text-stone-900 transition-colors font-light"
                >
                  {t.nav.properties}
                </button>
                <button
                  onClick={() => handleNavigation('/contact')}
                  className="block w-full text-left px-4 py-3 text-stone-700 hover:text-stone-900 transition-colors font-light"
                >
                  {t.nav.contact}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
