import { motion } from "framer-motion";

const CardDataStats = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20
      }}
      className="relative rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden group max-w-xs"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Content */}
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          
          {/* Animated number */}
          <motion.h2
            key={total}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 200,
              delay: 0.1
            }}
            className="text-xl font-bold text-gray-900 group-hover:text-primaryDark transition-colors duration-300"
          >
            {total}
          </motion.h2>

          {/* Rate Indicator with solid colors */}
          {(levelUp || levelDown) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                levelUp 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
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
                    width="12"
                    height="12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="drop-shadow-sm"
                  >
                    <path d="M7 14L12 9L17 14H7Z"/>
                  </svg>
                )}
                {levelDown && (
                  <svg
                    width="12"
                    height="12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="drop-shadow-sm"
                  >
                    <path d="M17 10L12 15L7 10H17Z"/>
                  </svg>
                )}
              </motion.div>
              <span className="font-bold">{rate}</span>
            </motion.div>
          )}
        </div>

        {/* Decorative elements with primary/secondary colors */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
        <div className="absolute bottom-3 right-4 w-1 h-1 bg-secondary rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
};

export default CardDataStats;
