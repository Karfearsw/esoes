import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, User, Phone, MessageCircle, CheckCircle, XCircle, Calendar, ChevronDown, ChevronUp, Filter, Search, Bell, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useService } from '../context/ServiceContext'
import { useLocation } from '../context/LocationContext'

const WorkerDashboard = () => {
  const { user } = useAuth()
  const { getWorkerJobs, updateServiceStatus } = useService()
  const { calculateDistance, calculateETA } = useLocation()
  
  const [activeTab, setActiveTab] = useState('active')
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterStatus, setFilterStatus] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New service request in your area', time: '5 min ago', read: false },
    { id: 2, message: 'Customer left a 5-star review', time: '2 hours ago', read: false },
    { id: 3, message: 'Payment received for Job #12345', time: '1 day ago', read: true }
  ])
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    acceptanceRate: 0,
    averageRating: 0
  })
  const [expandedJob, setExpandedJob] = useState(null)
  
  // Check if user is a worker
  useEffect(() => {
    if (!user || !user.isWorker) {
      window.location.href = '/'
    }
  }, [user])
  
  // Load worker jobs
  useEffect(() => {
    if (user && user.isWorker) {
      const workerJobs = getWorkerJobs()
      setJobs(workerJobs)
      
      // Calculate stats
      const completed = workerJobs.filter(job => job.status === 'completed').length
      const totalEarnings = workerJobs.reduce((sum, job) => {
        return job.status === 'completed' ? sum + job.totalPrice : sum
      }, 0)
      const acceptanceRate = workerJobs.length > 0 
        ? (workerJobs.filter(job => job.status !== 'cancelled').length / workerJobs.length) * 100 
        : 0
      
      setStats({
        totalEarnings,
        completedJobs: completed,
        acceptanceRate: acceptanceRate.toFixed(0),
        averageRating: user.rating || 4.8
      })
    }
  }, [user, getWorkerJobs])
  
  // Filter and sort jobs
  useEffect(() => {
    if (!jobs.length) return
    
    let filtered = [...jobs]
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(job => 
        ['pending', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(job.status)
      )
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(job => job.status === 'completed')
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(job => job.status === 'cancelled')
    }
    
    // Filter by status if specific statuses are selected
    if (filterStatus.length > 0) {
      filtered = filtered.filter(job => filterStatus.includes(job.status))
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(job => 
        job.id.toLowerCase().includes(query) ||
        job.serviceName.toLowerCase().includes(query) ||
        job.customer.name.toLowerCase().includes(query) ||
        (job.location.address && job.location.address.toLowerCase().includes(query))
      )
    }
    
    // Sort jobs
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortBy === 'price') {
        return sortOrder === 'desc' 
          ? b.totalPrice - a.totalPrice
          : a.totalPrice - b.totalPrice
      } else if (sortBy === 'distance') {
        // In a real app, we would calculate actual distances
        const distanceA = parseFloat(a.worker.distance || 0)
        const distanceB = parseFloat(b.worker.distance || 0)
        return sortOrder === 'desc' 
          ? distanceB - distanceA
          : distanceA - distanceB
      }
      return 0
    })
    
    setFilteredJobs(filtered)
  }, [jobs, activeTab, searchQuery, sortBy, sortOrder, filterStatus])
  
  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await updateServiceStatus(jobId, newStatus)
      
      // Update local jobs state
      setJobs(jobs.map(job => {
        if (job.id === jobId) {
          return { ...job, status: newStatus }
        }
        return job
      }))
    } catch (error) {
      console.error('Error updating job status:', error)
    }
  }
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }
  
  const toggleFilterStatus = (status) => {
    if (filterStatus.includes(status)) {
      setFilterStatus(filterStatus.filter(s => s !== status))
    } else {
      setFilterStatus([...filterStatus, status])
    }
  }
  
  const toggleJobExpand = (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null)
    } else {
      setExpandedJob(jobId)
    }
  }
  
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }
  
  const getStatusActions = (job) => {
    switch (job.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusUpdate(job.id, 'accepted')}
              className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
              Accept
            </button>
            <button
              onClick={() => handleStatusUpdate(job.id, 'cancelled')}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Decline
            </button>
          </div>
        )
      case 'accepted':
        return (
          <button
            onClick={() => handleStatusUpdate(job.id, 'en_route')}
            className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            Start Journey
          </button>
        )
      case 'en_route':
        return (
          <button
            onClick={() => handleStatusUpdate(job.id, 'arrived')}
            className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            Mark Arrived
          </button>
        )
      case 'arrived':
        return (
          <button
            onClick={() => handleStatusUpdate(job.id, 'in_progress')}
            className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            Start Service
          </button>
        )
      case 'in_progress':
        return (
          <button
            onClick={() => handleStatusUpdate(job.id, 'completed')}
            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            Complete Job
          </button>
        )
      default:
        return null
    }
  }
  
  if (!user || !user.isWorker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Worker Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your service requests and track your earnings
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            {/* Notifications */}
            <div className="relative mr-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell size={24} className="text-white" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-card border border-white/10 rounded-xl shadow-xl z-50">
                  <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-medium text-white">Notifications</h3>
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-white/10 hover:bg-white/5 transition-colors ${
                            notification.read ? '' : 'bg-primary-500/5'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-2 ${
                              notification.read ? 'bg-gray-500' : 'bg-primary-500'
                            }`}></div>
                            <div>
                              <p className="text-white text-sm">{notification.message}</p>
                              <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Worker Status Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm hidden md:inline">Status:</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-sm font-medium">Online</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={true} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total Earnings</h3>
              <DollarSign className="text-primary-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-white">
              ${stats.totalEarnings.toFixed(2)}
            </div>
            <div className="mt-2 text-sm text-green-400">
              +12% from last month
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Completed Jobs</h3>
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.completedJobs}
            </div>
            <div className="mt-2 text-sm text-green-400">
              +5 this week
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Acceptance Rate</h3>
              <CheckCircle className="text-primary-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.acceptanceRate}%
            </div>
            <div className="mt-2 text-sm text-primary-400">
              Good standing
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Average Rating</h3>
              <Star className="text-yellow-400 fill-current" size={20} />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.averageRating}
            </div>
            <div className="mt-2 text-sm text-yellow-400">
              Top rated provider
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'active'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white transition-colors'
            }`}
          >
            Active Jobs
          </button>
          
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'completed'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white transition-colors'
            }`}
          >
            Completed
          </button>
          
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'cancelled'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white transition-colors'
            }`}
          >
            Cancelled
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job ID, service, or customer name"
              className="w-full pl-10 px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => document.getElementById('filter-dropdown').classList.toggle('hidden')}
                className="flex items-center px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Filter size={16} className="mr-2 text-gray-400" />
                <span className="text-white text-sm">Filter</span>
              </button>
              
              <div
                id="filter-dropdown"
                className="hidden absolute right-0 mt-2 w-48 glass-card border border-white/10 rounded-lg shadow-xl z-10"
              >
                <div className="p-3 border-b border-white/10">
                  <h3 className="font-medium text-white text-sm">Filter by Status</h3>
                </div>
                
                <div className="p-3 space-y-2">
                  {['pending', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'].map((status) => (
                    <div key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`status-${status}`}
                        checked={filterStatus.includes(status)}
                        onChange={() => toggleFilterStatus(status)}
                        className="w-4 h-4 accent-primary-500"
                      />
                      <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-300 capitalize">
                        {status.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => document.getElementById('sort-dropdown').classList.toggle('hidden')}
                className="flex items-center px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-white text-sm mr-2">Sort by</span>
                {sortOrder === 'desc' ? (
                  <ChevronDown size={16} className="text-gray-400" />
                ) : (
                  <ChevronUp size={16} className="text-gray-400" />
                )}
              </button>
              
              <div
                id="sort-dropdown"
                className="hidden absolute right-0 mt-2 w-48 glass-card border border-white/10 rounded-lg shadow-xl z-10"
              >
                <div className="p-3 space-y-2">
                  <button
                    onClick={() => handleSort('date')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortBy === 'date' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    Date
                  </button>
                  
                  <button
                    onClick={() => handleSort('price')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortBy === 'price' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    Price
                  </button>
                  
                  <button
                    onClick={() => handleSort('distance')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortBy === 'distance' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    Distance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="glass-card rounded-xl border border-white/10 overflow-hidden transition-all duration-200"
              >
                {/* Job Header */}
                <div
                  onClick={() => toggleJobExpand(job.id)}
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{job.icon || '🔧'}</div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-white">{job.serviceName}</h3>
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                              #{job.id.substring(0, 8)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(job.createdAt).toLocaleDateString()} • 
                            {new Date(job.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-3">
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin size={14} className="mr-1" />
                          {job.location.address || 'Custom location'}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-400">
                          <User size={14} className="mr-1" />
                          {job.customer.name}
                        </div>
                        
                        <div className={`text-sm px-2 py-0.5 rounded-full ${
                          job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          job.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          job.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-primary-500/20 text-primary-400'
                        }`}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                      <div className="text-xl font-bold text-primary-400">
                        ${job.totalPrice.toFixed(2)}
                      </div>
                      
                      {job.tip > 0 && (
                        <div className="text-sm text-green-400">
                          Tip: ${job.tip.toFixed(2)}
                        </div>
                      )}
                      
                      <div className="mt-2">
                        {getStatusActions(job)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    {expandedJob === job.id ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Job Details (Expanded) */}
                {expandedJob === job.id && (
                  <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Details */}
                      <div>
                        <h4 className="font-medium text-white mb-3">Customer Details</h4>
                        
                        <div className="glass-card p-3 rounded-lg border border-white/10">
                          <div className="flex items-center">
                            <img
                              src={job.customer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.customer.name)}`}
                              alt={job.customer.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            
                            <div className="ml-3">
                              <h5 className="font-medium text-white">{job.customer.name}</h5>
                              <p className="text-sm text-gray-400">{job.customer.email}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex space-x-3">
                            <a
                              href={`tel:${job.customer.phone || '123-456-7890'}`}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
                            >
                              <Phone size={14} className="mr-2" />
                              Call
                            </a>
                            
                            <a
                              href="#"
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
                            >
                              <MessageCircle size={14} className="mr-2" />
                              Message
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      {/* Vehicle Details */}
                      <div>
                        <h4 className="font-medium text-white mb-3">Vehicle Details</h4>
                        
                        <div className="glass-card p-3 rounded-lg border border-white/10">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm text-gray-400">Make</p>
                              <p className="text-white">{job.vehicle.make || 'N/A'}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400">Model</p>
                              <p className="text-white">{job.vehicle.model || 'N/A'}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400">Year</p>
                              <p className="text-white">{job.vehicle.year || 'N/A'}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400">Color</p>
                              <p className="text-white">{job.vehicle.color || 'N/A'}</p>
                            </div>
                            
                            <div className="col-span-2">
                              <p className="text-sm text-gray-400">License Plate</p>
                              <p className="text-white">{job.vehicle.licensePlate || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Service Details */}
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-white mb-3">Service Details</h4>
                        
                        <div className="glass-card p-3 rounded-lg border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Service Type</p>
                              <p className="text-white">{job.serviceName}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400">Payment Method</p>
                              <p className="text-white capitalize">{job.paymentMethod}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400">Total Price</p>
                              <p className="text-white font-medium">${job.totalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {job.additionalInfo && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-sm text-gray-400">Additional Information</p>
                              <p className="text-white mt-1">{job.additionalInfo}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Timeline */}
                    <div className="mt-6">
                      <h4 className="font-medium text-white mb-3">Status Timeline</h4>
                      
                      <div className="relative">
                        {/* Progress Bar */}
                        <div className="absolute top-4 left-4 right-4 h-1 bg-white/10">
                          <div
                            className="h-full bg-primary-500"
                            style={{
                              width: `${
                                job.status === 'pending' ? 0 :
                                job.status === 'accepted' ? 20 :
                                job.status === 'en_route' ? 40 :
                                job.status === 'arrived' ? 60 :
                                job.status === 'in_progress' ? 80 :
                                job.status === 'completed' ? 100 :
                                0
                              }%`
                            }}
                          ></div>
                        </div>
                        
                        {/* Status Steps */}
                        <div className="flex justify-between relative z-10">
                          {['Accepted', 'En Route', 'Arrived', 'In Progress', 'Completed'].map((status, index) => {
                            const statusMap = {
                              'Accepted': 'accepted',
                              'En Route': 'en_route',
                              'Arrived': 'arrived',
                              'In Progress': 'in_progress',
                              'Completed': 'completed'
                            }
                            
                            const currentStatus = statusMap[status]
                            const statusOrder = ['pending', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed']
                            const currentStatusIndex = statusOrder.indexOf(job.status)
                            const thisStatusIndex = statusOrder.indexOf(currentStatus)
                            
                            const isActive = currentStatusIndex >= thisStatusIndex && job.status !== 'cancelled'
                            const isCurrent = job.status === currentStatus
                            
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
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Jobs Found
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'active' ? 'You have no active jobs at the moment.' :
               activeTab === 'completed' ? 'You have not completed any jobs yet.' :
               activeTab === 'cancelled' ? 'You have no cancelled jobs.' :
               'No jobs match your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkerDashboard