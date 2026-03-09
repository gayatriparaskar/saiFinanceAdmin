import React from "react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import OfficerNavbar from "../../../../components/OfficerNavbar";

// new for pdf
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import groupBy from "lodash/groupBy";

import axios from "../../../../axios";
import { useLocalTranslation } from "../../../../hooks/useLocalTranslation";
import Table from "../../../../componant/Table/Table";
import Cell from "../../../../componant/Table/cell";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Spinner,
  Container,
} from "@chakra-ui/react";

function AccounterViewSavingUser() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [userdata, setUserdata] = useState({});
  const [savingData, setSavingData] = useState([]);
  const [savingAccount, setSavingAccount] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`users/${id}`);
        if (response?.data?.result) {
          setUserdata(response.data.result);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchSavingData = async () => {
      try {
        const response = await axios.get(`savingDailyCollections/${id}`);
        if (response?.data?.result) {
          setSavingData(response.data.result.reverse());
        }
      } catch (err) {
        console.error('Error fetching saving transactions:', err);
        setError('Failed to fetch saving data');
      }
    };
    fetchSavingData();
  }, [id]);

  useEffect(() => {
    const fetchSavingAccount = async () => {
      try {
        const response = await axios.get(`saving-accounts/user/${id}`);
        if (response?.data?.result) {
          setSavingAccount(response.data.result);
        }
      } catch (err) {
        console.error('Error fetching saving account:', err);
      }
    };
    fetchSavingAccount();
  }, [id]);

  const columns = React.useMemo(
    () => [
      {
        Header: t('Sr No.', 'Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },
       {
    Header: "Account Number",
    accessor: "account_number",
    Cell: ({ value }) => <Cell text={value} />
  },
      {
        Header: t('Date', 'Date'),
        accessor: "created_on",
        Cell: ({ value }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: t('Transaction Type', 'Transaction Type'),
        accessor: "transaction_type",
        Cell: ({ value }) => (
          <Badge 
            colorScheme={value === 'deposit' ? 'green' : 'red'} 
            borderRadius="full" 
            px={2}
            py={1}
            textTransform="capitalize"
          >
            {value === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </Badge>
        ),
      },
      {
        Header: t('Amount', 'Amount'),
        accessor: "amount",
        Cell: ({ row }) => {
          const amount = row.original.transaction_type === 'deposit' 
            ? row.original.deposit_amount 
            : row.original.withdraw_amount;
          return <Cell text={`Rs. ${amount || 0}`} />;
        },
      },
      {
        Header: t('Collected By', 'Collected By'),
        accessor: "collected_officer_name",
        Cell: ({ value }) => <Cell text={value || "-"} />,
      },
    ],
    [t]
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    const userName = userdata?.full_name || "-";
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const title = "SAVING ACCOUNT STATEMENT";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    if (savingAccount) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      let y = 30;
      doc.text(`Account Holder: ${userName}`, 14, y);
      doc.text(`Account Number: ${savingAccount.account_number || '-'}`, 14, y + 7);
      doc.text(`Current Balance: Rs. ${savingAccount.current_balance || 0}`, 14, y + 14);
      doc.text(`Total Deposits: Rs. ${savingAccount.total_deposits || 0}`, 14, y + 21);
      doc.text(`Total Withdrawals: Rs. ${savingAccount.total_withdrawals || 0}`, 14, y + 28);
      y += 35;

      // Transactions
      const groupedByMonth = groupBy(savingData, item => dayjs(item.created_on).format("MMMM YYYY"));
      
      Object.entries(groupedByMonth).forEach(([monthYear, records]) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(`Transactions - ${monthYear}`, 14, y);
        y += 6;

        const rows = records.map(item => [
          dayjs(item.created_on).format("D MMM, YYYY h:mm A"),
          item.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal',
          `Rs. ${item.transaction_type === 'deposit' ? item.deposit_amount : item.withdraw_amount || 0}`,
          item.collected_officer_name || "-"
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Date", "Transaction Type", "Amount (Rs.)", "Processed By"]],
          body: rows,
          headStyles: { fillColor: [211, 211, 211], fontStyle: 'bold' },
          styles: { fontSize: 10, cellPadding: 3 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 14, right: 14 },
          theme: 'striped'
        });

        y = doc.lastAutoTable.finalY + 10;
      });
    }

    doc.save(`${userName}_saving_statement_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <>
        <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Saving User" />
        <Flex justify="center" align="center" minH="80vh">
          <Spinner size="xl" />
        </Flex>
      </>
    );
  }

  if (error) {
    return (
      <>
        <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Saving User" />
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Saving User" />
      <div className="lg:py-16 lg:pt-48 py-8 pt-48 px-6 bg-primaryBg">
        <section className="md:p-1">
          <div className="">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              {/* User Information Section */}
              <div className="flex flex-col gap-4 text-start w-full lg:w-auto">
                <div className="flex items-center gap-4">
                  <Link to="/accountant-dashboard">
                    <Button variant="outline" size="sm">← Back to Dashboard</Button>
                  </Link>
                  <Heading size="lg" color="textPrimary">
                    {t('Saving User Details', 'Saving User Details')}
                  </Heading>
                </div>
                
                <Card>
                  <CardHeader>
                    <Heading size="md">Personal Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={2} spacing={4}>
                      <div>
                        <Text fontWeight="bold">Name:</Text>
                        <Text>{userdata?.full_name || "-"}</Text>
                      </div>
                      <div>
                        <Text fontWeight="bold">Email:</Text>
                        <Text>{userdata?.email || "-"}</Text>
                      </div>
                      <div>
                        <Text fontWeight="bold">Phone:</Text>
                        <Text>{userdata?.phone || "-"}</Text>
                      </div>
                      <div>
                        <Text fontWeight="bold">Address:</Text>
                        <Text>{userdata?.address || "-"}</Text>
                      </div>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </div>

              {/* Saving Account Summary Card */}
              <div className="w-full lg:w-auto">
                <Card>
                  <CardHeader>
                    <Heading size="md">Saving Account Summary</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Stat>
                        <StatLabel>Account Number</StatLabel>
                        <StatNumber color="blue.600">
                          {savingAccount?.account_number || "N/A"}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Current Balance</StatLabel>
                        <StatNumber color="green.600">
                          Rs. {savingAccount?.current_balance || 0}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Deposits</StatLabel>
                        <StatNumber color="green.600">
                          Rs. {savingAccount?.total_deposits || 0}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Withdrawals</StatLabel>
                        <StatNumber color="red.600">
                          Rs. {savingAccount?.total_withdrawals || 0}
                        </StatNumber>
                      </Stat>
                      <Button 
                        colorScheme="green" 
                        onClick={generatePDF}
                        width="full"
                        mt={4}
                      >
                        Download Statement
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <Heading size="md">Transaction History</Heading>
                </CardHeader>
                <CardBody>
                  <Table
                    data={savingData || []}
                    columns={columns}
                    emptyMessage="No transaction records found"
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default AccounterViewSavingUser;
