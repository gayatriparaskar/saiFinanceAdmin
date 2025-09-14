import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaSignOutAlt, 
  FaUserCircle, 
  FaCog,
  FaHome
} from 'react-icons/fa';
import { 
  HiMenu,
  HiX
} from 'react-icons/hi';
import { IoSettings } from 'react-icons/io5';

const OfficerNavbar = ({ officerType, officerName, pageName }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  
  // Debug log for officer name
  console.log('OfficerNavbar - officerType:', officerType, 'officerName:', officerName);
  console.log('OfficerNavbar - Props received:', { officerType, officerName, pageName });
  console.log('OfficerNavbar - Current localStorage:', {
    token: localStorage.getItem('token'),
    officerType: localStorage.getItem('officerType'),
    userType: localStorage.getItem('userType'),
    officerName: localStorage.getItem('officerName')
  });

  const getOfficerTypeColor = (type) => {
    switch (type) {
      case 'manager':
        return 'bg-blue-600';
      case 'accounter':
        return 'bg-green-600';
      case 'collection_officer':
        return 'bg-orange-500';
      default:
        return 'bg-gray-600';
    }
  };

  const getOfficerTypeLabel = (type) => {
    switch (type) {
      case 'manager':
        return 'Manager';
      case 'accounter':
        return 'Accounter';
      case 'collection_officer':
        return 'Collection Officer';
      default:
        return 'Officer';
    }
  };

  const handleLogout = () => {
    console.log('🔄 Logout initiated from OfficerNavbar...');
    console.log('👤 Current officer type:', officerType);
    console.log('👤 Current officer name:', officerName);
    console.log('📍 Current location:', window.location.pathname);
    console.log('🔄 handleLogout function called successfully');
    
    try {
      // Clear all stored data
      localStorage.removeItem('token');
      localStorage.removeItem('officerType');
      localStorage.removeItem('userType');
      localStorage.removeItem('officerName');
      localStorage.removeItem('userId');
      localStorage.removeItem('officerId');
      
      console.log('🧹 Local storage cleared successfully');
      
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
      setShowProfile(false);
      
      // Force a page reload to clear any cached state
      console.log('🚀 Redirecting to login page...');
      console.log('🔄 About to redirect to /login');
      
      // Try multiple redirect methods for better mobile compatibility
      try {
        // Primary method
        window.location.href = '/login';
      } catch (redirectError) {
        console.error('❌ Error with window.location.href:', redirectError);
        try {
          // Fallback method
          window.location.replace('/login');
        } catch (replaceError) {
          console.error('❌ Error with window.location.replace:', replaceError);
          try {
            // Alternative method
            document.location.href = '/login';
          } catch (docError) {
            console.error('❌ Error with document.location.href:', docError);
            // Last resort - try to navigate programmatically
            try {
              navigate('/login');
            } catch (navError) {
              console.error('❌ Error with navigate:', navError);
              // Final attempt - reload the page
              window.location.reload();
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still try to redirect even if there's an error
      try {
        window.location.href = '/login';
      } catch (finalError) {
        console.error('❌ Final redirect attempt failed:', finalError);
        // Last resort - reload the page
        window.location.reload();
      }
    }
  };

  const handleHomeClick = () => {
    // Navigate to appropriate dashboard based on officer type
    switch (officerType) {
      case 'manager':
        navigate('/manager-dashboard');
        break;
      case 'accounter':
        navigate('/accounter-dashboard');
        break;
      case 'collection_officer':
        navigate('/collection-dashboard');
        break;
      default:
        navigate('/');
    }
  };

     const toggleMobileMenu = () => {
     const newState = !isMobileMenuOpen;
     console.log('🔄 Mobile menu toggle:', { current: isMobileMenuOpen, new: newState });
     setIsMobileMenuOpen(newState);
   };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShowProfile(false);
  };

  // Mobile-specific logout handler
  const handleMobileLogout = () => {
    console.log('🔄 Mobile logout initiated...');
    
    // Close mobile menu first
    closeMobileMenu();
    
    // Small delay to ensure menu closes before logout
    setTimeout(() => {
      console.log('🔄 Proceeding with mobile logout...');
      handleLogout();
    }, 100);
  };

  // Close profile dropdown when clicking outside
  const handleProfileClick = () => {
    console.log('🔄 Profile button clicked, current state:', showProfile);
    const newState = !showProfile;
    console.log('🔄 Setting showProfile to:', newState);
    setShowProfile(newState);
  };

  // Handle clicking outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        console.log('🔄 Clicking outside profile dropdown, closing...');
        setShowProfile(false);
      }
    };

    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      console.log('🔄 Profile dropdown opened, click outside listener added');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfile]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Home */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-1 sm:space-x-2 text-primary hover:text-primaryDark transition-colors"
            >
              <FaHome className="text-lg sm:text-xl" />
              <span className="font-bold text-base sm:text-lg">Sai Finance</span>
            </button>
            <div className="hidden md:block">
              <span className="text-gray-500 text-sm">
                {getOfficerTypeLabel(officerType)} Dashboard
              </span>
            </div>
          </div>

          {/* Center - Page Name (All Screen Sizes) */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-sm font-bold text-gray-800">{pageName || 'Dashboard'}</h1>
            <p className="text-xs text-gray-600">{officerName}</p>
          </div>

          {/* Right side - Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Daily and Weekly Reports - Only for Managers */}
            {officerType === 'manager' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    console.log('📊 Daily Report button clicked');
                    navigate('/dash/daily-report');
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Daily Report
                </button>
                <button
                  onClick={() => {
                    console.log('📈 Weekly Report button clicked');
                    navigate('/dash/weekly-report');
                  }}
                  className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Weekly Report
                </button>
              </div>
            )}

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={handleProfileClick}
                className={`flex items-center space-x-2 p-1.5 transition-colors ${
                  showProfile 
                    ? 'text-primary bg-blue-50 rounded-lg' 
                    : 'text-gray-600 hover:text-primary'
                }`}
                title="Click to open profile menu"
              >
                <div className={`w-7 h-7 rounded-full ${getOfficerTypeColor(officerType)} flex items-center justify-center text-white font-semibold text-sm`}>
                  {officerName ? officerName.charAt(0).toUpperCase() : 'O'}
                </div>
                <span className="font-medium text-sm">{officerName}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showProfile ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border-2 border-blue-300 z-50"
                  style={{ zIndex: 9999 }}
                >
                  <div className="p-4 bg-gradient-to-br from-white to-blue-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 rounded-full ${getOfficerTypeColor(officerType)} flex items-center justify-center text-white font-semibold text-lg`}>
                        {officerName ? officerName.charAt(0).toUpperCase() : 'O'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{officerName}</h3>
                        <p className="text-sm text-gray-500">{getOfficerTypeLabel(officerType)}</p>
                      </div>
                    </div>
                     <button
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         handleLogout();
                       }}
                       className="w-full flex items-center justify-center space-x-2 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 cursor-pointer font-medium shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-red-600"
                       title="Click to logout"
                     >
                       <FaSignOutAlt className="text-lg" />
                       <span className="text-lg font-semibold">Logout</span>
                     </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-1.5 text-gray-600 hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? (
              <HiX className="text-lg" />
            ) : (
              <HiMenu className="text-lg" />
            )}
          </button>
        </div>
      </div>

                           {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg absolute top-16 left-0 right-0"
            style={{ zIndex: 9999 }}
          >
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Home Button */}
            <button
              onClick={() => {
                handleHomeClick();
                closeMobileMenu();
              }}
              className="w-full flex items-center justify-center space-x-3 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FaHome />
              <span>Go to Dashboard</span>
            </button>

            {/* Mobile Daily and Weekly Reports - Only for Managers */}
            {officerType === 'manager' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    console.log('📊 Mobile Daily Report button clicked');
                    navigate('/dash/daily-report');
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center justify-center space-x-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>📊</span>
                  <span>Daily Report</span>
                </button>
                <button
                  onClick={() => {
                    console.log('📈 Mobile Weekly Report button clicked');
                    navigate('/dash/weekly-report');
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center justify-center space-x-3 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <span>📈</span>
                  <span>Weekly Report</span>
                </button>
              </div>
            )}

            

            {/* Mobile Profile & Logout */}
            <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${getOfficerTypeColor(officerType)} flex items-center justify-center text-white font-semibold text-lg`}>
                  {officerName ? officerName.charAt(0).toUpperCase() : 'O'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{officerName}</h3>
                  <p className="text-sm text-gray-500">{getOfficerTypeLabel(officerType)}</p>
                </div>
              </div>
              
                {/* Mobile Logout Button - Simplified */}
               <button
                 onClick={() => {
                   // Close mobile menu first
                   closeMobileMenu();
                   
                   // Then logout immediately
                   handleLogout();
                 }}
                 className="w-full flex items-center justify-center space-x-3 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 cursor-pointer font-medium shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-red-600"
                 title="Click to logout"
               >
                 <FaSignOutAlt className="text-lg" />
                 <span className="text-lg font-semibold">Logout</span>
               </button>
               
               {/* Additional Logout Info */}
               <p className="text-xs text-gray-500 text-center mt-2">
                 Click to securely log out and clear your session
               </p>
            </div>
          </div>
        </motion.div>
      )}

                           {/* Backdrop for dropdowns - Temporarily disabled for mobile logout testing */}
        {showProfile && (
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => {
              setShowProfile(false);
            }}
          />
        )}


    </motion.nav>
  );
};

export default OfficerNavbar;
