import React from 'react';
import { motion } from 'framer-motion';
import { Button, Box, Text, VStack, Icon } from '@chakra-ui/react';
import { MdError, MdRefresh, MdWifiOff } from 'react-icons/md';

const ApiErrorHandler = ({ 
  error, 
  onRetry, 
  message = "Something went wrong", 
  showRetryButton = true 
}) => {
  const getErrorIcon = () => {
    if (error?.code === 'ECONNABORTED') return MdRefresh;
    if (error?.message === 'Network Error') return MdWifiOff;
    return MdError;
  };

  const getErrorMessage = () => {
    if (error?.code === 'ECONNABORTED') {
      return "Request timed out. The server might be busy.";
    }
    if (error?.message === 'Network Error') {
      return "Cannot connect to server. Please check your internet connection.";
    }
    if (error?.response?.status >= 500) {
      return "Server error. Please try again later.";
    }
    return message;
  };

  const getErrorColor = () => {
    if (error?.code === 'ECONNABORTED') return "orange.500";
    if (error?.message === 'Network Error') return "red.500";
    return "red.500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        p={8}
        textAlign="center"
        bg="gray.50"
        borderRadius="lg"
        border="1px"
        borderColor="gray.200"
      >
        <VStack spacing={4}>
          <Icon
            as={getErrorIcon()}
            w={12}
            h={12}
            color={getErrorColor()}
          />
          
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            {getErrorMessage()}
          </Text>
          
          {error?.timestamp && (
            <Text fontSize="sm" color="gray.500">
              Last attempt: {new Date(error.timestamp).toLocaleTimeString()}
            </Text>
          )}
          
          {showRetryButton && onRetry && (
            <Button
              colorScheme="blue"
              leftIcon={<MdRefresh />}
              onClick={onRetry}
              size="md"
            >
              Try Again
            </Button>
          )}
        </VStack>
      </Box>
    </motion.div>
  );
};

export default ApiErrorHandler;
