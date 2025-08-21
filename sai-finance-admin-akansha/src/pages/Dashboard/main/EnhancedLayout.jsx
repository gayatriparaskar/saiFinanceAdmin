import React from 'react'
import { motion } from 'framer-motion'
import EnhancedDashRoute from '../route/EnhancedDashroute'

function EnhancedLayout() {
  return (
    <motion.div 
      className='bg-gradient-to-br from-primaryBg via-white to-secondaryBg pt-16 pb-10'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <EnhancedDashRoute/>
    </motion.div>
  )
}

export default EnhancedLayout
