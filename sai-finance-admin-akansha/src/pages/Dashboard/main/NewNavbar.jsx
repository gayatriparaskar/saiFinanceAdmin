import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { useUser } from "../../../hooks/use-user";
import { IoSettings } from "react-icons/io5";
import { MdLanguage } from "react-icons/md";
import Logo from "../../../Images/Sai-finance-logo.png"
import { useTranslation } from "react-i18next";

const NewNavbar = () => {
  const { data: user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [pro, setPro] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMenuOpen2, setIsMenuOpen2] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    localStorage.setItem('language', lng);
    closeDropdown();
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
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

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav 
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="w-full top-0 flex items-center justify-between bg-white p-2 shadow-lg fixed z-50 border-b-2 border-primary/10"
    >
      {/* Logo with animation */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="text-xl font-bold text-bgBlue w-16"
      >
        <img src={Logo} alt="Sai Finance" className="w-full" />
      </motion.div>

      {/* Menu Items with staggered animation */}
      <ul className="flex space-x-8 font-semibold">
        {[
          { name: t("header_menu.home", "Home"), path: "/dash/home" },
          { name: t("Loan Account", "Loan Account"), path: "/dash/loan-account" },
          { name: t("Saving Account", "Saving Account"), path: "/dash/saving-account" },
          { name: t("Officer Controls", "Officer Controls"), path: "/dash/officer" }
        ].map((item, index) => (
          <motion.li
            key={item.name}
            custom={index}
            variants={menuItemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Link 
              to={item.path} 
              className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
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

        {/* Payment Controls Dropdown */}
        <motion.li 
          className="relative z-100"
          custom={4}
          variants={menuItemVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <motion.button 
            onClick={() => toggleDropdown("payment")} 
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
              openDropdown === "payment" 
                ? "text-primary bg-primary/10" 
                : "text-gray-700 hover:text-primary hover:bg-primary/5"
            }`}
          >
            Payment Controls 
            <motion.div
              animate={{ rotate: openDropdown === "payment" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <MdKeyboardArrowDown size={20} />
            </motion.div>
          </motion.button>
          
          {openDropdown === "payment" && (
            <motion.ul
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute left-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden"
            >
              <Link to="/dash/payment" onClick={closeDropdown}>
                <motion.li 
                  whileHover={{ backgroundColor: "#0d9488", color: "white" }}
                  transition={{ duration: 0.2 }}
                  className="p-3 hover:text-white cursor-pointer transition-all duration-200"
                >
                  Payment
                </motion.li>
              </Link>
              <Link to="/dash/payment-request" onClick={closeDropdown}>
                <motion.li 
                  whileHover={{ backgroundColor: "#0d9488", color: "white" }}
                  transition={{ duration: 0.2 }}
                  className="p-3 hover:text-white cursor-pointer transition-all duration-200"
                >
                  Payment Request
                </motion.li>
              </Link>
            </motion.ul>
          )}
        </motion.li>
      </ul>

      {/* Language Switcher and Settings */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <motion.div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleDropdown("language")}
            className="flex items-center gap-2 text-sm bg-secondary rounded-xl p-2 text-white font-bold focus:ring-2 focus:ring-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <MdLanguage size={20} />
            <span className="text-xs">{currentLanguage === 'en' ? 'EN' : 'हि'}</span>
            <motion.div
              animate={{ rotate: openDropdown === "language" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <MdKeyboardArrowDown size={16} />
            </motion.div>
          </motion.button>

          {openDropdown === "language" && (
            <motion.ul
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute right-0 mt-2 w-32 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden z-50"
            >
              <motion.li
                whileHover={{ backgroundColor: "#8b5cf6", color: "white" }}
                transition={{ duration: 0.2 }}
                className="p-3 hover:text-white cursor-pointer transition-all duration-200 flex items-center gap-2"
                onClick={() => changeLanguage('en')}
              >
                <span className="text-sm">🇺🇸</span>
                <span>English</span>
              </motion.li>
              <motion.li
                whileHover={{ backgroundColor: "#8b5cf6", color: "white" }}
                transition={{ duration: 0.2 }}
                className="p-3 hover:text-white cursor-pointer transition-all duration-200 flex items-center gap-2"
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
          className="flex text-sm bg-primary rounded-xl p-2 text-white text-xl font-bold focus:ring-2 focus:ring-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <IoSettings size={28} />
        </motion.button>
      </div>

      {/* User Dropdown */}
      {isMenuOpen2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-72 absolute z-50 right-4 top-20 border border-primary/20 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-primary/5 p-4 relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="absolute top-2 right-2 p-2 text-primary hover:text-primary/70 transition-colors duration-200"
              onClick={() => setIsMenuOpen2(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <div className="flex flex-col items-center text-center mt-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-full border-3 border-primary/20 overflow-hidden mb-3"
              >
                <img src={pro} alt="Profile" className="w-full h-full object-cover" />
              </motion.div>

              <div className="text-gray-900">
                <h1 className="text-lg font-bold">{user?.name}</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200 cursor-pointer group"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
              <div>
                <p className="text-sm text-red-600 font-semibold">Logout</p>
                <p className="text-xs text-gray-500">Sign out of your account</p>
              </div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="text-red-500 group-hover:text-red-600"
              >
                <IoMdLogOut size={24} />
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
          className="fixed inset-0 bg-black/10 z-40"
          onClick={() => setIsMenuOpen2(false)}
        />
      )}
    </motion.nav>
  );
};

export default NewNavbar;
