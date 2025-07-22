import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState('customer')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    specialties: []
  })

  const specialtyOptions = [
    'Tire Change', 'Jump Start', 'Lockout', 'Fuel Delivery',
    'Battery Replacement', 'Brake Repair', 'Engine Diagnostics',
    'Towing', 'Flat Tire Repair', 'Key Programming'
  ]

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let result
      if (isLogin) {
        result = await login(formData.email, formData.password, userType)
      } else {
        result = await register(formData, userType)
      }

      if (result.success) {
        onClose()
        setFormData({
          email: '',
          password: '',
          name: '',
          phone: '',
          specialties: []
        })
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      specialties: []
    })
    setError('')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-card border border-white/20 rounded-2xl p-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-2">
              {isLogin ? 'Welcome Back' : 'Join Es O Es'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="flex mb-6 p-1 glass-card rounded-lg">
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                userType === 'customer'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType('worker')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                userType === 'worker'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Service Provider
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Register only) */}
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 glass-card border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 glass-card border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Phone (Register only) */}
            {!isLogin && (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 glass-card border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 glass-card border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Specialties (Worker Registration only) */}
            {!isLogin && userType === 'worker' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Your Specialties
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleSpecialtyToggle(specialty)}
                      className={`p-2 text-xs rounded-lg border transition-all ${
                        formData.specialties.includes(specialty)
                          ? 'bg-primary-500 border-primary-400 text-white'
                          : 'glass-card border-white/20 text-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* Switch Mode */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={switchMode}
                className="ml-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AuthModal