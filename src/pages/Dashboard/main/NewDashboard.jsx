import React from 'react'
import { motion } from 'framer-motion'
import NewNavbar from './NewNavbar'
import Layout from './Layout'

function NewDashboard() {
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
