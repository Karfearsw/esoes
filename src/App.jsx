import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Home from './pages/Home'
import Services from './pages/Services'
import BookService from './pages/BookService'
import TrackService from './pages/TrackService'
import Profile from './pages/Profile'
import WorkerDashboard from './pages/WorkerDashboard'
import { LocationProvider } from './context/LocationContext'
import { AuthProvider } from './context/AuthContext'
import { ServiceProvider } from './context/ServiceContext'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <AuthProvider>
      <LocationProvider>
        <ServiceProvider>
          <Router>
            <div className="min-h-screen bg-dark-900">
              <Header />
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/book/:serviceType" element={<BookService />} />
                  <Route path="/track/:serviceId" element={<TrackService />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/worker" element={<WorkerDashboard />} />
                </Routes>
              </AnimatePresence>
            </div>
          </Router>
        </ServiceProvider>
      </LocationProvider>
    </AuthProvider>
  )
}

export default App