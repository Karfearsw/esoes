import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorker, setIsWorker] = useState(false)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user')
    const savedWorkerStatus = localStorage.getItem('isWorker')
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    if (savedWorkerStatus) {
      setIsWorker(JSON.parse(savedWorkerStatus))
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email, password, userType = 'customer') => {
    try {
      // Simulate API call
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        phone: '+1234567890',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        rating: userType === 'worker' ? (4.5 + Math.random() * 0.5).toFixed(1) : null,
        completedJobs: userType === 'worker' ? Math.floor(Math.random() * 100) + 50 : null,
        specialties: userType === 'worker' ? ['Tire Change', 'Jump Start', 'Lockout'] : null,
        isOnline: userType === 'worker' ? true : null
      }
      
      setUser(mockUser)
      setIsWorker(userType === 'worker')
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('isWorker', JSON.stringify(userType === 'worker'))
      
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData, userType = 'customer') => {
    try {
      // Simulate API call
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...userData,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        rating: userType === 'worker' ? 5.0 : null,
        completedJobs: userType === 'worker' ? 0 : null,
        specialties: userType === 'worker' ? userData.specialties || [] : null,
        isOnline: userType === 'worker' ? false : null
      }
      
      setUser(mockUser)
      setIsWorker(userType === 'worker')
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('isWorker', JSON.stringify(userType === 'worker'))
      
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    setIsWorker(false)
    localStorage.removeItem('user')
    localStorage.removeItem('isWorker')
  }

  const updateProfile = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { success: true, user: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const toggleWorkerStatus = () => {
    if (isWorker && user) {
      const updatedUser = { ...user, isOnline: !user.isOnline }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    isWorker,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    toggleWorkerStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}