import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import groupBy from "lodash/groupBy";
import axios from "../../../../axios";
import OfficerNavbar from "../../../../components/OfficerNavbar";
import Table from "../../../../componant/Table/Table";
import Cell from "../../../../componant/Table/cell";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  // Drawer,
  // DrawerBody,
  // DrawerFooter,
  // DrawerHeader,
  // DrawerOverlay,
  // DrawerContent,
  // DrawerCloseButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  useToast,
  // Thead,
  // Tbody,
  // Tr,
  // Th,
  // Td,
  // TableContainer,
} from "@chakra-ui/react";
import { HiStatusOnline } from "react-icons/hi";

function ManagerViewSavingUser() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [accountData, setAccountData] = useState({});
  const [transactions, setTransactions] = useState([]);
  console.log(id);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAddTransactionOpen,
    onOpen: onAddTransactionOpen,
    onClose: onAddTransactionClose,
  } = useDisclosure();
  const {
    isOpen: isDateModalOpen,
    onOpen: onDateModalOpen,
    onClose: onDateModalClose,
  } = useDisclosure();

  const [isLoading, setIsLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    transaction_type: "deposit",
    description: "",
  });
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchAccountAndTransactionsData();
  }, [id]);

  const fetchAccountAndTransactionsData = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Fetching data for ID:", id);
      const response = await axios.get(`savingDailyCollections/${id}`);
      console.log("🔍 Full API Response:", response);
      console.log("🔍 Response Data:", response.data);
      
      if (response?.data?.result) {
        const apiResult = response.data.result;
        console.log("🔍 API Result:", apiResult);
        console.log("🔍 Saving Account:", apiResult.saving_account);
        console.log("🔍 Collections:", apiResult.collections);
        
        // Map the API response structure to match what the component expects
        const mappedAccountData = {
          ...apiResult,
          // Map saving_account to the expected structure
          user_id: {
            full_name: apiResult.full_name,
            phone_number: apiResult.phone_number,
            address: apiResult.address
          },
          // Map saving_account fields to root level
          current_amount: apiResult.saving_account?.current_amount,
          total_interest_pay: apiResult.saving_account?.total_interest_pay,
          emi_day: apiResult.saving_account?.emi_day,
          account_number: apiResult.saving_account?.account_number,
          created_on: apiResult.saving_account?.created_on,
          end_date: apiResult.saving_account?.end_date,
          // Keep all other saving_account fields
          ...apiResult.saving_account
        };
        
        console.log("🔍 Final Mapped Account Data:", mappedAccountData);
        setAccountData(mappedAccountData);
        
        // Set transactions from collections
        if (apiResult.collections) {
          console.log("🔍 Setting Collections Data:", apiResult.collections);
          setTransactions(Array.isArray(apiResult.collections) ? apiResult.collections : []);
        } else {
          console.log("🔍 No collections found, setting empty array");
          setTransactions([]);
        }
      } else {
        console.log("🔍 No result in response data");
      }
    } catch (error) {
      console.error("❌ Error fetching account and transaction data:", error);
      console.error("❌ Error response:", error.response);
      toast({
        title: "Error fetching data",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.transaction_type) {
      toast({
        title: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsAddingTransaction(true);
      const response = await axios.post(`transactions/${id}`, newTransaction);
      if (response?.data?.success) {
        toast({
          title: "Transaction added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setNewTransaction({
          amount: "",
          transaction_type: "deposit",
          description: "",
        });
        onAddTransactionClose();
        fetchAccountAndTransactionsData(); // Refresh both account and transaction data
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Error adding transaction",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const generatePDF = (startDate, endDate) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Saving Account Statement', 20, 20);
    doc.setFontSize(12);
    doc.text(`Account Number: ${accountData?.account_number}`, 20, 50);
    doc.text(`Current Amount: Rs. ${accountData?.current_amount}`, 20, 60);
    doc.text(`Generated on: ${dayjs().format('DD MMM, YYYY h:mm A')}`, 20, 70);
    
    // Filter transactions by date range if provided
    let filteredTransactions = Array.isArray(transactions) ? transactions : [];
    if (startDate && endDate) {
      filteredTransactions = filteredTransactions.filter(transaction => {
        const transactionDate = dayjs(transaction.created_at);
        return transactionDate.isAfter(dayjs(startDate).subtract(1, 'day')) && 
               transactionDate.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }
    
    // Transactions Table
    const tableData = filteredTransactions.map((transaction, index) => [
      index + 1,
      dayjs(transaction.created_at).format('DD MMM, YYYY'),
      transaction.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal',
      `Rs. ${transaction.amount}`,
      transaction.description || '-'
    ]);
    
    autoTable(doc, {
      head: [['#', 'Date', 'Type', 'Amount', 'Description']],
      body: tableData,
      startY: 80,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 105, 225] }
    });
    
    doc.save(`saving-account-${accountData?.account_number}-statement.pdf`);
  };

  // Handle date range PDF generation
  const handleDateRangePDF = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Please select both start and end dates",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (dayjs(startDate).isAfter(dayjs(endDate))) {
      toast({
        title: "Start date cannot be after end date",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    generatePDF(startDate, endDate);
    onDateModalClose();
    setStartDate("");
    setEndDate("");
  };

  // Handle full PDF generation (all data)
  const handleFullPDF = () => {
    generatePDF();
  };

  const columns = useMemo(() => [
    {
      Header: t('SR NO.'),
      accessor: 'sr_no',
      Cell: ({ row }) => <Cell text={row.index + 1} />
    },
    {
      Header: t('DATE'),
      accessor: 'created_on',
      Cell: ({ value }) => <Cell text={dayjs(value).format('DD MMM, YYYY h:mm A')} />
    },
    {
      Header: t('EMI AMOUNT/DAY'),
      accessor: 'deposit_amount',
      Cell: ({ value, row: { original } }) => {
        // Show deposit amount if it exists, otherwise show withdraw amount
        const amount = original.deposit_amount || original.withdraw_amount || 0;
        return <Cell text={`Rs. ${amount}`} />
      }
    },
    {
      Header: t('PENALTY AMOUNT'),
      accessor: 'penalty_amount',
      Cell: ({ value }) => <Cell text={`Rs. ${value || 0}`} />
    },
    {
      Header: t('COLLECTED BY'),
      accessor: 'collected_officer_name',
      Cell: ({ value }) => <Cell text={value || '-'} />
    }
  ], [t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading account details...')}</p>
        </div>
      </div>
    );
  }

  // Get officer info for navbar
  const getOfficerType = () => {
    return localStorage.getItem('officerType') || 'manager';
  };

  const getOfficerName = () => {
    return localStorage.getItem('officerName') || 'Manager';
  };

  return (
    <>
      <OfficerNavbar 
        officerType={getOfficerType()} 
        officerName={getOfficerName()} 
        pageName="Saving User Details" 
      />
      <div className="px-2 sm:px-4 lg:px-6 bg-primaryBg pt-4">
      <section className="md:p-1">
        <div className="py-2">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
            {/* User Information Section */}
            <div className="flex flex-col gap-4 text-start w-full lg:w-auto">
              <h2 className="text-lg sm:text-xl font-bold text-purple text-oswald">
                {t('Name', 'Name')}: <span className="ml-2 lg:ml-4 text-base sm:text-lg">{accountData?.full_name}</span>
              </h2>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-20">
                <h2 className="text-lg font-bold text-purple text-oswald">
                  {t('Start Date', 'Start Date')}:
                  <span className="ml-2 lg:ml-4">
                    {dayjs(accountData?.created_on).format(
                      "D MMM, YYYY"
                    )}
                  </span>
                </h2>
                <h2 className="text-lg font-bold text-purple text-oswald">
                  {t('End Date', 'End Date')}:
                  <span className="ml-2 lg:ml-4">
                    {accountData?.end_date 
                      ? dayjs(accountData?.end_date).format("D MMM, YYYY")
                      : dayjs(accountData?.created_on).add(120, 'day').format("D MMM, YYYY")
                    }
                  </span>
                </h2>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-auto lg:items-end">
              {/* Summary Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
                <Button
                  colorScheme="blue"
                  size="sm"
                  borderRadius="md"
                  px={2}
                  className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
                >
                  <span className="truncate">Total Saving {accountData?.current_amount} Rs.</span>
                </Button>

                <Button
                  colorScheme="blue"
                  size="sm"
                  borderRadius="md"
                  px={2}
                  className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
                >
                  <span className="truncate">{t('Total Interest', 'Total Interest')}{" "}
                  {accountData?.total_interest_pay} रु.</span>
                </Button>

                <Button
                  colorScheme="blue"
                  size="sm"
                  borderRadius="md"
                  px={2}
                  className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto text-xs sm:text-sm"
                >
                  <span className="truncate">{t('EMI Day', 'EMI Day')}{" "}
                  {accountData?.emi_day}</span>
                </Button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="blue"
                    size="sm"
                    borderRadius="md"
                    px={4}
                    minW="120px"
                    className="w-full sm:w-auto text-sm"
                   
                  >
                    {t('Download PDF', 'Download PDF')}
                  </MenuButton>
                  <MenuList bg="white" border="1px solid #e2e8f0" boxShadow="lg" zIndex={10000}>
                    <MenuItem onClick={handleFullPDF} _hover={{ bg: "gray.100" }}>
                      {t('Download All Data', 'Download All Data')}
                    </MenuItem>
                    <MenuItem onClick={onDateModalOpen} _hover={{ bg: "gray.100" }}>
                      {t('Download Date Range', 'Download Date Range')}
                    </MenuItem>
                  </MenuList>
                </Menu>

                <Button
                  colorScheme="purple"
                  size="sm"
                  borderRadius="md"
                  px={4}
                  minW="120px"
                  className="w-full text-sm"
                  onClick={() => window.location.href = `/manager-dashboard/manager-add-saving-collection/${accountData._id}`}
                >
                  {t('Add Amount', 'Add Amount')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <Table
            isLoading={isLoading}
            data={Array.isArray(transactions) ? transactions : []}
            columns={columns}
            // total={data?.total}
          />
        </div>
      </section>

      {/* Date Range Modal */}
      <Modal isOpen={isDateModalOpen} onClose={onDateModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Select Date Range for PDF', 'Select Date Range for PDF')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('Start Date', 'Start Date')}</FormLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('End Date', 'End Date')}</FormLabel>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={onDateModalClose}>
                {t('Cancel', 'Cancel')}
              </Button>
              <Button colorScheme="blue" onClick={handleDateRangePDF}>
                {t('Generate PDF', 'Generate PDF')}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal isOpen={isAddTransactionOpen} onClose={onAddTransactionClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Add Transaction')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('Amount')}</FormLabel>
                <Input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="Enter amount"
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('Transaction Type')}</FormLabel>
                <Select
                  value={newTransaction.transaction_type}
                  onChange={(e) => setNewTransaction({...newTransaction, transaction_type: e.target.value})}
                >
                  <option value="deposit">{t('Deposit')}</option>
                  <option value="withdrawal">{t('Withdrawal')}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('Description')}</FormLabel>
                <Input
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Enter description (optional)"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddTransactionClose}>
              {t('Cancel')}
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddTransaction}
              isLoading={isAddingTransaction}
              loadingText={t('Adding...')}
            >
              {t('Add Transaction')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </div>
    </>
  );
}

export default ManagerViewSavingUser;