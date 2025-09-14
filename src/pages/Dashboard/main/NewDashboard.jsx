import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Routes, Route } from 'react-router-dom'
import NewNavbar from './NewNavbar'
import Layout from './Layout'
import ManagerDashboard from '../ManagerDashboard'
import AccounterDashboard from '../AccounterDashboard'
import CollectionOfficerDashboard from '../CollectionOfficerDashboard'
import DashRoute from '../route/DashRoute'

function NewDashboard() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('')
  const [officerType, setOfficerType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user type and officer type from localStorage
    const storedUserType = localStorage.getItem('userType')
    const storedOfficerType = localStorage.getItem('officerType')
    
    console.log('Dashboard - User Type:', storedUserType)
    console.log('Dashboard - Officer Type:', storedOfficerType)
    
    setUserType(storedUserType || '')
    setOfficerType(storedOfficerType || '')
    setLoading(false)

    // Officers will be handled by the component render logic below
    console.log('Officer type detected:', storedOfficerType)
  }, [navigate])

  // Show loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-primaryBg flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </motion.div>
    )
  }

  // If it's an officer, show their specific dashboard with routing
  if (userType === 'officer') {
    const officerName = localStorage.getItem('officerName') || 'Officer';
    
    switch (officerType) {
      case 'manager':
        return (
          <Routes>
            <Route path="/" element={<ManagerDashboard />} />
            <Route path="/*" element={<DashRoute />} />
          </Routes>
        )
      case 'accounter':
        return <AccounterDashboard />
      case 'collection_officer':
        return <CollectionOfficerDashboard />
      default:
        // Fallback to admin dashboard for unknown officer types
        break
    }
  }

  // Default admin dashboard
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <NewNavbar/>
      <Layout/>
    </motion.div>
  )
}

export default NewDashboard
