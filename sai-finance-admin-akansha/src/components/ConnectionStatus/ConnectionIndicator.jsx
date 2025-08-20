import React, { useState, useEffect } from 'react';
import { Box, Text, Icon, Tooltip } from '@chakra-ui/react';
import { MdWifi, MdWifiOff, MdSignalWifiStatusbar4Bar } from 'react-icons/md';
import { checkAPIConnection } from '../../utils/connectionChecker';

const ConnectionIndicator = ({ showText = false, size = "sm" }) => {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: null,
    message: 'Checking connection...',
    lastChecked: null
  });

  const checkConnection = async () => {
    const status = await checkAPIConnection();
    setConnectionStatus({
      ...status,
      lastChecked: new Date()
    });
  };

  useEffect(() => {
    // Check connection on mount
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (connectionStatus.isConnected === null) return 'gray.500';
    return connectionStatus.isConnected ? 'green.500' : 'red.500';
  };

  const getStatusIcon = () => {
    if (connectionStatus.isConnected === null) return MdSignalWifiStatusbar4Bar;
    return connectionStatus.isConnected ? MdWifi : MdWifiOff;
  };

  const getTooltipText = () => {
    if (connectionStatus.isConnected === null) {
      return 'Checking API connection...';
    }
    
    const baseMessage = connectionStatus.isConnected 
      ? 'API server is reachable' 
      : connectionStatus.message;
      
    const lastChecked = connectionStatus.lastChecked 
      ? ` (Last checked: ${connectionStatus.lastChecked.toLocaleTimeString()})`
      : '';
      
    return baseMessage + lastChecked;
  };

  return (
    <Tooltip label={getTooltipText()} placement="bottom">
      <Box 
        display="flex" 
        alignItems="center" 
        gap={2}
        cursor="pointer"
        onClick={checkConnection}
        p={1}
        borderRadius="md"
        _hover={{ bg: 'gray.100' }}
        transition="background-color 0.2s"
      >
        <Icon
          as={getStatusIcon()}
          color={getStatusColor()}
          boxSize={size === 'sm' ? 4 : size === 'md' ? 5 : 6}
        />
        
        {showText && (
          <Text 
            fontSize={size} 
            color={getStatusColor()}
            fontWeight="medium"
          >
            {connectionStatus.isConnected === null 
              ? 'Checking...'
              : connectionStatus.isConnected 
                ? 'Connected' 
                : 'Disconnected'
            }
          </Text>
        )}
      </Box>
    </Tooltip>
  );
};

export default ConnectionIndicator;
