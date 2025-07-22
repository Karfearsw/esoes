import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Shield, Star, Zap, Users, ArrowRight, Play } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useService } from '../context/ServiceContext'
import { useLocation } from '../context/LocationContext'
import AuthModal from '../components/AuthModal'

const Home = () => {
  const { user } = useAuth()
  const { serviceTypes } = useService()
  const { currentLocation, nearbyWorkers } = useLocation()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const emergencyServices = serviceTypes.filter(service => service.category === 'emergency')

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Dispatch',
      description: 'AI-powered matching connects you with the nearest available professional in seconds'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Vetted Professionals',
      description: 'All service providers are background-checked, licensed, and highly rated'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Real-Time Tracking',
      description: 'Track your service provider in real-time with live ETA updates'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Quality Guaranteed',
      description: 'Rate and review every service. 100% satisfaction guarantee'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '2.5K+', label: 'Verified Professionals' },
    { number: '8 min', label: 'Average Response Time' },
    { number: '4.9★', label: 'Average Rating' }
  ]

  const handleEmergencyService = (serviceType) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    // Navigate to booking page
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-accent-900/20"></div>
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 0.1, 0]
                }}
                transition={{
                  duration: Math.random() * 5 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 3
                }}
                className="absolute w-1 h-1 bg-primary-400 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="gradient-text">Es O Es</span>
              <br />
              <span className="text-white">When You Need It Most</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Get instant roadside assistance, mobile mechanics, and automotive services on-demand. 
              Fast, reliable, and vetted professionals at your fingertips.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              {user ? (
                <Link to="/services" className="btn-primary text-lg px-8 py-4">
                  Book Service Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              )}
              
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Location Status */}
            {currentLocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full"
              >
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">
                  {nearbyWorkers.length} professionals available near you
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="py-16 bg-gradient-to-r from-red-900/20 to-orange-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Emergency Services
            </h2>
            <p className="text-xl text-gray-300">
              Need help right now? Get instant assistance
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyServices.map((service, index) => (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEmergencyService(service.id)}
                className="floating-card text-center group"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-semibold text-white mb-2">{service.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{service.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-400 font-semibold">
                    ${service.basePrice}
                  </span>
                  <span className="text-gray-500">{service.estimatedTime}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose Es O Es?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We're revolutionizing roadside assistance with cutting-edge technology and exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-primary-900/20 to-accent-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-8 lg:p-12 rounded-2xl"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of satisfied customers who trust Es O Es for their automotive emergencies
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/services" className="btn-primary text-lg px-8 py-4">
                  Browse All Services
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Sign Up as Customer
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-secondary text-lg px-8 py-4"
                  >
                    Become a Provider
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}

export default Home