import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { useUser } from "../../../hooks/use-user";
import { IoSettings } from "react-icons/io5";
import { MdLanguage } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";
import { FiKey } from "react-icons/fi";
import Logo from "../../../Images/Sai-finance-logo.png"
import { useTranslation } from "react-i18next";
import { useLocalTranslation } from "../../../hooks/useLocalTranslation";
import PasswordChangeModal from "../../../components/PasswordChangeModal";
import { changeAdminPassword } from "../../../services/userService";

const ManagerNavbar = () => {
  const { data: user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { t } = useLocalTranslation();
  const [pro, setPro] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMenuOpen2, setIsMenuOpen2] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Password change modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setPro(user.profilePicUrl);
    }
  }, [user]);

  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const toggleMobileMenu = () => {
    console.log('Mobile menu toggle clicked. Current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
    console.log('Mobile menu state set to:', !isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    localStorage.setItem('language', lng);
    closeDropdown();
    closeMobileMenu();
  };

  const handlePasswordChange = async (passwordData) => {
    setPasswordChangeLoading(true);
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    try {
      await changeAdminPassword(passwordData);
      setPasswordChangeSuccess('Password changed successfully!');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordChangeSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordChangeError(
        error.response?.data?.message || 
        error.message || 
        'Failed to change password. Please try again.'
      );
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
  };

  const navVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * index,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: -10 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const isActive = (path) => location.pathname === path;

  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path.includes('/manager-dashboard') && path === '/manager-dashboard') return t('Home');
    if (path.includes('/manager-dashboard/loan-account')) return t('Loan Account');
    if (path.includes('/manager-dashboard/overdue-loans')) return t('Overdue Loans');
    if (path.includes('/manager-dashboard/saving-account')) return t('Saving Account');
    if (path.includes('/manager-dashboard/officer')) return t('Officer Controls');
    if (path.includes('/manager-dashboard/reports')) return t('Reports');
    if (path.includes('/manager-dashboard/payment')) return t('Payment');
    if (path.includes('/manager-dashboard/payment-request')) return t('Payment Request');
    if (path.includes('/manager-dashboard/create-loan-user')) return t('Create Loan User');
    if (path.includes('/manager-dashboard/create-saving-user')) return t('Create Saving User');
    if (path.includes('/manager-dashboard/view-loan-user')) return t('View Loan User');
    if (path.includes('/manager-dashboard/view-saving-user')) return t('View Saving User');
    if (path.includes('/manager-dashboard/create-officer')) return t('Create Officer');
    if (path.includes('/manager-dashboard/view-officer')) return t('View Officer');
    if (path.includes('/manager-dashboard/add-daily-collection')) return t('Add Collection');
    if (path.includes('/manager-dashboard/add-saving-collection')) return t('Add Saving Collection');
    return t('Manager Dashboard');
  };

  const navigationItems = [
    { name: t("Home"), path: "/manager-dashboard" },
    { name: t("Loan Account"), path: "/manager-dashboard/loan-account" },
    { name: t("Overdue Loans"), path: "/manager-dashboard/overdue-loans" },
    { name: t("Saving Account"), path: "/manager-dashboard/saving-account" },
    { name: t("Officer Controls"), path: "/manager-dashboard/officer" },
    { name: t("Expenses"), path: "/manager-dashboard/expenses" },
    { name: t("Reports"), path: "/manager-dashboard/reports" }
  ];

  return (
    <motion.nav 
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex items-center justify-between px-4 sm:px-6 py-0 shadow-lg fixed top-0 left-0 right-0 z-[99999] bg-white/95 backdrop-blur-md border-b-2 border-primary/10 h-16 sm:h-20"
    >
      {/* Logo with animation */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="text-xl font-bold text-bggr w-10 sm:w-12 flex items-center"
      >
        <img src={Logo} alt="Sai Finance" className="w-full" />
      </motion.div>

      {/* Desktop Menu Items */}
      <ul className="hidden lg:flex items-center space-x-4 xl:space-x-6 font-semibold">
        {navigationItems.map((item, index) => (
          <motion.li
            key={item.name}
            custom={index}
            variants={menuItemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex items-center"
          >
            <Link 
              to={item.path} 
              className={`relative px-2 sm:px-3 py-2 rounded-lg transition-all duration-300 flex items-center text-sm xl:text-base ${
                isActive(item.path) 
                  ? "text-primary bg-primary/10 font-bold" 
                  : "text-gray-700 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {item.name}
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          </motion.li>
        ))}
      </ul>

      {/* Desktop Right Side Controls */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Language Switcher */}
        <motion.div className="relative flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleDropdown("language")}
            className="flex items-center gap-2 text-xs bg-secondary rounded-lg p-1.5 text-white font-bold focus:ring-2 focus:ring-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <MdLanguage size={14} />
            <span className="text-xs">{currentLanguage === 'en' ? 'EN' : 'हि'}</span>
            <motion.div
              animate={{ rotate: openDropdown === "language" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <MdKeyboardArrowDown size={14} />
            </motion.div>
          </motion.button>

          {openDropdown === "language" && (
            <motion.ul
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute right-0 mt-1 w-28 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden z-[10000]"
            >
              <motion.li
                whileHover={{ backgroundColor: "#8b5cf6", color: "white" }}
                transition={{ duration: 0.2 }}
                className="p-2 hover:text-white cursor-pointer transition-all duration-200 flex items-center gap-2 text-sm"
                onClick={() => changeLanguage('en')}
              >
                <span className="text-sm">🇺🇸</span>
                <span>English</span>
              </motion.li>
              <motion.li
                whileHover={{ backgroundColor: "#8b5cf6", color: "white" }}
                transition={{ duration: 0.2 }}
                className="p-2 hover:text-white cursor-pointer transition-all duration-200 flex items-center gap-2 text-sm"
                onClick={() => changeLanguage('hi')}
              >
                <span className="text-sm">🇮🇳</span>
                <span>हिंदी</span>
              </motion.li>
            </motion.ul>
          )}
        </motion.div>

        {/* Settings Button */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen2(!isMenuOpen2)}
          className="flex items-center text-sm bg-primary rounded-lg p-1.5 text-white text-lg font-bold focus:ring-2 focus:ring-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <IoSettings size={18} />
        </motion.button>
      </div>

      {/* Center - Page Name (Mobile Only) */}
      <div className="lg:hidden flex flex-col items-center text-center">
        <h1 className="text-sm font-bold text-gray-800">{getCurrentPageName()}</h1>
        <p className="text-xs text-gray-600">Manager Dashboard</p>
      </div>

      {/* Mobile Menu Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleMobileMenu}
        className="lg:hidden flex items-center p-1.5 text-gray-700 hover:text-primary transition-colors duration-200 border border-gray-300 rounded-lg bg-white shadow-sm"
      >
        {isMobileMenuOpen ? (
          <HiX size={20} className="text-primary" />
        ) : (
          <HiMenu size={20} />
        )}
      </motion.button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          variants={mobileMenuVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bg-white z-[10000] overflow-y-auto border-t border-gray-200 shadow-lg"
        >
          <div className="p-4 space-y-3">
            {/* Mobile Navigation Items */}
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={item.path} 
                  onClick={closeMobileMenu}
                  className={`block w-full px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium ${
                    isActive(item.path) 
                      ? "text-primary bg-primary/10 border-l-4 border-primary" 
                      : "text-gray-700 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}

            {/* Mobile Language Switcher */}
            <div className="border-t border-gray-200 pt-3">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t('Language')}
              </h3>
              <div className="px-3 space-y-1.5">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-all duration-200 text-sm ${
                    currentLanguage === 'en' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-primary/5'
                  }`}
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-all duration-200 text-sm ${
                    currentLanguage === 'hi' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-primary/5'
                  }`}
                >
                  🇮🇳 हिंदी
                </button>
              </div>
            </div>

            {/* Mobile Settings */}
            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={() => {
                  setIsMenuOpen2(!isMenuOpen2);
                  closeMobileMenu();
                }}
                className="w-full text-left px-3 py-2.5 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
              >
                <IoSettings size={16} />
                {t('Settings')}
              </button>
            </div>

            {/* Mobile Profile Section */}
            <div className="border-t border-gray-200 pt-3">
              <div className="px-3 py-2.5">
                <div className="flex items-center space-x-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user?.name || 'Manager'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'manager@example.com'}</p>
                  </div>
                </div>
                
                {/* Change Password Button */}
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs mb-2"
                >
                  <FiKey size={14} />
                  <span>Change Password</span>
                </button>
                
                {/* Logout Button */}
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userType");
                    localStorage.removeItem("officerType");
                    localStorage.removeItem("officerName");
                    navigate("/login");
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs"
                >
                  <IoMdLogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* User Dropdown */}
      {isMenuOpen2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-72 absolute z-[10000] right-4 top-16 sm:top-20 border border-primary/20 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-primary/5 p-4 relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="absolute top-2 right-2 p-1 text-primary hover:text-primary/70 transition-colors duration-200"
              onClick={() => setIsMenuOpen2(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <div className="flex flex-col items-center text-center mt-2">
              <motion.div 
                // whileHover={{ scale: 1.05 }}
                // className="w-12 h-12 rounded-full border-3 border-primary/20 overflow-hidden mb-2"
              >
                {/* <img src={pro} alt="Profile" className="w-full h-full object-cover" /> */}
              </motion.div>

              <div className="text-gray-900">
                <h1 className="text-lg font-bold">{user?.name || 'Manager'}</h1>
                <p className="text-sm text-gray-600">{user?.email || 'manager@example.com'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Change Password Button */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer group"
              onClick={() => {
                setIsPasswordModalOpen(true);
                setIsMenuOpen2(false);
              }}
            >
              <div>
                <p className="text-sm text-blue-600 font-semibold">Change Password</p>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="text-blue-500 group-hover:text-blue-600"
              >
                <FiKey size={20} />
              </motion.div>
            </motion.div>

            {/* Logout Button */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200 cursor-pointer group"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userType");
                localStorage.removeItem("officerType");
                localStorage.removeItem("officerName");
                navigate("/login");
              }}
            >
              <div>
                <p className="text-sm text-red-600 font-semibold">{t("LogOut", "Logout")}</p>
                <p className="text-xs text-gray-500">{t("Sign out of your account", "Sign out of your account")}</p>
              </div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="text-red-500 group-hover:text-red-600"
              >
                <IoMdLogOut size={20} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Backdrop for dropdown */}
      {isMenuOpen2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/10 z-[9998]"
          onClick={() => setIsMenuOpen2(false)}
        />
      )}

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 z-[9997] lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        onSubmit={handlePasswordChange}
        isLoading={passwordChangeLoading}
        error={passwordChangeError}
        success={passwordChangeSuccess}
      />
    </motion.nav>
  );
};

export default ManagerNavbar;