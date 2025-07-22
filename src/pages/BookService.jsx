import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Star, ChevronRight, ArrowLeft, Check, X, CreditCard, Truck, Phone } from 'lucide-react'
import { useService } from '../context/ServiceContext'
import { useLocation } from '../context/LocationContext'
import { useAuth } from '../context/AuthContext'

const BookService = () => {
  const { serviceType } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getServiceTypeById, bookService, isBooking } = useService()
  const { currentLocation, findNearbyWorkers, geocodeAddress } = useLocation()
  
  const [step, setStep] = useState(1)
  const [service, setService] = useState(null)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [nearbyWorkers, setNearbyWorkers] = useState([])
  const [customLocation, setCustomLocation] = useState('')
  const [useCurrentLocation, setUseCurrentLocation] = useState(true)
  const [bookingLocation, setBookingLocation] = useState(null)
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Load service details
  useEffect(() => {
    const serviceData = getServiceTypeById(serviceType)
    if (serviceData) {
      setService(serviceData)
    } else {
      navigate('/services')
    }
  }, [serviceType, getServiceTypeById, navigate])
  
  // Load nearby workers
  useEffect(() => {
    if (currentLocation && service) {
      const workers = findNearbyWorkers(service.id)
      setNearbyWorkers(workers)
      if (workers.length > 0) {
        setSelectedWorker(workers[0])
      }
    }
  }, [currentLocation, service, findNearbyWorkers])
  
  // Set booking location
  useEffect(() => {
    if (useCurrentLocation && currentLocation) {
      setBookingLocation(currentLocation)
    }
  }, [useCurrentLocation, currentLocation])
  
  const handleLocationSearch = async () => {
    if (customLocation.trim() === '') return
    
    try {
      const result = await geocodeAddress(customLocation)
      if (result.success) {
        setBookingLocation(result.location)
        setUseCurrentLocation(false)
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
    }
  }
  
  const handleVehicleInfoChange = (e) => {
    setVehicleInfo({
      ...vehicleInfo,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async () => {
    if (!service || !selectedWorker || !bookingLocation) return
    
    setIsProcessing(true)
    
    try {
      const bookingData = {
        serviceType: service.id,
        serviceName: service.name,
        worker: selectedWorker,
        location: bookingLocation,
        vehicle: vehicleInfo,
        paymentMethod,
        additionalInfo,
        basePrice: service.basePrice,
        totalPrice: calculateTotalPrice(),
        customer: user
      }
      
      const result = await bookService(bookingData)
      
      if (result.success) {
        navigate(`/track/${result.service.id}`)
      }
    } catch (error) {
      console.error('Error booking service:', error)
      setIsProcessing(false)
    }
  }
  
  const calculateTotalPrice = () => {
    if (!service || !selectedWorker) return 0
    
    let total = service.basePrice
    
    // Add distance fee
    total += parseFloat(selectedWorker.distance) * 2 // $2 per mile
    
    return total.toFixed(2)
  }
  
  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate('/services')
    }
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
          <button
            onClick={prevStep}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Book {service.name}
          </h1>
          
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="text-2xl">{service.icon}</div>
            <span>{service.description}</span>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === stepNumber
                  ? 'bg-primary-500 text-white'
                  : step > stepNumber
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {step > stepNumber ? <Check size={16} /> : stepNumber}
              </div>
              
              {stepNumber < 4 && (
                <div
                  className={`w-full h-1 ${step > stepNumber
                    ? 'bg-green-500'
                    : 'bg-white/10'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Step Content */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Service Location */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Where do you need assistance?
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="currentLocation"
                      checked={useCurrentLocation}
                      onChange={() => setUseCurrentLocation(true)}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <label htmlFor="currentLocation" className="text-gray-300">
                      Use my current location
                    </label>
                  </div>
                  
                  {currentLocation && useCurrentLocation && (
                    <div className="glass-card p-4 rounded-lg border border-white/10">
                      <div className="flex items-start space-x-3">
                        <MapPin className="text-primary-400 mt-1" size={20} />
                        <div>
                          <h3 className="font-medium text-white">Current Location</h3>
                          <p className="text-gray-400 text-sm">
                            Latitude: {currentLocation.lat.toFixed(6)}, Longitude: {currentLocation.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="customLocation"
                      checked={!useCurrentLocation}
                      onChange={() => setUseCurrentLocation(false)}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <label htmlFor="customLocation" className="text-gray-300">
                      Enter a different location
                    </label>
                  </div>
                  
                  {!useCurrentLocation && (
                    <div className="space-y-3">
                      <div className="flex">
                        <input
                          type="text"
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          placeholder="Enter address, intersection, or landmark"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-l-lg focus:border-primary-400 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={handleLocationSearch}
                          className="px-4 py-3 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition-colors"
                        >
                          Search
                        </button>
                      </div>
                      
                      {bookingLocation && !useCurrentLocation && (
                        <div className="glass-card p-4 rounded-lg border border-white/10">
                          <div className="flex items-start space-x-3">
                            <MapPin className="text-primary-400 mt-1" size={20} />
                            <div>
                              <h3 className="font-medium text-white">Selected Location</h3>
                              <p className="text-gray-400 text-sm">
                                {bookingLocation.address || `Lat: ${bookingLocation.lat.toFixed(6)}, Lng: ${bookingLocation.lng.toFixed(6)}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Vehicle Information */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Vehicle Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Make
                    </label>
                    <input
                      type="text"
                      name="make"
                      value={vehicleInfo.make}
                      onChange={handleVehicleInfoChange}
                      placeholder="e.g. Toyota"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={vehicleInfo.model}
                      onChange={handleVehicleInfoChange}
                      placeholder="e.g. Camry"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={vehicleInfo.year}
                      onChange={handleVehicleInfoChange}
                      placeholder="e.g. 2020"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={vehicleInfo.color}
                      onChange={handleVehicleInfoChange}
                      placeholder="e.g. Silver"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      License Plate
                    </label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={vehicleInfo.licensePlate}
                      onChange={handleVehicleInfoChange}
                      placeholder="e.g. ABC123"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Additional Information (optional)
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Describe your issue or provide any additional details that might help the service provider"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                  ></textarea>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Select Provider */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Select Service Provider
                </h2>
                
                {nearbyWorkers.length > 0 ? (
                  <div className="space-y-4">
                    {nearbyWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        onClick={() => setSelectedWorker(worker)}
                        className={`glass-card p-4 rounded-lg border transition-colors cursor-pointer ${
                          selectedWorker?.id === worker.id
                            ? 'border-primary-400 bg-primary-500/10'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="relative">
                            <img
                              src={worker.avatar}
                              alt={worker.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-dark-800 ${
                              worker.isOnline ? 'bg-green-500' : 'bg-gray-500'
                            }`}></div>
                          </div>
                          
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white">{worker.name}</h3>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-white">{worker.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-400 text-sm mt-1">
                              <Truck className="w-4 h-4 mr-1" />
                              <span>{worker.service} Specialist</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-3 text-sm">
                                <div className="flex items-center text-gray-400">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span>{worker.distance} miles</span>
                                </div>
                                
                                <div className="flex items-center text-gray-400">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>ETA {worker.eta} min</span>
                                </div>
                              </div>
                              
                              <div className="text-primary-400 font-semibold">
                                ${worker.price}
                              </div>
                            </div>
                          </div>
                          
                          {selectedWorker?.id === worker.id && (
                            <div className="ml-2">
                              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">😢</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No providers available
                    </h3>
                    <p className="text-gray-400 mb-4">
                      We couldn't find any service providers in your area at the moment.
                    </p>
                    <button
                      onClick={() => navigate('/services')}
                      className="btn-primary"
                    >
                      Try Another Service
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Step 4: Payment */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Review & Payment
                </h2>
                
                <div className="space-y-6">
                  {/* Service Summary */}
                  <div className="glass-card p-4 rounded-lg border border-white/10">
                    <h3 className="font-medium text-white mb-3">Service Details</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Service Type:</span>
                        <span className="text-white">{service.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Provider:</span>
                        <span className="text-white">{selectedWorker?.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">ETA:</span>
                        <span className="text-white">{selectedWorker?.eta} minutes</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vehicle:</span>
                        <span className="text-white">
                          {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="glass-card p-4 rounded-lg border border-white/10">
                    <h3 className="font-medium text-white mb-3">Price Breakdown</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Base Price:</span>
                        <span className="text-white">${service.basePrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Distance Fee:</span>
                        <span className="text-white">
                          ${(parseFloat(selectedWorker?.distance || 0) * 2).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="border-t border-white/10 my-2"></div>
                      
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-300">Total:</span>
                        <span className="text-primary-400 text-xl">
                          ${calculateTotalPrice()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Method */}
                  <div>
                    <h3 className="font-medium text-white mb-3">Payment Method</h3>
                    
                    <div className="space-y-3">
                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-primary-400 bg-primary-500/10'
                            : 'glass-card border-white/10 hover:border-white/30'
                        }`}
                      >
                        <CreditCard className="text-primary-400 mr-3" size={24} />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">Credit/Debit Card</h4>
                          <p className="text-gray-400 text-sm">Pay securely with your card</p>
                        </div>
                        {paymentMethod === 'card' && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                          paymentMethod === 'cash'
                            ? 'border-primary-400 bg-primary-500/10'
                            : 'glass-card border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="text-primary-400 mr-3 text-xl">💵</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">Cash</h4>
                          <p className="text-gray-400 text-sm">Pay with cash after service completion</p>
                        </div>
                        {paymentMethod === 'cash' && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 glass-card border border-white/20 rounded-lg hover:border-white/40 transition-colors"
          >
            Back
          </button>
          
          <button
            onClick={nextStep}
            disabled={isProcessing || (step === 3 && !selectedWorker)}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : step === 4 ? (
              'Confirm & Pay'
            ) : (
              'Continue'
            )}
          </button>
        </div>
        
        {/* Emergency Contact */}
        <div className="mt-8 text-center">
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
    </div>
  )
}

export default BookService