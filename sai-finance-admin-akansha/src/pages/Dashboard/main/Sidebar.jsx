import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MdDashboard, MdKeyboardArrowDown } from "react-icons/md";
import { FaAward, FaWallet } from "react-icons/fa";
import { IoNewspaperOutline } from "react-icons/io5";
import { BsGlobe } from "react-icons/bs";
import { SiHelpscout } from "react-icons/si";
import { LuLogOut } from "react-icons/lu";
import Layout from "./Layout";
import { useUser } from "../../../hooks/use-user";
import { FaArtstation } from "react-icons/fa6";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { RiArrowLeftRightFill } from "react-icons/ri";
import { FaRegCircleDot } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import { FaUsers } from "react-icons/fa";
import { FaBookOpenReader } from "react-icons/fa6";
import { GiTakeMyMoney } from "react-icons/gi";

const Sidebar = () => {
  const { data: user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen4, setIsOpen4] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [t, i18n] = useTranslation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const toggleDropdown2 = () => {
    setIsOpen2(!isOpen2);
  };
  const toggleDropdown3 = () => {
    setIsOpen3(!isOpen3);
  };
  const toggleDropdown4 = () => {
    setIsOpen4(!isOpen4);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setShowModal(false);
  };

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "flex items-center p-3 text-white bg-primary rounded-xl group font-semibold transition-all duration-300"
      : "flex items-center p-3 text-gray-700 rounded-xl hover:bg-primary/10 hover:text-primary group font-semibold transition-all duration-300";
  };

  const getDropdownItemClass = (path) => {
    return location.pathname === path
      ? "flex items-center w-full pl-8 text-primary bg-primary/10 font-semibold py-2 rounded-lg cursor-pointer transition-all duration-300"
      : "flex items-center w-full pl-8 text-gray-600 hover:text-primary hover:bg-primary/5 font-semibold py-2 rounded-lg cursor-pointer transition-all duration-300";
  };

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const dropdownVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        className="p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden flex hover:bg-gray-100 transition-colors duration-200"
      >
        <svg
          className="w-8 h-8"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </motion.button>

      <motion.aside
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        id="sidebar-multi-level-sidebar"
        className={`fixed top-16 left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
        aria-label="Sidebar"
      >
        <div className="h-full py-4 overflow-y-auto bg-white shadow-2xl border-r border-gray-200">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={closeSidebar}
            className="absolute top-2 right-2 p-2 text-gray-500 rounded-full hover:bg-gray-200 transition-colors duration-200 sm:hidden"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
          
          <motion.ul 
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3 font-medium p-4"
          >
            <motion.li variants={itemVariants}>
              <Link to="/dash/home" className={getLinkClass("/dash/home")}>
                <MdDashboard className="w-6 h-6 transition duration-200" />
                <span className="ms-3">Home</span>
              </Link>
            </motion.li>
            
            <motion.div variants={itemVariants} className="border-t border-gray-200 pt-3"></motion.div>
            
            <motion.li variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={toggleDropdown}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  isOpen ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <div className="flex items-center">
                  <FaUsers className="w-6 h-6 transition duration-200" />
                  <span className="ms-3 font-semibold">User Controls</span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdKeyboardArrowDown size={24} />
                </motion.div>
              </motion.div>
              
              <motion.ul
                variants={dropdownVariants}
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
                className="space-y-1 mt-2 overflow-hidden"
              >
                <Link to="/dash/demo-user">
                  <li className={getDropdownItemClass("/dash/demo-user")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Demo Users
                  </li>
                </Link>
                <Link to="/dash/active-user">
                  <li className={getDropdownItemClass("/dash/active-user")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Active Users
                  </li>
                </Link>
                <Link to="/dash/daily-user">
                  <li className={getDropdownItemClass("/dash/daily-user")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Daily Users
                  </li>
                </Link>
                <Link to="/dash/hold-user">
                  <li className={getDropdownItemClass("/dash/hold-user")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Hold Users
                  </li>
                </Link>
              </motion.ul>
            </motion.li>
            
            <motion.div variants={itemVariants} className="border-t border-gray-200 pt-3"></motion.div>
            
            <motion.li variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={toggleDropdown2}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  isOpen2 ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <div className="flex items-center">
                  <FaBookOpenReader className="w-6 h-6 transition duration-200" />
                  <span className="ms-3 font-semibold">Course Controls</span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen2 ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdKeyboardArrowDown size={24} />
                </motion.div>
              </motion.div>
              
              <motion.ul
                variants={dropdownVariants}
                initial="hidden"
                animate={isOpen2 ? "visible" : "hidden"}
                className="space-y-1 mt-2 overflow-hidden"
              >
                <Link to="/dash/view-course">
                  <li className={getDropdownItemClass("/dash/view-course")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    View Course
                  </li>
                </Link>
                <Link to="/dash/create-course">
                  <li className={getDropdownItemClass("/dash/create-course")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Create Course
                  </li>
                </Link>
              </motion.ul>
            </motion.li>
            
            <motion.div variants={itemVariants} className="border-t border-gray-200 pt-3"></motion.div>
            
            <motion.li variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={toggleDropdown4}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  isOpen4 ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <div className="flex items-center">
                  <FaAward className="w-6 h-6 transition duration-200" />
                  <span className="ms-3 font-semibold">Contest Controls</span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen4 ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdKeyboardArrowDown size={24} />
                </motion.div>
              </motion.div>
              
              <motion.ul
                variants={dropdownVariants}
                initial="hidden"
                animate={isOpen4 ? "visible" : "hidden"}
                className="space-y-1 mt-2 overflow-hidden"
              >
                <Link to="/dash/view-contest">
                  <li className={getDropdownItemClass("/dash/view-contest")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    View Contest
                  </li>
                </Link>
                <Link to="/dash/add-contest">
                  <li className={getDropdownItemClass("/dash/add-contest")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Add Contest
                  </li>
                </Link>
              </motion.ul>
            </motion.li>
            
            <motion.div variants={itemVariants} className="border-t border-gray-200 pt-3"></motion.div>
            
            <motion.li variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={toggleDropdown3}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  isOpen3 ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <div className="flex items-center">
                  <GiTakeMyMoney className="w-6 h-6 transition duration-200" />
                  <span className="ms-3 font-semibold">Payment Controls</span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen3 ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdKeyboardArrowDown size={24} />
                </motion.div>
              </motion.div>
              
              <motion.ul
                variants={dropdownVariants}
                initial="hidden"
                animate={isOpen3 ? "visible" : "hidden"}
                className="space-y-1 mt-2 overflow-hidden"
              >
                <Link to="/dash/payment">
                  <li className={getDropdownItemClass("/dash/payment")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Payment
                  </li>
                </Link>
                <Link to="/dash/payment-request">
                  <li className={getDropdownItemClass("/dash/payment-request")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Payment Request
                  </li>
                </Link>
                <Link to="/dash/payment-history">
                  <li className={getDropdownItemClass("/dash/payment-history")}>
                    <MdOutlineKeyboardDoubleArrowRight className="text-primary mr-3" size={20} />
                    Payment History
                  </li>
                </Link>
              </motion.ul>
            </motion.li>
            
            <motion.div variants={itemVariants} className="border-t border-gray-200 pt-3"></motion.div>

            <motion.li
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
              <div className="flex items-center p-3 text-red-600 rounded-xl hover:bg-red-50 group font-semibold cursor-pointer transition-all duration-300">
                <LuLogOut className="w-6 h-6 transition duration-200" />
                <span className="ms-3">Logout</span>
              </div>
            </motion.li>
          </motion.ul>
        </div>
      </motion.aside>

      <div className="sm:ml-64 lg:py-8 h-full bg-bgWhite">
        <Layout />
      </div>
    </>
  );
};

export default Sidebar;
