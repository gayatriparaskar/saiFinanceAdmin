import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon
} from '@chakra-ui/react';
import { MdRefresh, MdTimer, MdTrendingUp, MdTrendingDown, MdCheckCircle } from 'react-icons/md';
import axios from '../../axios';

const CountdownStats = ({ refreshTrigger = 0 }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const toast = useToast();

  const fetchCountdownStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/admins/countdown-statistics');
      
      if (response.data?.success) {
        setStats(response.data.result);
        setLastUpdated(new Date());
        console.log('📊 Countdown stats fetched:', response.data.result);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch countdown statistics');
      }
    } catch (error) {
      console.error('❌ Error fetching countdown stats:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch statistics');
      
      toast({
        title: "Error",
        description: "Failed to fetch countdown statistics",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerDailyCountdown = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('/admins/trigger-daily-countdown');
      
      if (response.data?.success) {
        toast({
          title: "Success",
          description: "Daily countdown triggered successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh stats after triggering
        await fetchCountdownStats();
      } else {
        throw new Error(response.data?.message || 'Failed to trigger countdown');
      }
    } catch (error) {
      console.error('❌ Error triggering countdown:', error);
      toast({
        title: "Error",
        description: "Failed to trigger daily countdown",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountdownStats();
  }, [refreshTrigger]);

  if (loading && !stats) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <Spinner size="lg" color="blue.500" />
            <Text>Loading countdown statistics...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Error loading statistics!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>{title}</StatLabel>
            <HStack spacing={2} align="center">
              <Icon as={icon} color={`${color}.500`} boxSize={5} />
              <StatNumber color={`${color}.600`}>{value}</StatNumber>
            </HStack>
            {subtitle && <StatHelpText>{subtitle}</StatHelpText>}
          </Stat>
        </CardBody>
      </Card>
    </motion.div>
  );

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Text fontSize="xl" fontWeight="bold">
            Countdown Statistics
          </Text>
          {lastUpdated && (
            <Text fontSize="sm" color="gray.500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </VStack>
        
        <HStack spacing={2}>
          <Button
            leftIcon={<MdRefresh />}
            onClick={fetchCountdownStats}
            isLoading={loading}
            size="sm"
            variant="outline"
          >
            Refresh
          </Button>
          <Button
            leftIcon={<MdTimer />}
            onClick={triggerDailyCountdown}
            isLoading={loading}
            size="sm"
            colorScheme="blue"
          >
            Trigger Countdown
          </Button>
        </HStack>
      </HStack>

      {/* Loan Statistics */}
      {stats?.loans && (
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4} color="blue.600">
            📊 Loan Account Statistics
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <StatCard
              title="Total Loans"
              value={stats.loans.totalLoans || 0}
              subtitle="All loan accounts"
              icon={MdTrendingUp}
              color="blue"
            />
            <StatCard
              title="Active Loans"
              value={stats.loans.activeLoans || 0}
              subtitle="Still in countdown"
              icon={MdTimer}
              color="green"
            />
            <StatCard
              title="Completed Loans"
              value={stats.loans.completedLoans || 0}
              subtitle="Countdown finished"
              icon={MdCheckCircle}
              color="purple"
            />
            <StatCard
              title="Avg Remaining Days"
              value={Math.round(stats.loans.avgRemainingDays || 0)}
              subtitle="Average days left"
              icon={MdTrendingDown}
              color="orange"
            />
          </SimpleGrid>
        </Box>
      )}

      {/* Saving Statistics */}
      {stats?.savings && (
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4} color="green.600">
            🏦 Saving Account Statistics
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <StatCard
              title="Total Savings"
              value={stats.savings.totalSavings || 0}
              subtitle="All saving accounts"
              icon={MdTrendingUp}
              color="green"
            />
            <StatCard
              title="Active Savings"
              value={stats.savings.activeSavings || 0}
              subtitle="Still in countdown"
              icon={MdTimer}
              color="blue"
            />
            <StatCard
              title="Completed Savings"
              value={stats.savings.completedSavings || 0}
              subtitle="Countdown finished"
              icon={MdCheckCircle}
              color="purple"
            />
            <StatCard
              title="Avg Remaining Days"
              value={Math.round(stats.savings.avgRemainingDays || 0)}
              subtitle="Average days left"
              icon={MdTrendingDown}
              color="orange"
            />
          </SimpleGrid>
        </Box>
      )}

      {/* Summary */}
      <Card bg="gray.50">
        <CardBody>
          <VStack spacing={2}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              System Status
            </Text>
            <HStack spacing={4}>
              <Badge colorScheme="green" variant="solid">
                Automatic countdown enabled
              </Badge>
              <Badge colorScheme="blue" variant="solid">
                Daily execution at midnight
              </Badge>
              <Badge colorScheme="purple" variant="solid">
                Real-time tracking
              </Badge>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default CountdownStats;
