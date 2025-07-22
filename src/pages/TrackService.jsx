import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Phone, MessageCircle, Star, DollarSign, ThumbsUp, ThumbsDown, X } from 'lucide-react'
import { useService } from '../context/ServiceContext'
import { useLocation } from '../context/LocationContext'
import { useAuth } from '../context/AuthContext'

const TrackService = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getServiceById, updateServiceStatus, cancelService, completeService, addTip } = useService()
  const { calculateDistance, calculateETA } = useLocation()
  
  const [service, setService] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [distance, setDistance] = useState(null)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState(5)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Load service details
  useEffect(() => {
    const loadService = () => {
      const serviceData = getServiceById(serviceId)
      if (serviceData) {
        setService(serviceData)
      } else {
        navigate('/services')
      }
    }
    
    loadService()
    
    // Set up interval to refresh service data
    const interval = setInterval(loadService, 10000) // Refresh every 10 seconds
    
    return () => clearInterval(interval)
  }, [serviceId, getServiceById, navigate])
  
  // Calculate distance and ETA
  useEffect(() => {
    if (service && service.worker && service.location) {
      // In a real app, we would get the worker's real-time location
      // For demo purposes, we'll simulate the worker moving closer over time
      const workerLocation = {
        lat: service.worker.location.lat + (Math.random() * 0.01 - 0.005),
        lng: service.worker.location.lng + (Math.random() * 0.01 - 0.005)
      }
      
      const dist = calculateDistance(workerLocation, service.location)
      setDistance(dist.toFixed(2))
      
      const eta = calculateETA(dist)
      setTimeRemaining(eta)
      
      // Simulate service status updates based on time elapsed
      const minutesSinceCreation = (Date.now() - service.createdAt) / (1000 * 60)
      
      if (service.status === 'pending' && minutesSinceCreation > 1) {
        updateServiceStatus(service.id, 'accepted')
      } else if (service.status === 'accepted' && minutesSinceCreation > 2) {
        updateServiceStatus(service.id, 'en_route')
      } else if (service.status === 'en_route' && minutesSinceCreation > 4) {
        updateServiceStatus(service.id, 'arrived')
      } else if (service.status === 'arrived' && minutesSinceCreation > 6) {
        updateServiceStatus(service.id, 'in_progress')
      } else if (service.status === 'in_progress' && minutesSinceCreation > 8) {
        updateServiceStatus(service.id, 'completed')
      }
    }
  }, [service, calculateDistance, calculateETA, updateServiceStatus])
  
  const getStatusStep = () => {
    const statusMap = {
      pending: 1,
      accepted: 2,
      en_route: 3,
      arrived: 4,
      in_progress: 5,
      completed: 6,
      cancelled: 0
    }
    
    return statusMap[service?.status] || 0
  }
  
  const getStatusText = () => {
    const statusTextMap = {
      pending: 'Searching for service provider',
      accepted: 'Service provider accepted your request',
      en_route: 'Service provider is on the way',
      arrived: 'Service provider has arrived',
      in_progress: 'Service is in progress',
      completed: 'Service completed',
      cancelled: 'Service cancelled'
    }
    
    return statusTextMap[service?.status] || ''
  }
  
  const handleCancelService = async () => {
    if (!service) return
    
    setIsProcessing(true)
    
    try {
      await cancelService(service.id, cancelReason)
      setShowCancelModal(false)
    } catch (error) {
      console.error('Error cancelling service:', error)
    }
    
    setIsProcessing(false)
  }
  
  const handleCompleteService = async () => {
    if (!service) return
    
    setIsProcessing(true)
    
    try {
      await completeService(service.id, rating, feedback)
      setShowRatingModal(false)
    } catch (error) {
      console.error('Error completing service:', error)
    }
    
    setIsProcessing(false)
  }
  
  const handleAddTip = async () => {
    if (!service) return
    
    setIsProcessing(true)
    
    try {
      await addTip(service.id, tipAmount)
      setShowTipModal(false)
    } catch (error) {
      console.error('Error adding tip:', error)
    }
    
    setIsProcessing(false)
  }
  
  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Track Your Service
          </h1>
          
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Request #{service.id.substring(0, 8)}</span>
            <span>•</span>
            <span>{new Date(service.createdAt).toLocaleString()}</span>
          </div>
        </div>
        
        {/* Status Card */}
        <div className="glass-card p-6 rounded-xl mb-8 relative overflow-hidden">
          {/* Status Badge */}
          <div className={`absolute top-0 right-0 px-4 py-2 text-sm font-medium ${
            service.status === 'completed' ? 'bg-green-500 text-white' :
            service.status === 'cancelled' ? 'bg-red-500 text-white' :
            'bg-primary-500 text-white'
          }`}>
            {service.status.replace('_', ' ').toUpperCase()}
          </div>
          
          {/* Service Info */}
          <div className="flex flex-col md:flex-row md:items-center mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {service.serviceName}
              </h2>
              
              <div className="flex items-center space-x-2 text-gray-400 mb-4">
                <MapPin size={16} />
                <span>
                  {service.location.address || 
                    `Lat: ${service.location.lat.toFixed(6)}, Lng: ${service.location.lng.toFixed(6)}`}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <span className="text-gray-300">
                    {service.vehicle.year} {service.vehicle.make} {service.vehicle.model}
                  </span>
                </div>
                
                {service.vehicle.color && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-gray-300">{service.vehicle.color}</span>
                  </div>
                )}
                
                {service.vehicle.licensePlate && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-gray-300">Plate: {service.vehicle.licensePlate}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center">
              <div className="text-3xl font-bold text-primary-400">
                ${service.totalPrice.toFixed(2)}
              </div>
              <div className="text-gray-400 text-sm">
                {service.paymentMethod === 'card' ? 'Paid with Card' : 'Cash on Completion'}
              </div>
              
              {service.tip > 0 && (
                <div className="text-green-400 text-sm mt-1">
                  Tip: ${service.tip.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          
          {/* Status Timeline */}
          {service.status !== 'cancelled' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Service Status
              </h3>
              
              <div className="relative">
                {/* Progress Bar */}
                <div className="absolute top-4 left-4 right-4 h-1 bg-white/10">
                  <div
                    className="h-full bg-primary-500"
                    style={{ width: `${(getStatusStep() - 1) * 20}%` }}
                  ></div>
                </div>
                
                {/* Status Steps */}
                <div className="flex justify-between relative z-10">
                  {['Accepted', 'En Route', 'Arrived', 'In Progress', 'Completed'].map((status, index) => {
                    const step = index + 2 // +2 because we start at 'accepted' (step 2)
                    const isActive = getStatusStep() >= step
                    const isCurrent = getStatusStep() === step
                    
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                            isCurrent
                              ? 'bg-primary-500 text-white'
                              : isActive
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}>
                          {status}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <div className="text-lg font-semibold text-white">
                  {getStatusText()}
                </div>
                
                {(service.status === 'en_route' || service.status === 'accepted') && (
                  <div className="mt-2 text-gray-400">
                    <Clock className="inline-block mr-1" size={16} />
                    ETA: {timeRemaining} minutes
                    {distance && (
                      <span className="ml-2">({distance} miles away)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Service Provider */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Service Provider
            </h3>
            
            <div className="flex items-center">
              <img
                src={service.worker.avatar}
                alt={service.worker.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{service.worker.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white">{service.worker.rating}</span>
                  </div>
                </div>
                
                <div className="text-gray-400 text-sm mt-1">
                  {service.worker.service} Specialist
                </div>
                
                <div className="flex mt-3 space-x-3">
                  <a
                    href={`tel:${service.worker.phone}`}
                    className="flex items-center justify-center px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    <Phone size={16} className="mr-2" />
                    Call
                  </a>
                  
                  <a
                    href="#"
                    className="flex items-center justify-center px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Message
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {service.status === 'completed' && !service.tip && (
              <button
                onClick={() => setShowTipModal(true)}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <DollarSign size={18} className="mr-2" />
                Add Tip
              </button>
            )}
            
            {service.status === 'completed' && !service.rating && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Star size={18} className="mr-2" />
                Rate Service
              </button>
            )}
            
            {['pending', 'accepted', 'en_route'].includes(service.status) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X size={18} className="mr-2" />
                Cancel Service
              </button>
            )}
          </div>
        </div>
        
        {/* Emergency Contact */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Need immediate assistance? Call our 24/7 emergency hotline
          </p>
          <a
            href="tel:+1-800-RESCUE"
            className="flex items-center justify-center space-x-2 text-primary-400 font-medium mt-2"
          >
            <Phone size={16} />
            <span>1-800-RESCUE</span>
          </a>
        </div>
      </div>
      
      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Add a Tip
            </h2>
            
            <p className="text-gray-300 mb-6">
              Show your appreciation for {service.worker.name}'s service with a tip.
            </p>
            
            <div className="flex justify-between mb-6">
              {[5, 10, 15, 20].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    tipAmount === amount
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Custom Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  min="1"
                  step="1"
                  className="w-full pl-10 px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleAddTip}
                disabled={isProcessing || tipAmount <= 0}
                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Add $${tipAmount.toFixed(2)} Tip`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Rate Your Service
            </h2>
            
            <p className="text-gray-300 mb-6">
              How would you rate your experience with {service.worker.name}?
            </p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-3xl"
                >
                  <Star
                    size={32}
                    className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}
                  />
                </button>
              ))}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience"
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
              ></textarea>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCompleteService}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Cancel Service
            </h2>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to cancel this service request? This action cannot be undone.
            </p>
            
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you're cancelling"
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
              ></textarea>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Go Back
              </button>
              
              <button
                onClick={handleCancelService}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default TrackService