import React, { createContext, useContext, useState, useEffect } from 'react'

const LocationContext = createContext()

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nearbyWorkers, setNearbyWorkers] = useState([])

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setCurrentLocation(location)
        setIsLoading(false)
        
        // Simulate finding nearby workers
        generateNearbyWorkers(location)
      },
      (error) => {
        setError(error.message)
        setIsLoading(false)
        
        // Fallback to a default location (e.g., city center)
        const defaultLocation = { lat: 40.7128, lng: -74.0060 } // New York
        setCurrentLocation(defaultLocation)
        generateNearbyWorkers(defaultLocation)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const generateNearbyWorkers = (location) => {
    // Generate mock nearby workers
    const workers = []
    const services = ['mechanic', 'locksmith', 'tire', 'jumpstart', 'towing']
    const names = ['Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Wilson', 'Mike Rodriguez', 'Lisa Thompson']
    
    for (let i = 0; i < 8; i++) {
      const worker = {
        id: `worker_${i + 1}`,
        name: names[i % names.length],
        service: services[Math.floor(Math.random() * services.length)],
        rating: (4.0 + Math.random() * 1.0).toFixed(1),
        distance: (Math.random() * 5 + 0.5).toFixed(1), // 0.5 to 5.5 miles
        eta: Math.floor(Math.random() * 20 + 5), // 5 to 25 minutes
        price: Math.floor(Math.random() * 100 + 50), // $50 to $150
        location: {
          lat: location.lat + (Math.random() - 0.5) * 0.1,
          lng: location.lng + (Math.random() - 0.5) * 0.1
        },
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${names[i % names.length]}`,
        isOnline: Math.random() > 0.3, // 70% chance of being online
        completedJobs: Math.floor(Math.random() * 500 + 100),
        specialties: getRandomSpecialties()
      }
      workers.push(worker)
    }
    
    setNearbyWorkers(workers.filter(w => w.isOnline))
  }

  const getRandomSpecialties = () => {
    const allSpecialties = [
      'Tire Change', 'Jump Start', 'Lockout', 'Fuel Delivery',
      'Battery Replacement', 'Brake Repair', 'Engine Diagnostics',
      'Towing', 'Flat Tire Repair', 'Key Programming'
    ]
    const count = Math.floor(Math.random() * 4) + 2 // 2-5 specialties
    return allSpecialties.sort(() => 0.5 - Math.random()).slice(0, count)
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(1)
  }

  const findNearbyWorkers = (serviceType, radius = 10) => {
    if (!currentLocation) return []
    
    return nearbyWorkers.filter(worker => {
      if (serviceType && worker.service !== serviceType) return false
      
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        worker.location.lat,
        worker.location.lng
      )
      
      return parseFloat(distance) <= radius
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
  }

  const geocodeAddress = async (address) => {
    // Mock geocoding - in real app, use Google Maps Geocoding API
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return mock coordinates
      const mockLocation = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: address
      }
      
      return { success: true, location: mockLocation }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    // Get location on mount
    getCurrentLocation()
  }, [])

  const value = {
    currentLocation,
    isLoading,
    error,
    nearbyWorkers,
    getCurrentLocation,
    findNearbyWorkers,
    calculateDistance,
    geocodeAddress
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}