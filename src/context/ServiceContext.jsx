import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const ServiceContext = createContext()

export const useService = () => {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider')
  }
  return context
}

export const ServiceProvider = ({ children }) => {
  const { user } = useAuth()
  const [activeService, setActiveService] = useState(null)
  const [serviceHistory, setServiceHistory] = useState([])
  const [isBooking, setIsBooking] = useState(false)

  const serviceTypes = [
    {
      id: 'jumpstart',
      name: 'Jump Start',
      icon: '🔋',
      description: 'Dead battery? Get a quick jump start',
      basePrice: 45,
      estimatedTime: '10-15 min',
      category: 'emergency'
    },
    {
      id: 'tire',
      name: 'Tire Change',
      icon: '🛞',
      description: 'Flat tire replacement or repair',
      basePrice: 65,
      estimatedTime: '15-25 min',
      category: 'emergency'
    },
    {
      id: 'lockout',
      name: 'Lockout Service',
      icon: '🔑',
      description: 'Locked out of your car? We can help',
      basePrice: 55,
      estimatedTime: '10-20 min',
      category: 'emergency'
    },
    {
      id: 'fuel',
      name: 'Fuel Delivery',
      icon: '⛽',
      description: 'Emergency fuel delivery service',
      basePrice: 35,
      estimatedTime: '15-30 min',
      category: 'emergency'
    },
    {
      id: 'towing',
      name: 'Towing Service',
      icon: '🚛',
      description: 'Professional towing to your destination',
      basePrice: 125,
      estimatedTime: '20-40 min',
      category: 'towing'
    },
    {
      id: 'mechanic',
      name: 'Mobile Mechanic',
      icon: '🔧',
      description: 'On-site mechanical repairs and diagnostics',
      basePrice: 95,
      estimatedTime: '30-60 min',
      category: 'repair'
    },
    {
      id: 'battery',
      name: 'Battery Replacement',
      icon: '🔋',
      description: 'New battery installation service',
      basePrice: 85,
      estimatedTime: '15-25 min',
      category: 'repair'
    },
    {
      id: 'diagnostics',
      name: 'Engine Diagnostics',
      icon: '🔍',
      description: 'Professional engine diagnostic service',
      basePrice: 75,
      estimatedTime: '20-30 min',
      category: 'repair'
    }
  ]

  const bookService = async (serviceData) => {
    setIsBooking(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newService = {
        id: `service_${Date.now()}`,
        ...serviceData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedArrival: new Date(Date.now() + serviceData.worker.eta * 60000).toISOString(),
        timeline: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            message: 'Service request submitted'
          }
        ]
      }
      
      setActiveService(newService)
      
      // Simulate worker acceptance
      setTimeout(() => {
        updateServiceStatus(newService.id, 'accepted', 'Worker has accepted your request')
      }, 3000)
      
      // Simulate worker en route
      setTimeout(() => {
        updateServiceStatus(newService.id, 'en_route', 'Worker is on the way to your location')
      }, 8000)
      
      return { success: true, service: newService }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsBooking(false)
    }
  }

  const updateServiceStatus = (serviceId, status, message) => {
    setActiveService(prev => {
      if (!prev || prev.id !== serviceId) return prev
      
      const updatedService = {
        ...prev,
        status,
        timeline: [
          ...prev.timeline,
          {
            status,
            timestamp: new Date().toISOString(),
            message
          }
        ]
      }
      
      return updatedService
    })
  }

  const completeService = async (serviceId, rating, tip = 0) => {
    try {
      const completedService = {
        ...activeService,
        status: 'completed',
        completedAt: new Date().toISOString(),
        rating,
        tip,
        timeline: [
          ...activeService.timeline,
          {
            status: 'completed',
            timestamp: new Date().toISOString(),
            message: 'Service completed successfully'
          }
        ]
      }
      
      setServiceHistory(prev => [completedService, ...prev])
      setActiveService(null)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const cancelService = async (serviceId, reason) => {
    try {
      const cancelledService = {
        ...activeService,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelReason: reason,
        timeline: [
          ...activeService.timeline,
          {
            status: 'cancelled',
            timestamp: new Date().toISOString(),
            message: `Service cancelled: ${reason}`
          }
        ]
      }
      
      setServiceHistory(prev => [cancelledService, ...prev])
      setActiveService(null)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const processPayment = async (paymentData) => {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const payment = {
        id: `payment_${Date.now()}`,
        ...paymentData,
        status: 'completed',
        processedAt: new Date().toISOString()
      }
      
      return { success: true, payment }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const getServiceById = (serviceId) => {
    if (activeService && activeService.id === serviceId) {
      return activeService
    }
    return serviceHistory.find(service => service.id === serviceId)
  }

  const getServiceTypeById = (typeId) => {
    return serviceTypes.find(type => type.id === typeId)
  }

  // Load service history from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`serviceHistory_${user.id}`)
      if (savedHistory) {
        setServiceHistory(JSON.parse(savedHistory))
      }
      
      const savedActiveService = localStorage.getItem(`activeService_${user.id}`)
      if (savedActiveService) {
        setActiveService(JSON.parse(savedActiveService))
      }
    }
  }, [user])

  // Save to localStorage when service history or active service changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`serviceHistory_${user.id}`, JSON.stringify(serviceHistory))
    }
  }, [serviceHistory, user])

  useEffect(() => {
    if (user) {
      if (activeService) {
        localStorage.setItem(`activeService_${user.id}`, JSON.stringify(activeService))
      } else {
        localStorage.removeItem(`activeService_${user.id}`)
      }
    }
  }, [activeService, user])

  const value = {
    serviceTypes,
    activeService,
    serviceHistory,
    isBooking,
    bookService,
    updateServiceStatus,
    completeService,
    cancelService,
    processPayment,
    getServiceById,
    getServiceTypeById
  }

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  )
}