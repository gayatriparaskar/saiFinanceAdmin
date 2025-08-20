import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const EnhancedCardDataStats = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
  gradientFrom = "from-purple-500",
  gradientTo = "to-indigo-500",
  animationDelay = 0,
  isLoading = false,
  onClick,
  bgColor = "bg-white",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  // Animate number counting effect
  useEffect(() => {
    if (typeof total === 'number') {
      let start = 0;
      const end = total;
      const duration = 1000; // 1 second
      const increment = end / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedTotal(end);
          clearInterval(timer);
        } else {
          setAnimatedTotal(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else {
      setAnimatedTotal(total);
    }
  }, [total]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: animationDelay,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hover: {
      rotate: 360,
      scale: 1.2,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  const numberVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: animationDelay + 0.3 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-3xl border border-gray-200 ${bgColor} p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group`}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}
      />

      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Icon Circle with enhanced animation */}
      <motion.div
        variants={iconVariants}
        className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white shadow-lg text-2xl mb-4`}
      >
        {children}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white to-transparent opacity-30"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {/* Animated number */}
        <motion.h4
          variants={numberVariants}
          className="text-3xl font-extrabold text-gray-900 mb-2"
        >
          {typeof animatedTotal === 'number' && !isNaN(animatedTotal) 
            ? animatedTotal.toLocaleString() 
            : animatedTotal}
        </motion.h4>
        
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 0.5 }}
          className="text-sm font-medium text-gray-600 block mb-3"
        >
          {title}
        </motion.span>

        {/* Rate Indicator with enhanced animation */}
        {(levelUp || levelDown) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: animationDelay + 0.7 }}
            className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full ${
              levelUp ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
            }`}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {rate}
            </motion.span>
            {levelUp && (
              <motion.svg
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                width="12"
                height="12"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 0L11 6H7V12H5V6H1L6 0Z" />
              </motion.svg>
            )}
            {levelDown && (
              <motion.svg
                animate={{ y: [2, -2, 2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                width="12"
                height="12"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 12L1 6H5V0H7V6H11L6 12Z" />
              </motion.svg>
            )}
          </motion.div>
        )}
      </div>

      {/* Shine effect on hover */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform skew-x-12"
      />
    </motion.div>
  );
};

export default EnhancedCardDataStats;
