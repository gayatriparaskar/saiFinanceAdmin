import React from 'react'
import { motion } from 'framer-motion'
import DashRoute from '../route/DashRoute'

function Layout() {
  return (
    <motion.div 
      className='bg-gradient-to-br from-primaryBg via-white to-secondaryBg pt-8 sm:pt-20 pb-6 sm:pb-10 min-h-screen'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <DashRoute/>
    </motion.div>
  )
}

export default Layout
