import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, Clock, CreditCard, Settings, LogOut, ChevronRight, Star, Shield, Truck, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useService } from '../context/ServiceContext'

const Profile = () => {
  const { user, updateProfile, logout, toggleWorkerMode } = useAuth()
  const { getServiceHistory } = useService()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [serviceHistory, setServiceHistory] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: ''
  })
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'visa', last4: '4242', isDefault: true, expiryDate: '12/24' },
    { id: 2, type: 'mastercard', last4: '5555', isDefault: false, expiryDate: '10/25' }
  ])
  
  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        profileImage: user.profileImage || ''
      })
      
      // Load service history
      const history = getServiceHistory()
      setServiceHistory(history)
    }
  }, [user, getServiceHistory])
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value
    })
  }
  
  const handleProfileUpdate = () => {
    updateProfile(profileData)
    setIsEditing(false)
  }
  
  const handleLogout = () => {
    logout()
  }
  
  const handleToggleWorkerMode = () => {
    toggleWorkerMode()
  }
  
  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })))
  }
  
  const handleRemovePayment = (id) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id))
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your profile</p>
          <button
            onClick={() => document.getElementById('auth-modal-toggle').click()}
            className="btn-primary"
          >
            Login / Register
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="glass-card p-6 rounded-xl sticky top-24">
              {/* User Info */}
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img
                    src={user.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-500"
                  />
                  {user.isWorker && (
                    <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-1 rounded-full">
                      <Wrench size={12} />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <User size={18} className="mr-3" />
                  Profile
                </button>
                
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'history'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Clock size={18} className="mr-3" />
                  Service History
                </button>
                
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'payment'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <CreditCard size={18} className="mr-3" />
                  Payment Methods
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Settings size={18} className="mr-3" />
                  Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={18} className="mr-3" />
                  Logout
                </button>
              </nav>
              
              {/* Worker Mode Toggle */}
              {user.isVerifiedWorker && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Worker Mode</h3>
                      <p className="text-sm text-gray-400">Toggle to receive service requests</p>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.isWorker}
                        onChange={handleToggleWorkerMode}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">My Profile</h2>
                    
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        
                        <button
                          onClick={handleProfileUpdate}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl mb-8">
                    {isEditing ? (
                      <div className="space-y-6">
                        {/* Profile Image */}
                        <div className="flex items-center">
                          <img
                            src={profileData.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileData.name)}
                            alt={profileData.name}
                            className="w-24 h-24 rounded-full object-cover border-2 border-primary-500"
                          />
                          
                          <div className="ml-6">
                            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                              Change Photo
                            </button>
                            <p className="text-sm text-gray-400 mt-2">
                              JPG, PNG or GIF. Max size 2MB.
                            </p>
                          </div>
                        </div>
                        
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={profileData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={profileData.email}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              Address
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={profileData.address}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-1">Full Name</h3>
                            <p className="text-white">{profileData.name}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-1">Email Address</h3>
                            <p className="text-white">{profileData.email}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-1">Phone Number</h3>
                            <p className="text-white">{profileData.phone || 'Not provided'}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-1">Address</h3>
                            <p className="text-white">{profileData.address || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        {user.isVerifiedWorker && (
                          <div className="pt-4 border-t border-white/10">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Service Provider Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="glass-card p-3 rounded-lg border border-white/10 flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                                  <Star className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Rating</p>
                                  <p className="text-white font-medium">{user.rating || '4.8'} / 5</p>
                                </div>
                              </div>
                              
                              <div className="glass-card p-3 rounded-lg border border-white/10 flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                                  <Truck className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Services</p>
                                  <p className="text-white font-medium">{user.services?.length || 0} Specialties</p>
                                </div>
                              </div>
                              
                              <div className="glass-card p-3 rounded-lg border border-white/10 flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                                  <Shield className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Verification</p>
                                  <p className="text-white font-medium">Verified</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Service History Tab */}
              {activeTab === 'history' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Service History</h2>
                  
                  {serviceHistory.length > 0 ? (
                    <div className="space-y-4">
                      {serviceHistory.map((service) => (
                        <div key={service.id} className="glass-card p-4 rounded-xl border border-white/10">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <div className="text-2xl mr-3">{service.icon || '🔧'}</div>
                                <div>
                                  <h3 className="font-semibold text-white">{service.serviceName}</h3>
                                  <p className="text-sm text-gray-400">
                                    {new Date(service.createdAt).toLocaleDateString()} • 
                                    {new Date(service.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap gap-3">
                                <div className="flex items-center text-sm text-gray-400">
                                  <MapPin size={14} className="mr-1" />
                                  {service.location.address || 'Custom location'}
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-400">
                                  <User size={14} className="mr-1" />
                                  {service.worker.name}
                                </div>
                                
                                <div className={`text-sm px-2 py-0.5 rounded-full ${
                                  service.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  service.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                  'bg-primary-500/20 text-primary-400'
                                }`}>
                                  {service.status.replace('_', ' ').toUpperCase()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                              <div className="text-xl font-bold text-primary-400">
                                ${service.totalPrice.toFixed(2)}
                              </div>
                              
                              {service.tip > 0 && (
                                <div className="text-sm text-green-400">
                                  Tip: ${service.tip.toFixed(2)}
                                </div>
                              )}
                              
                              <button
                                onClick={() => window.location.href = `/track/${service.id}`}
                                className="mt-2 flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                              >
                                View Details
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-8 rounded-xl text-center">
                      <div className="text-5xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No Service History
                      </h3>
                      <p className="text-gray-400 mb-6">
                        You haven't used any services yet. Book a service to get started!
                      </p>
                      <button
                        onClick={() => window.location.href = '/services'}
                        className="btn-primary"
                      >
                        Browse Services
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
                    
                    <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      Add New Card
                    </button>
                  </div>
                  
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="glass-card p-4 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mr-4">
                                {method.type === 'visa' && (
                                  <span className="text-blue-400 font-bold text-lg">VISA</span>
                                )}
                                {method.type === 'mastercard' && (
                                  <span className="text-red-400 font-bold text-lg">MC</span>
                                )}
                              </div>
                              
                              <div>
                                <h3 className="font-semibold text-white">
                                  {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ending in {method.last4}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  Expires {method.expiryDate}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {method.isDefault ? (
                                <span className="text-sm px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full">
                                  Default
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetDefaultPayment(method.id)}
                                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                  Set as Default
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleRemovePayment(method.id)}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-8 rounded-xl text-center">
                      <div className="text-5xl mb-4">💳</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No Payment Methods
                      </h3>
                      <p className="text-gray-400 mb-6">
                        You haven't added any payment methods yet.
                      </p>
                      <button className="btn-primary">
                        Add Payment Method
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                  
                  <div className="glass-card p-6 rounded-xl mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Notification Preferences
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Email Notifications</h4>
                          <p className="text-sm text-gray-400">Receive service updates via email</p>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={true} className="sr-only peer" />
                          <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">SMS Notifications</h4>
                          <p className="text-sm text-gray-400">Receive service updates via text message</p>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={true} className="sr-only peer" />
                          <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Marketing Communications</h4>
                          <p className="text-sm text-gray-400">Receive promotional offers and updates</p>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={false} className="sr-only peer" />
                          <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Privacy Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Location Sharing</h4>
                          <p className="text-sm text-gray-400">Share your location with service providers</p>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={true} className="sr-only peer" />
                          <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Data Analytics</h4>
                          <p className="text-sm text-gray-400">Allow us to collect usage data to improve services</p>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={true} className="sr-only peer" />
                          <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Account Actions
                    </h3>
                    
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <span className="text-white">Change Password</span>
                        <ChevronRight size={18} className="text-gray-400" />
                      </button>
                      
                      {user.isVerifiedWorker && (
                        <button className="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <span className="text-white">Manage Service Offerings</span>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                      )}
                      
                      <button className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
                        <span className="text-red-400">Delete Account</span>
                        <ChevronRight size={18} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile