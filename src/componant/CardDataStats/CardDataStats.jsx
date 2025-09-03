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
      className="relative rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 lg:p-4 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden group w-full h-32 sm:h-36 lg:h-40 flex flex-col justify-between"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Content */}
        <div className="space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-between">
          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide group-hover:text-primary transition-colors duration-300 leading-tight">
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
            className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-primaryDark transition-colors duration-300 leading-tight"
          >
            {total}
          </motion.h2>

          {/* Rate Indicator with solid colors - Centered and Smaller */}
          <div className="flex justify-center">
            {(levelUp || levelDown) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-md text-xs font-medium ${
                  levelUp 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}
              >
                <motion.div
                  animate={{ 
                    y: levelUp ? [-1, -2, -1] : [1, 2, 1],
                    scale: [1, 1.05, 1] 
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
                      width="10"
                      height="10"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="drop-shadow-sm"
                    >
                      <path d="M7 14L12 9L17 14H7Z"/>
                    </svg>
                  )}
                  {levelDown && (
                    <svg
                      width="10"
                      height="10"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="drop-shadow-sm"
                    >
                      <path d="M17 10L12 15L7 10H17Z"/>
                    </svg>
                  )}
                </motion.div>
                <span className="font-medium text-xs">{rate}</span>
              </motion.div>
            )}
          </div>
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
