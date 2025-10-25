import React, { useState, useEffect } from "react";
import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
import {
  useToast,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  Select,
  HStack,
  VStack,
  Text,
  Box,
  Alert,
  AlertIcon,
  Spinner,
  Center
} from "@chakra-ui/react";

const InactiveUsers = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [thresholdPercentage, setThresholdPercentage] = useState(70);
  const [reactivationReason, setReactivationReason] = useState("");

  // Fetch inactive users
  const fetchInactiveUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await axios.get(`/loan-inactivation/inactive-users`, {
        params: {
          page,
          limit: 10,
          search
        }
      });

      if (response.data.success) {
        setInactiveUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setCurrentPage(response.data.data.pagination.currentPage);
      }
    } catch (error) {
      console.error("Error fetching inactive users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inactive users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Batch inactivate users
  const handleBatchInactivation = async () => {
    try {
      setBatchLoading(true);
      const response = await axios.post("/loan-inactivation/batch-inactivate", {
        thresholdPercentage: parseFloat(thresholdPercentage)
      });

      if (response.data.success) {
        toast({
          title: "Batch Inactivation Completed",
          description: `${response.data.data.inactivated} users inactivated successfully`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh the list
        fetchInactiveUsers(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Error in batch inactivation:", error);
      toast({
        title: "Error",
        description: "Failed to perform batch inactivation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBatchLoading(false);
    }
  };

  // Reactivate user
  const handleReactivateUser = async (userId) => {
    try {
      const response = await axios.post(`/loan-inactivation/reactivate/${userId}`, {
        reason: reactivationReason || "Manual reactivation by admin"
      });

      if (response.data.success) {
        toast({
          title: "User Reactivated",
          description: "User has been reactivated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh the list
        fetchInactiveUsers(currentPage, searchTerm);
        onClose();
      }
    } catch (error) {
      console.error("Error reactivating user:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Check user payment status
  const checkUserStatus = async (userId) => {
    try {
      const response = await axios.get(`/loan-inactivation/check/${userId}?thresholdPercentage=${thresholdPercentage}`);
      
      if (response.data.success) {
        const status = response.data.data;
        toast({
          title: "Payment Status",
          description: `${status.user?.full_name}: ${status.paymentPercentage}% paid (Threshold: ${thresholdPercentage}%)`,
          status: status.shouldInactivate ? "warning" : "info",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      toast({
        title: "Error",
        description: "Failed to check user status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchInactiveUsers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInactiveUsers(1, searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchInactiveUsers(page, searchTerm);
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <style>
        {`
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
      <div className="m-6 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {t("Inactive Users Management")}
          </h2>
        </div>

        {/* Batch Inactivation Section */}
        <Box mb={6} p={4} bg="blue.50" borderRadius="md">
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="bold" color="blue.700">
              Batch Inactivation
            </Text>
            <HStack spacing={4}>
              <Text>Threshold Percentage:</Text>
              <Select
                value={thresholdPercentage}
                onChange={(e) => setThresholdPercentage(e.target.value)}
                width="150px"
              >
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="75">75%</option>
                <option value="80">80%</option>
                <option value="85">85%</option>
              </Select>
              <Button
                colorScheme="red"
                onClick={handleBatchInactivation}
                isLoading={batchLoading}
                loadingText="Processing..."
              >
                Batch Inactivate Users
              </Button>
            </HStack>
            <Alert status="info">
              <AlertIcon />
              This will automatically inactivate users who have paid less than {thresholdPercentage}% of their total loan amount.
            </Alert>
          </VStack>
        </Box>

        {/* Search Section */}
        <HStack spacing={4} mb={6}>
          <Input
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="300px"
          />
          <Button colorScheme="blue" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            fetchInactiveUsers(1, "");
          }}>
            Clear
          </Button>
        </HStack>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <TableContainer maxHeight="70vh" overflowY="auto" className="scrollbar-thin">
            <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Phone Number</Th>
                <Th>Inactivated On</Th>
                <Th>Inactivated By</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {inactiveUsers.map((user) => (
                <Tr key={user._id}>
                  <Td>{user.full_name}</Td>
                  <Td>{user.phone_number}</Td>
                  <Td>{formatDate(user.inactivated_on)}</Td>
                  <Td>{user.inactivated_by?.name || "System"}</Td>
                  <Td>
                    <Text fontSize="sm" maxW="200px" isTruncated>
                      {user.inactivation_reason}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="red">Inactive</Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => {
                          setSelectedUser(user);
                          onOpen();
                        }}
                      >
                        Reactivate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => checkUserStatus(user._id)}
                      >
                        Check Status
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </TableContainer>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <HStack spacing={2} mt={4} justify="center">
            <Button
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        )}

        {/* Reactivation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Reactivate User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text>
                  Are you sure you want to reactivate{" "}
                  <strong>{selectedUser?.full_name}</strong>?
                </Text>
                <Input
                  placeholder="Reason for reactivation (optional)"
                  value={reactivationReason}
                  onChange={(e) => setReactivationReason(e.target.value)}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={() => handleReactivateUser(selectedUser?._id)}
              >
                Reactivate
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
    </>
  );
};

export default InactiveUsers;
