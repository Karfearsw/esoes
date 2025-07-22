import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Settings, LogOut, MapPin, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

const Header = () => {
  const { user, isWorker, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/')
  }

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    ...(isWorker ? [{ path: '/worker', label: 'Dashboard' }] : [])
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">SOS</span>
              </motion.div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                Es O Es
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-primary-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </motion.button>

                  {/* Location Indicator */}
                  <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-400">
                    <MapPin size={16} />
                    <span>Current Location</span>
                  </div>

                  {/* Worker Status Toggle */}
                  {isWorker && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Status:</span>
                      <div className={`status-indicator ${
                        user.isOnline ? 'status-online' : 'status-offline'
                      }`}></div>
                      <span className="text-sm">
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  )}

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="hidden sm:block text-sm font-medium">
                        {user.name}
                      </span>
                    </motion.button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-48 glass-card border border-white/20 rounded-lg shadow-xl"
                        >
                          <div className="p-2">
                            <Link
                              to="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-2 w-full p-2 text-left rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <User size={16} />
                              <span>Profile</span>
                            </Link>
                            <button
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-2 w-full p-2 text-left rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Settings size={16} />
                              <span>Settings</span>
                            </button>
                            <hr className="my-2 border-white/10" />
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-2 w-full p-2 text-left rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                            >
                              <LogOut size={16} />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary"
                >
                  Sign In
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'text-primary-400 bg-primary-500/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Header Spacer */}
      <div className="h-16"></div>
    </>
  )
}

export default Header