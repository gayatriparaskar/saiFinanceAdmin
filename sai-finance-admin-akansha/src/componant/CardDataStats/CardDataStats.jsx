import { motion } from "framer-motion";

const CardDataStats = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        hover: { duration: 0.3 }
      }}
      className="relative rounded-3xl border-0 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>

      <div className="relative z-10">
        {/* Icon Circle with enhanced animation */}
        <motion.div 
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primaryLight to-secondary text-white shadow-lg mb-4 text-2xl"
        >
          {children}
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          
          {/* Animated number */}
          <motion.h2
            key={total}
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              type: "spring", 
              stiffness: 200,
              delay: 0.1 
            }}
            className="text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300"
          >
            {total}
          </motion.h2>

          {/* Rate Indicator with enhanced styling */}
          {(levelUp || levelDown) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                levelUp 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              <motion.div
                animate={{ 
                  y: levelUp ? [-1, -3, -1] : [1, 3, 1],
                  scale: [1, 1.1, 1] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="flex items-center"
              >
                {levelUp && (
                  <svg
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="drop-shadow-sm"
                  >
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                )}
                {levelDown && (
                  <svg
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="drop-shadow-sm"
                  >
                    <path d="M12 22L10.91 15.74L4 15L10.91 14.26L12 8L13.09 14.26L20 15L13.09 15.74L12 22Z"/>
                  </svg>
                )}
              </motion.div>
              <span className="font-bold">{rate}</span>
            </motion.div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
        <div className="absolute bottom-4 right-6 w-1 h-1 bg-secondary rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
      </div>
    </motion.div>
  );
};

export default CardDataStats;
