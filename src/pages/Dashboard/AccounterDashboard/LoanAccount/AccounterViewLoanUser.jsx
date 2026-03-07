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

function AccounterViewLoanUser() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [userdata, setUserdata] = useState({});
  const [Dailydata, setDailyData] = useState([]);
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
    const fetchDailyData = async () => {
      try {
        const response = await axios.get(`dailyCollections/${id}`);
        if (response?.data?.result) {
          setDailyData(response.data.result.reverse());
        }
      } catch (err) {
        console.error('Error fetching daily collections:', err);
        setError('Failed to fetch collection data');
      } finally {
        setLoading(false);
      }
    };
    fetchDailyData();
  }, [id]);

  const columns = React.useMemo(
    () => [
      {
        Header: t('Sr No.', 'Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: t('Date', 'Date'),
        accessor: "created_on",
        Cell: ({ value }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: t('EMI Amount', 'EMI Amount'),
        accessor: "amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value}`} />,
      },
      {
        Header: t('Penalty Amount', 'Penalty Amount'),
        accessor: "total_penalty_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value || 0}`} />,
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
    const title = "LOAN ACCOUNT STATEMENT";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    if (userdata?.active_loan_id) {
      const startDate = dayjs(userdata.active_loan_id.created_on).format("D MMM, YYYY");
      const endDate = userdata.active_loan_id.end_date 
        ? dayjs(userdata.active_loan_id.end_date).format("D MMM, YYYY")
        : dayjs(userdata.active_loan_id.created_on).add(120, 'day').format("D MMM, YYYY");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      let y = 30;
      doc.text(`Name: ${userName}`, 14, y);
      doc.text(`End Date: ${endDate}`, pageWidth / 2 + 10, y);
      y += 7;
      doc.text(`Start Date: ${startDate}`, 14, y);
      doc.text(`Total Due: Rs. ${userdata.active_loan_id.total_due_amount || 0}`, pageWidth / 2 + 10, y);
      y += 7;
      doc.text(`Total Loan: Rs. ${userdata.active_loan_id.loan_amount || 0}`, 14, y);
      doc.text(`Total Paid: Rs. ${userdata.active_loan_id.total_amount || 0}`, pageWidth / 2 + 10, y);
      y += 7;
      doc.text(`Total Penalty: Rs. ${userdata.active_loan_id.total_penalty_amount || 0}`, 14, y);
      y += 10;

      // Transactions
      const groupedByMonth = groupBy(Dailydata, item => dayjs(item.created_on).format("MMMM YYYY"));
      
      Object.entries(groupedByMonth).forEach(([monthYear, records]) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(`Transactions - ${monthYear}`, 14, y);
        y += 6;

        const rows = records.map(item => [
          dayjs(item.created_on).format("D MMM, YYYY h:mm A"),
          "EMI Payment",
          `Rs. ${item.amount || 0}`,
          `Rs. ${item.total_penalty_amount || 0}`,
          item.collected_officer_name || "-"
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Date", "Description", "Amount (Rs.)", "Penalty (Rs.)", "Collected By"]],
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

    doc.save(`${userName}_loan_statement_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <>
        <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Loan User" />
        <Flex justify="center" align="center" minH="80vh">
          <Spinner size="xl" />
        </Flex>
      </>
    );
  }

  if (error) {
    return (
      <>
        <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Loan User" />
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
      <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Loan User" />
      <div className="lg:py-16 lg:pt-24 py-8 pt-24 px-6 bg-primaryBg">
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
                    {t('Loan User Details', 'Loan User Details')}
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

              {/* Loan Summary Card */}
              <div className="w-full lg:w-auto">
                <Card>
                  <CardHeader>
                    <Heading size="md">Loan Summary</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Stat>
                        <StatLabel>Total Loan Amount</StatLabel>
                        <StatNumber color="blue.600">
                          Rs. {userdata?.active_loan_id?.loan_amount || 0}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Paid</StatLabel>
                        <StatNumber color="green.600">
                          Rs. {userdata?.active_loan_id?.total_amount || 0}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Due</StatLabel>
                        <StatNumber color="red.600">
                          Rs. {userdata?.active_loan_id?.total_due_amount || 0}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Penalty</StatLabel>
                        <StatNumber color="orange.600">
                          Rs. {userdata?.active_loan_id?.total_penalty_amount || 0}
                        </StatNumber>
                      </Stat>
                      <Button 
                        colorScheme="blue" 
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

            {/* Collection History Table */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <Heading size="md">Collection History</Heading>
                </CardHeader>
                <CardBody>
                  <Table
                    data={Dailydata || []}
                    columns={columns}
                    emptyMessage="No collection records found"
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

export default AccounterViewLoanUser;
