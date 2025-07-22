import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MapPin, Clock, Star, ArrowRight } from 'lucide-react'
import { useService } from '../context/ServiceContext'
import { useLocation } from '../context/LocationContext'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

const Services = () => {
  const { user } = useAuth()
  const { serviceTypes } = useService()
  const { nearbyWorkers, findNearbyWorkers } = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('price')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const categories = [
    { id: 'all', name: 'All Services', count: serviceTypes.length },
    { id: 'emergency', name: 'Emergency', count: serviceTypes.filter(s => s.category === 'emergency').length },
    { id: 'repair', name: 'Repair', count: serviceTypes.filter(s => s.category === 'repair').length },
    { id: 'towing', name: 'Towing', count: serviceTypes.filter(s => s.category === 'towing').length }
  ]

  const filteredServices = serviceTypes
    .filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.basePrice - b.basePrice
        case 'time':
          return parseInt(a.estimatedTime) - parseInt(b.estimatedTime)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const handleBookService = (serviceType) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    // Navigation will be handled by Link component
  }

  const getAvailableWorkers = (serviceType) => {
    return findNearbyWorkers(serviceType).length
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional roadside assistance and automotive services available 24/7
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-xl mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id} className="bg-dark-800">
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
            >
              <option value="price" className="bg-dark-800">Sort by Price</option>
              <option value="time" className="bg-dark-800">Sort by Time</option>
              <option value="name" className="bg-dark-800">Sort by Name</option>
            </select>
          </div>
        </motion.div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredServices.map((service, index) => {
              const availableWorkers = getAvailableWorkers(service.id)
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="service-card floating-card group"
                >
                  {/* Service Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{service.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {service.name}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-full capitalize">
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 mb-4">{service.description}</p>

                  {/* Service Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Starting Price:</span>
                      <span className="text-xl font-bold text-primary-400">
                        ${service.basePrice}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Estimated Time:</span>
                      <div className="flex items-center space-x-1 text-gray-300">
                        <Clock size={16} />
                        <span>{service.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Available Now:</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          availableWorkers > 0 ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <span className={availableWorkers > 0 ? 'text-green-400' : 'text-red-400'}>
                          {availableWorkers} workers
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Average Rating */}
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      4.8 (2.1k reviews)
                    </span>
                  </div>

                  {/* Book Button */}
                  {user ? (
                    <Link
                      to={`/book/${service.id}`}
                      className="w-full btn-primary flex items-center justify-center space-x-2 group-hover:scale-105 transition-transform"
                    >
                      <span>Book Now</span>
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleBookService(service.id)}
                      className="w-full btn-primary flex items-center justify-center space-x-2 group-hover:scale-105 transition-transform"
                    >
                      <span>Book Now</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No services found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 glass-card p-6 rounded-xl bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold text-white mb-2">
                🚨 Emergency Situation?
              </h3>
              <p className="text-gray-300">
                For immediate assistance, call our 24/7 emergency hotline
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+1-800-RESCUE"
                className="btn-secondary px-6 py-3 text-center"
              >
                Call Now: 1-800-RESCUE
              </a>
              <Link
                to="/services?category=emergency"
                className="btn-primary px-6 py-3 text-center"
              >
                Emergency Services
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}

export default Services