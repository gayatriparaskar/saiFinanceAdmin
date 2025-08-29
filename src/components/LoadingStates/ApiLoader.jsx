import React from 'react';
import { motion } from 'framer-motion';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

const ApiLoader = ({ 
  message = "Loading...", 
  size = "lg", 
  showMessage = true,
  variant = "default" 
}) => {
  const variants = {
    default: {
      bg: "white",
      borderColor: "gray.200",
      spinnerColor: "blue.500"
    },
    minimal: {
      bg: "transparent",
      borderColor: "transparent",
      spinnerColor: "blue.500"
    },
    overlay: {
      bg: "rgba(255, 255, 255, 0.9)",
      borderColor: "transparent",
      spinnerColor: "blue.500"
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        p={8}
        textAlign="center"
        bg={currentVariant.bg}
        borderRadius="lg"
        border="1px"
        borderColor={currentVariant.borderColor}
        minH="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Spinner
              size={size}
              color={currentVariant.spinnerColor}
              thickness="4px"
            />
          </motion.div>
          
          {showMessage && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Text fontSize="md" color="gray.600" fontWeight="medium">
                {message}
              </Text>
            </motion.div>
          )}
        </VStack>
      </Box>
    </motion.div>
  );
};

export default ApiLoader;
