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
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Icon Circle */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md">
        {children}
      </div>

      {/* Content */}
      <div className="mt-6 flex items-end justify-between">
        <div>
          {/* Animated number */}
          <motion.h4
            key={total}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold text-gray-900"
          >
            {total}
          </motion.h4>
          <span className="text-sm font-medium text-gray-500">{title}</span>
        </div>

        {/* Rate Indicator */}
        {(levelUp || levelDown) && (
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-1 text-sm font-semibold ${
              levelUp ? "text-green-500" : "text-red-500"
            }`}
          >
            {rate}
            {levelUp && (
              <svg
                width="12"
                height="12"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 0L11 6H7V12H5V6H1L6 0Z" />
              </svg>
            )}
            {levelDown && (
              <svg
                width="12"
                height="12"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 12L1 6H5V0H7V6H11L6 12Z" />
              </svg>
            )}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

export default CardDataStats;
