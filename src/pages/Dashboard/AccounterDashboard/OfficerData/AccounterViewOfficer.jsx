import React from "react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import OfficerNavbar from "../../../../components/OfficerNavbar";

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
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
} from "@chakra-ui/react";
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaChartLine, 
  FaUsers, 
  FaMoneyBillWave 
} from "react-icons/fa";

function AccounterViewOfficer() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [officerData, setOfficerData] = useState({});
  const [dailyCollections, setDailyCollections] = useState([]);
  const [monthlyCollections, setMonthlyCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchOfficerData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`officers/${id}`);
        if (response?.data?.result) {
          setOfficerData(response.data.result);
        }
      } catch (err) {
        console.error('Error fetching officer data:', err);
        setError('Failed to fetch officer data');
      }
    };
    fetchOfficerData();
  }, [id]);

  useEffect(() => {
    const fetchOfficerCollections = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's collections
        const dailyResponse = await axios.get(`admins/officerWiseDailyCollections`, {
          params: { officerId: id, date: today }
        });
        
        // Fetch monthly collections
        const monthlyResponse = await axios.get(`admins/officerWiseMonthlyCollections`, {
          params: { officerId: id }
        });

        if (dailyResponse?.data?.result?.collections) {
          setDailyCollections(Array.isArray(dailyResponse.data.result.collections) 
            ? dailyResponse.data.result.collections 
            : [dailyResponse.data.result.collections]);
        }

        if (monthlyResponse?.data?.result?.collections) {
          setMonthlyCollections(Array.isArray(monthlyResponse.data.result.collections) 
            ? monthlyResponse.data.result.collections 
            : [monthlyResponse.data.result.collections]);
        }
      } catch (err) {
        console.error('Error fetching officer collections:', err);
        setError('Failed to fetch collection data');
      } finally {
        setLoading(false);
      }
    };
    fetchOfficerCollections();
  }, [id]);

  const dailyColumns = React.useMemo(
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
        Header: t('Loan Amount', 'Loan Amount'),
        accessor: "loan_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value || 0}`} />,
      },
      {
        Header: t('Saving Amount', 'Saving Amount'),
        accessor: "saving_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value || 0}`} />,
      },
      {
        Header: t('Total Amount', 'Total Amount'),
        accessor: "total_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value || 0}`} />,
      },
      {
        Header: t('Collected From', 'Collected From'),
        accessor: "user_name",
        Cell: ({ value }) => <Cell text={value || "-"} />,
      },
    ],
    [t]
  );

  const monthlyColumns = React.useMemo(
    () => [
      {
        Header: t('Sr No.', 'Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: t('Month', 'Month'),
        accessor: "month",
        Cell: ({ value }) => <Cell text={dayjs(value).format("MMMM YYYY")} />,
      },
      {
        Header: t('Total Collections', 'Total Collections'),
        accessor: "total_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value || 0}`} />,
      },
      {
        Header: t('Loan Collections', 'Loan Collections'),
        accessor: "loan_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value || 0}`} />,
      },
      {
        Header: t('Saving Collections', 'Saving Collections'),
        accessor: "saving_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value || 0}`} />,
      },
      {
        Header: t('No. of Collections', 'No. of Collections'),
        accessor: "collection_count",
        Cell: ({ value }) => <Cell text={value || 0} />,
      },
    ],
    [t]
  );

  const getStatusBadge = (status) => {
    const colorScheme = status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'yellow';
    return (
      <Badge colorScheme={colorScheme} borderRadius="full" px={2} py={1}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'Unknown'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <>
        <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Officer" />
        <Flex justify="center" align="center" minH="80vh">
          <Spinner size="xl" />
        </Flex>
      </>
    );
  }

  if (error) {
    return (
      <>
        <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Officer" />
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
      <OfficerNavbar officerType="accounter" officerName="Accountant" pageName="View Officer" />
      <div className="lg:py-16 lg:pt-24 py-8 pt-24 px-6 bg-primaryBg">
        <section className="md:p-1">
          <div className="">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              {/* Officer Information Section */}
              <div className="flex flex-col gap-4 text-start w-full lg:w-auto">
                <div className="flex items-center gap-4">
                  <Link to="/accountant-dashboard">
                    <Button variant="outline" size="sm">← Back to Dashboard</Button>
                  </Link>
                  <Heading size="lg" color="textPrimary">
                    {t('Officer Details', 'Officer Details')}
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
                        <Text>{officerData?.full_name || "-"}</Text>
                      </div>
                      <div>
                        <Text fontWeight="bold">Email:</Text>
                        <Text>{officerData?.email || "-"}</Text>
                      </div>
                      <div>
                        <Text fontWeight="bold">Phone:</Text>
                        <Text>{officerData?.phone || "-"}</Text>
                      </div>
                      <div>
                        <Text fontWeight="bold">Status:</Text>
                        {getStatusBadge(officerData?.status)}
                      </div>
                      <div>
                        <Text fontWeight="bold">Joining Date:</Text>
                        <Text>
                          {officerData?.created_at 
                            ? dayjs(officerData.created_at).format("D MMM, YYYY") 
                            : "-"}
                        </Text>
                      </div>
                      <div>
                        <Text fontWeight="bold">Officer Type:</Text>
                        <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
                          {officerData?.role || "-"}
                        </Badge>
                      </div>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </div>

              {/* Performance Stats Card */}
              <div className="w-full lg:w-auto">
                <Card>
                  <CardHeader>
                    <Heading size="md">Performance Statistics</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Stat>
                        <StatLabel>Today's Collections</StatLabel>
                        <StatNumber color="green.600">
                          Rs. {dailyCollections.reduce((sum, item) => sum + (item.total_amount || 0), 0)}
                        </StatNumber>
                        <StatHelpText>
                          {dailyCollections.length} collections today
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Monthly Collections</StatLabel>
                        <StatNumber color="blue.600">
                          Rs. {monthlyCollections.reduce((sum, item) => sum + (item.total_amount || 0), 0)}
                        </StatNumber>
                        <StatHelpText>
                          {monthlyCollections.length} collections this month
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Loan Collections</StatLabel>
                        <StatNumber color="orange.600">
                          Rs. {monthlyCollections.reduce((sum, item) => sum + (item.loan_amount || 0), 0)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Saving Collections</StatLabel>
                        <StatNumber color="purple.600">
                          Rs. {monthlyCollections.reduce((sum, item) => sum + (item.saving_amount || 0), 0)}
                        </StatNumber>
                      </Stat>
                    </VStack>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Collection History Tables */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <Heading size="md">Collection History</Heading>
                </CardHeader>
                <CardBody>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab>Today's Collections</Tab>
                      <Tab>Monthly Collections</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <Table
                          data={dailyCollections || []}
                          columns={dailyColumns}
                          emptyMessage="No collections found for today"
                        />
                      </TabPanel>
                      <TabPanel>
                        <Table
                          data={monthlyCollections || []}
                          columns={monthlyColumns}
                          emptyMessage="No collections found for this month"
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default AccounterViewOfficer;
