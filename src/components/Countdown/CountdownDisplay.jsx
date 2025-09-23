import React from 'react';
import { motion } from 'framer-motion';
import { Box, Text, Badge, Progress, VStack, HStack, Icon } from '@chakra-ui/react';
import { MdTimer, MdWarning, MdCheckCircle } from 'react-icons/md';

const CountdownDisplay = ({ 
  remainingDays, 
  totalDays = 120, 
  showProgress = true, 
  size = 'md',
  showIcon = true,
  variant = 'default' // 'default', 'warning', 'danger', 'success'
}) => {
  const percentage = totalDays > 0 ? ((totalDays - remainingDays) / totalDays) * 100 : 0;
  const isCompleted = remainingDays <= 0;
  const isNearEnd = remainingDays <= 7;
  const isWarning = remainingDays <= 14;

  const getVariantConfig = () => {
    if (isCompleted) {
      return {
        color: 'green',
        bg: 'green.50',
        borderColor: 'green.200',
        icon: MdCheckCircle,
        text: 'Completed'
      };
    } else if (isNearEnd) {
      return {
        color: 'red',
        bg: 'red.50',
        borderColor: 'red.200',
        icon: MdWarning,
        text: 'Ending Soon'
      };
    } else if (isWarning) {
      return {
        color: 'orange',
        bg: 'orange.50',
        borderColor: 'orange.200',
        icon: MdWarning,
        text: 'Warning'
      };
    } else {
      return {
        color: 'blue',
        bg: 'blue.50',
        borderColor: 'blue.200',
        icon: MdTimer,
        text: 'Active'
      };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: 'xs',
          iconSize: 8,
          padding: 0,
          height: '60px'
        };
      case 'lg':
        return {
          fontSize: 'lg',
          iconSize: 10,
          padding: 2,
          height: '100px'
        };
      default:
        return {
          fontSize: 'sm',
          iconSize: 8,
          padding: 1,
          height: '80px'
        };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        bg={config.bg}
        // borderColor={config.borderColor}
        // borderRadius="lg"
        p={sizeConfig.padding}
        h={sizeConfig.height}
        position="relative"
        overflow="hidden"
      >
        <VStack spacing={2} align="stretch" h="full" justify="center">
          {/* Header with Icon and Status */}
          <HStack justify="space-between" align="center">
            {showIcon && (
              <Icon
                as={IconComponent}
                color={`${config.color}.500`}
                boxSize={sizeConfig.iconSize}
              />
            )}
            <Badge
              colorScheme={config.color}
              variant="subtle"
              fontSize={sizeConfig.fontSize}
              px={2}
              py={1}
            >
              {config.text}
            </Badge>
          </HStack>

          {/* Days Display */}
          <VStack spacing={1}>
            <Text
              fontSize={size === 'lg' ? '2xl' : size === 'sm' ? 'lg' : 'xl'}
              fontWeight="bold"
              color={`${config.color}.700`}
              textAlign="center"
            >
              {isCompleted ? '0' : remainingDays}
            </Text>
            <Text
              fontSize={sizeConfig.fontSize}
              color="gray.600"
              textAlign="center"
            >
              {isCompleted ? 'Days Completed' : 'Days Remaining'}
            </Text>
          </VStack>

          {/* Progress Bar */}
          {showProgress && (
            <Box>
              <Progress
                value={percentage}
                colorScheme={config.color}
                size="sm"
                borderRadius="full"
                bg="white"
              />
              <Text
                fontSize="xs"
                color="gray.500"
                textAlign="center"
                mt={1}
              >
                {Math.round(percentage)}% Complete
              </Text>
            </Box>
          )}
        </VStack>

        {/* Animated Background Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, ${config.color}.200, transparent)`,
            pointerEvents: 'none'
          }}
        />
      </Box>
    </motion.div>
  );
};

export default CountdownDisplay;
