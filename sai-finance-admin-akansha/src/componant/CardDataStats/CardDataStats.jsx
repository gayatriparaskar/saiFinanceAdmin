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
        boxShadow: "0 25px 50px -12px rgba(13, 148, 136, 0.25)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        hover: { duration: 0.3 }
      }}
      className="relative rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-500 overflow-hidden group"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Icon Circle with primary/secondary colors */}
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-white shadow-lg mb-4 text-3xl group-hover:bg-secondary transition-colors duration-300"
        >
          {children}
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide group-hover:text-primary transition-colors duration-300">
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
            className="text-4xl font-black text-gray-900 group-hover:text-primaryDark transition-colors duration-300"
          >
            {total}
          </motion.h2>

          {/* Rate Indicator with solid colors */}
          {(levelUp || levelDown) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                levelUp 
                  ? "bg-green text-white" 
                  : "bg-redC text-white"
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
                    <path d="M7 14L12 9L17 14H7Z"/>
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
                    <path d="M17 10L12 15L7 10H17Z"/>
                  </svg>
                )}
              </motion.div>
              <span className="font-bold">{rate}</span>
            </motion.div>
          )}
        </div>

        {/* Decorative elements with primary/secondary colors */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
        <div className="absolute bottom-4 right-6 w-1.5 h-1.5 bg-secondary rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
        <div className="absolute top-1/2 left-4 w-1 h-1 bg-primary rounded-full opacity-20 group-hover:opacity-50 transition-opacity duration-300"></div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
};

export default CardDataStats;
