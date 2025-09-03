import React, { useState, useEffect } from "react";
import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
import { motion } from "framer-motion";
import {
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  InputGroup,
  InputLeftElement,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import dayjs from "dayjs";

const AdminUserManagement = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("admin/all-users");
      if (response?.data) {
        setUsers(response.data.result || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch users"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by account type
    if (activeTab === "loan") {
      filtered = filtered.filter(user => user.loan_details);
    } else if (activeTab === "saving") {
      filtered = filtered.filter(user => user.saving_details);
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    onEditOpen();
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleSaveUser = async () => {
    try {
      const endpoint = editingUser.loan_details 
        ? `admin/edit-loan-user/${editingUser._id}`
        : `admin/edit-saving-user/${editingUser._id}`;

      const response = await axios.put(endpoint, editingUser);
      
      if (response?.data) {
        toast({
          title: t("Success"),
          description: t("User details updated successfully"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        
        await fetchUsers();
        onEditClose();
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: t("Error"),
        description: t("Failed to update user details"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const getAccountTypeBadge = (user) => {
    if (user.loan_details && user.saving_details) {
      return <Badge colorScheme="purple">Both</Badge>;
    } else if (user.loan_details) {
      return <Badge colorScheme="blue">Loan</Badge>;
    } else if (user.saving_details) {
      return <Badge colorScheme="green">Saving</Badge>;
    }
    return <Badge colorScheme="gray">None</Badge>;
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-primaryBg flex flex-col pt-16"
    >
      <div className="px-6 py-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-purple">
              {t("Admin User Management")}
            </h1>
            <Button
              colorScheme="blue"
              onClick={fetchUsers}
              isLoading={loading}
            >
              {t("Refresh")}
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Text color="gray.300">🔍</Text>
              </InputLeftElement>
              <Input
                placeholder={t("Search by name, phone, or email")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab>{t("All Users")} ({users.length})</Tab>
              <Tab>{t("Loan Users")} ({users.filter(u => u.loan_details).length})</Tab>
              <Tab>{t("Saving Users")} ({users.filter(u => u.saving_details).length})</Tab>
            </TabList>
          </Tabs>
        </motion.div>

        {/* Users Table */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
              <p className="mt-4 text-gray-600">{t("Loading users...")}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Text color="gray.600">
                  {searchTerm ? t("No users found matching your search") : t("No users found")}
                </Text>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <Heading size="md">{t("Users List")}</Heading>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{t("Name")}</Th>
                      <Th>{t("Contact")}</Th>
                      <Th>{t("Account Type")}</Th>
                      <Th>{t("Officer")}</Th>
                      <Th>{t("Created")}</Th>
                      <Th>{t("Actions")}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredUsers.map((user) => (
                      <Tr key={user._id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">{user.full_name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {user.email || t("No email")}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text>{user.phone_number}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {user.address || t("No address")}
                          </Text>
                        </Td>
                        <Td>
                          {getAccountTypeBadge(user)}
                          {user.loan_details && (
                            <Text fontSize="xs" mt="1">
                              ₹{user.loan_details.loan_amount?.toLocaleString()}
                            </Text>
                          )}
                          {user.saving_details && (
                            <Text fontSize="xs" mt="1">
                              ₹{user.saving_details.balance?.toLocaleString()}
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {user.officer_id?.name || t("Unassigned")}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {user.officer_id?.officer_code}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {dayjs(user.created_on).format("D MMM, YYYY")}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              onClick={() => handleViewUser(user)}
                              colorScheme="blue"
                              variant="ghost"
                            >
                              👁️ {t("View")}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              colorScheme="green"
                              variant="ghost"
                            >
                              ✏️ {t("Edit")}
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          )}
        </motion.div>
      </div>

      {/* View User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("User Details")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">{t("Personal Information")}</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">{t("Name")}:</Text>
                        <Text>{selectedUser.full_name}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">{t("Phone")}:</Text>
                        <Text>{selectedUser.phone_number}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">{t("Email")}:</Text>
                        <Text>{selectedUser.email || t("Not provided")}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">{t("Address")}:</Text>
                        <Text>{selectedUser.address || t("Not provided")}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">{t("Officer")}:</Text>
                        <Text>{selectedUser.officer_id?.name || t("Unassigned")}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {selectedUser.loan_details && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">{t("Loan Details")}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Loan Amount")}:</Text>
                          <Text>₹{selectedUser.loan_details.loan_amount?.toLocaleString()}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Interest Rate")}:</Text>
                          <Text>{selectedUser.loan_details.interest_rate}%</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Daily EMI")}:</Text>
                          <Text>₹{selectedUser.loan_details.emi_day}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("End Date")}:</Text>
                          <Text>{dayjs(selectedUser.loan_details.end_date).format("D MMM, YYYY")}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Total Due")}:</Text>
                          <Text color="red.600">₹{selectedUser.loan_details.total_due_amount?.toLocaleString()}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Total Penalty")}:</Text>
                          <Text color="orange.600">₹{selectedUser.loan_details.total_penalty_amount?.toLocaleString()}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {selectedUser.saving_details && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">{t("Saving Account Details")}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Account Number")}:</Text>
                          <Text>{selectedUser.saving_details.account_number}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Account Type")}:</Text>
                          <Text>{selectedUser.saving_details.account_type}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Balance")}:</Text>
                          <Text color="green.600">₹{selectedUser.saving_details.balance?.toLocaleString()}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{t("Interest Rate")}:</Text>
                          <Text>{selectedUser.saving_details.interest_rate}%</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>{t("Close")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Edit User Details")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingUser && (
              <VStack spacing={6} align="stretch">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <Heading size="md">{t("Personal Information")}</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>{t("Full Name")}</FormLabel>
                        <Input
                          value={editingUser.full_name || ""}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            full_name: e.target.value
                          })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t("Phone Number")}</FormLabel>
                        <Input
                          value={editingUser.phone_number || ""}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            phone_number: e.target.value
                          })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t("Email")}</FormLabel>
                        <Input
                          value={editingUser.email || ""}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            email: e.target.value
                          })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t("Address")}</FormLabel>
                        <Input
                          value={editingUser.address || ""}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            address: e.target.value
                          })}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Loan Details */}
                {editingUser.loan_details && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">{t("Loan Details")}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <HStack spacing={4} w="full">
                          <FormControl>
                            <FormLabel>{t("Loan Amount")}</FormLabel>
                            <Input
                              type="number"
                              value={editingUser.loan_details.loan_amount || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                loan_details: {
                                  ...editingUser.loan_details,
                                  loan_amount: Number(e.target.value)
                                }
                              })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>{t("Interest Rate (%)")}</FormLabel>
                            <Input
                              type="number"
                              value={editingUser.loan_details.interest_rate || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                loan_details: {
                                  ...editingUser.loan_details,
                                  interest_rate: Number(e.target.value)
                                }
                              })}
                            />
                          </FormControl>
                        </HStack>
                        <HStack spacing={4} w="full">
                          <FormControl>
                            <FormLabel>{t("Daily EMI")}</FormLabel>
                            <Input
                              type="number"
                              value={editingUser.loan_details.emi_day || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                loan_details: {
                                  ...editingUser.loan_details,
                                  emi_day: Number(e.target.value)
                                }
                              })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>{t("End Date")}</FormLabel>
                            <Input
                              type="date"
                              value={editingUser.loan_details.end_date ? dayjs(editingUser.loan_details.end_date).format("YYYY-MM-DD") : ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                loan_details: {
                                  ...editingUser.loan_details,
                                  end_date: new Date(e.target.value)
                                }
                              })}
                            />
                          </FormControl>
                        </HStack>
                        <HStack spacing={4} w="full">
                          <FormControl>
                            <FormLabel>{t("Total Due Amount")}</FormLabel>
                            <Input
                              type="number"
                              value={editingUser.loan_details.total_due_amount || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                loan_details: {
                                  ...editingUser.loan_details,
                                  total_due_amount: Number(e.target.value)
                                }
                              })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>{t("Total Penalty Amount")}</FormLabel>
                            <Input
                              type="number"
                              value={editingUser.loan_details.total_penalty_amount || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                loan_details: {
                                  ...editingUser.loan_details,
                                  total_penalty_amount: Number(e.target.value)
                                }
                              })}
                            />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Saving Account Details */}
                {editingUser.saving_details && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">{t("Saving Account Details")}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <HStack spacing={4} w="full">
                          <FormControl>
                            <FormLabel>{t("Account Number")}</FormLabel>
                            <Input
                              value={editingUser.saving_details.account_number || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                saving_details: {
                                  ...editingUser.saving_details,
                                  account_number: e.target.value
                                }
                              })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>{t("Account Type")}</FormLabel>
                            <Select
                              value={editingUser.saving_details.account_type || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                saving_details: {
                                  ...editingUser.saving_details,
                                  account_type: e.target.value
                                }
                              })}
                            >
                              <option value="savings">{t("Savings")}</option>
                              <option value="current">{t("Current")}</option>
                              <option value="fixed">{t("Fixed Deposit")}</option>
                            </Select>
                          </FormControl>
                        </HStack>
                        <HStack spacing={4} w="full">
                          <FormControl>
                            <FormLabel>{t("Balance")}</FormLabel>
                            <Input
                              type="number"
                              value={editingUser.saving_details.balance || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                saving_details: {
                                  ...editingUser.saving_details,
                                  balance: Number(e.target.value)
                                }
                              })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>{t("Interest Rate (%)")}</FormLabel>
                            <Input
                              type="number"
                              value={editingUser.saving_details.interest_rate || ""}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                saving_details: {
                                  ...editingUser.saving_details,
                                  interest_rate: Number(e.target.value)
                                }
                              })}
                            />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{t("Note")}</AlertTitle>
                    <AlertDescription>
                      {t("You can edit all user details including loan amounts, interest rates, balances, and personal information. Changes will be applied immediately.")}
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              {t("Cancel")}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveUser}>
              {t("Save Changes")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default AdminUserManagement;
