import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
import { motion } from "framer-motion";
import {
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import dayjs from "dayjs";

const OverdueLoans = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyingPenalties, setApplyingPenalties] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  useEffect(() => {
    fetchOverdueLoans();
  }, []);

  const fetchOverdueLoans = async () => {
    try {
      setLoading(true);
      const response = await axios.get("dailyCollections/overdue-loans");
      if (response?.data) {
        setOverdueLoans(response.data.result.overdueLoans || []);
      }
    } catch (error) {
      console.error("Error fetching overdue loans:", error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch overdue loans"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyOverduePenalties = async () => {
    try {
      setApplyingPenalties(true);
      const response = await axios.post("dailyCollections/apply-overdue-penalties");
      
      if (response?.data) {
        const result = response.data.result;
        toast({
          title: t("Success"),
          description: `${t("Applied penalties to")} ${result.updatedCount} ${t("loans. Total penalties: ₹")}${result.totalPenaltiesApplied}`,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top",
        });
        
        // Refresh the overdue loans list
        await fetchOverdueLoans();
      }
    } catch (error) {
      console.error("Error applying penalties:", error);
      toast({
        title: t("Error"),
        description: t("Failed to apply overdue penalties"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setApplyingPenalties(false);
      onClose();
    }
  };

  const getDaysOverdueColor = (days) => {
    if (days <= 7) return "yellow";
    if (days <= 30) return "orange";
    return "red";
  };

  const getPenaltyAmount = (emiAmount) => {
    return Math.round(emiAmount * 0.05);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const totalOverdueAmount = overdueLoans.reduce((sum, loan) => sum + loan.totalDueAmount, 0);
  const totalPenalties = overdueLoans.reduce((sum, loan) => sum + getPenaltyAmount(loan.emiAmount), 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-primaryBg flex flex-col pt-24 sm:pt-28"
    >
      <div className="px-6 py-0">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple">
              {t("Overdue Loans Management")}
            </h1>
            <Button
              colorScheme="red"
              size="lg"
              onClick={onOpen}
              isLoading={applyingPenalties}
              loadingText={t("Applying Penalties...")}
              isDisabled={overdueLoans.length === 0}
              className="whitespace-nowrap text-xs sm:text-sm md:text-base px-2 sm:px-4"
            >
              <span className="hidden sm:inline">{t("Apply Overdue Penalties")}</span>
              <span className="sm:hidden">{t("Apply Penalties")}</span>
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>{t("Total Overdue Loans")}</StatLabel>
                  <StatNumber>{overdueLoans.length}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    {overdueLoans.length > 0 ? t("Requires attention") : t("All loans are current")}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>{t("Total Outstanding Amount")}</StatLabel>
                  <StatNumber>₹{totalOverdueAmount.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    {t("Amount due from overdue loans")}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>{t("Total Penalties to Apply")}</StatLabel>
                  <StatNumber>₹{totalPenalties.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {t("5% of EMI for each overdue loan")}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </div>
        </motion.div>

        {/* Overdue Loans List */}
        <motion.div variants={itemVariants} className="mt-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
              <p className="mt-4 text-gray-600">{t("Loading overdue loans...")}</p>
            </div>
          ) : overdueLoans.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Heading size="md" color="green.500" mb="4">
                  🎉 {t("No Overdue Loans")}
                </Heading>
                <Text color="gray.600">
                  {t("All loans are current and up to date!")}
                </Text>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {t("Overdue Loans Details")}
              </h2>
              
              {overdueLoans.map((loan, index) => (
                <motion.div
                  key={loan.loanId}
                  variants={itemVariants}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {loan.userName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t("Phone")}: {loan.phoneNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("Officer")}: {loan.officerName}
                      </p>
                    </div>
                    
                    <Badge
                      colorScheme={getDaysOverdueColor(loan.daysOverdue)}
                      size="lg"
                      px="3"
                      py="1"
                    >
                      {loan.daysOverdue} {t("days overdue")}
                    </Badge>
                  </div>

                  <Divider mb="4" />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Text fontSize="sm" color="gray.500">{t("Loan Amount")}</Text>
                      <Text fontWeight="semibold">₹{loan.loanAmount.toLocaleString()}</Text>
                    </div>
                    
                    <div>
                      <Text fontSize="sm" color="gray.500">{t("Outstanding Amount")}</Text>
                      <Text fontWeight="semibold" color="red.600">
                        ₹{loan.totalDueAmount.toLocaleString()}
                      </Text>
                    </div>
                    
                    <div>
                      <Text fontSize="sm" color="gray.500">{t("Daily EMI")}</Text>
                      <Text fontWeight="semibold">₹{loan.emiAmount}</Text>
                    </div>
                    
                    <div>
                      <Text fontSize="sm" color="gray.500">{t("Penalty (5% of EMI)")}</Text>
                      <Text fontWeight="semibold" color="orange.600">
                        ₹{getPenaltyAmount(loan.emiAmount)}
                      </Text>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Text fontSize="sm" color="gray-500">
                      {t("Loan End Date")}: {dayjs(loan.endDate).format("D MMM, YYYY")}
                    </Text>
                    <Text fontSize="sm" color="gray-500">
                      {t("Overdue Since")}: {dayjs(loan.endDate).add(1, 'day').format("D MMM, YYYY")}
                    </Text>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t("Apply Overdue Penalties")}
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb="4">
                {t("This will apply a 5% penalty (based on daily EMI) to all overdue loans.")}
              </Text>
              <Text fontWeight="semibold" color="red.600">
                {t("Total penalties to be applied")}: ₹{totalPenalties.toLocaleString()}
              </Text>
              <Text fontSize="sm" color="gray.600" mt="2">
                {t("This action cannot be undone and will increase the total due amount for affected loans.")}
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="outline">
                {t("Cancel")}
              </Button>
              <Button
                colorScheme="red"
                onClick={applyOverduePenalties}
                ml={3}
                isLoading={applyingPenalties}
                loadingText={t("Applying...")}
              >
                {t("Apply Penalties")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </motion.div>
  );
};

export default OverdueLoans;
