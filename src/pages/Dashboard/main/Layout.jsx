import React from 'react'
import { motion } from 'framer-motion'
import DashRoute from '../route/DashRoute'

function Layout() {
  return (
    <motion.div 
      className='bg-gradient-to-br from-primaryBg via-white to-secondaryBg pt-16 pb-10'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <DashRoute/>
    </motion.div>
  )
}

export default Layout
