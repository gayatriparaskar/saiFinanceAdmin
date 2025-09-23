import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { MdRefresh, MdTimer, MdPlayArrow, MdPause, MdSettings } from 'react-icons/md';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import CountdownStats from '../../components/Countdown/CountdownStats';
import axios from '../../axios';

const CountdownManagement = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [lastTriggerTime, setLastTriggerTime] = useState(null);
  const [systemStatus, setSystemStatus] = useState('active');

  const triggerDailyCountdown = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('/admins/trigger-daily-countdown');
      
      if (response.data?.success) {
        setLastTriggerTime(new Date());
        
        toast({
          title: "Success",
          description: "Daily countdown triggered successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        console.log('✅ Countdown triggered manually:', response.data);
      } else {
        throw new Error(response.data?.message || 'Failed to trigger countdown');
      }
    } catch (error) {
      console.error('❌ Error triggering countdown:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to trigger daily countdown",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getSystemStatusInfo = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const hoursUntilMidnight = (tomorrow - now) / (1000 * 60 * 60);
    
    return {
      nextExecution: tomorrow.toLocaleString(),
      hoursUntilNext: Math.round(hoursUntilMidnight * 100) / 100,
      status: hoursUntilMidnight < 1 ? 'ending_soon' : 'active'
    };
  };

  const statusInfo = getSystemStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                🕐 Countdown Management
              </Text>
              <Text fontSize="md" color="gray.600">
                Manage automatic EMI countdown system
              </Text>
            </VStack>
            
            <Badge
              colorScheme={statusInfo.status === 'active' ? 'green' : 'orange'}
              variant="solid"
              fontSize="sm"
              px={3}
              py={1}
            >
              {statusInfo.status === 'active' ? '🟢 System Active' : '🟡 Ending Soon'}
            </Badge>
          </HStack>
        </Box>

        {/* System Status Card */}
        <Card>
          <CardHeader>
            <HStack>
              <MdSettings size={20} />
              <Text fontSize="lg" fontWeight="semibold">
                System Status
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat>
                <StatLabel>Next Execution</StatLabel>
                <StatNumber fontSize="md">{statusInfo.nextExecution}</StatNumber>
                <StatHelpText>Automatic daily countdown</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Hours Until Next</StatLabel>
                <StatNumber fontSize="md" color={statusInfo.hoursUntilNext < 1 ? 'orange.500' : 'blue.500'}>
                  {statusInfo.hoursUntilNext}h
                </StatNumber>
                <StatHelpText>Time remaining</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Last Manual Trigger</StatLabel>
                <StatNumber fontSize="md">
                  {lastTriggerTime ? lastTriggerTime.toLocaleString() : 'Never'}
                </StatNumber>
                <StatHelpText>Admin triggered</StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Manual Controls */}
        <Card>
          <CardHeader>
            <HStack>
              <MdTimer size={20} />
              <Text fontSize="lg" fontWeight="semibold">
                Manual Controls
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Automatic System</AlertTitle>
                  <AlertDescription>
                    The countdown system runs automatically every day at midnight (00:00). 
                    Use manual trigger only for testing or emergency situations.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <HStack spacing={4}>
                <Button
                  leftIcon={<MdPlayArrow />}
                  onClick={triggerDailyCountdown}
                  isLoading={loading}
                  loadingText="Triggering..."
                  colorScheme="blue"
                  size="lg"
                >
                  Trigger Countdown Now
                </Button>
                
                <Button
                  leftIcon={<MdRefresh />}
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="lg"
                >
                  Refresh Data
                </Button>
              </HStack>
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Manual trigger will decrease remaining_emi_days by 1 for all active accounts
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Divider />

        {/* Countdown Statistics */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            📊 Countdown Statistics
          </Text>
          <CountdownStats />
        </Box>

        {/* System Information */}
        <Card bg="gray.50">
          <CardBody>
            <VStack spacing={3}>
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                How the Automatic Countdown Works
              </Text>
              <VStack spacing={2} align="start" fontSize="sm" color="gray.600">
                <Text>• <strong>Daily Execution:</strong> Runs automatically every day at 00:00 (midnight)</Text>
                <Text>• <strong>Countdown Decrease:</strong> Decreases remaining_emi_days by 1 for all active accounts</Text>
                <Text>• <strong>Payment Independent:</strong> Countdown decreases regardless of payment status</Text>
                <Text>• <strong>Fair Timeline:</strong> All users follow the same 120-day timeline</Text>
                <Text>• <strong>Automatic Detection:</strong> System detects overdue loans and applies penalties</Text>
                <Text>• <strong>Real-time Updates:</strong> Changes reflect immediately across all interfaces</Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </motion.div>
  );
};

export default CountdownManagement;
