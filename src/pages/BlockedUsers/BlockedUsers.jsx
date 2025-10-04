import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Button, 
  useToast, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  Badge,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  Textarea,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { FaUserSlash, FaUserCheck, FaEye, FaBan, FaUnlock } from 'react-icons/fa';
import axios from '../../axios';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import Table from '../../componant/Table/Table';
import Cell from '../../componant/Table/cell';
import dayjs from 'dayjs';
import NewNavbar from '../Dashboard/main/NewNavbar';

const BlockedUsers = () => {
  const { t } = useLocalTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isUnblockOpen, onOpen: onUnblockOpen, onClose: onUnblockClose } = useDisclosure();
  const { isOpen: isBlockOpen, onOpen: onBlockOpen, onClose: onBlockClose } = useDisclosure();
  
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const usersPerPage = 10;

  // Fetch blocked users
  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admins/blocked-users');
      if (response.data) {
        setBlockedUsers(response.data.result.blockedUsers || []);
        setFilteredData(response.data.result.blockedUsers || []);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blocked users',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(blockedUsers);
    } else {
      const filtered = blockedUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm) ||
        user.block_reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, blockedUsers]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Block user function
  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for blocking',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post('/admins/block-user', {
        userId: selectedUser._id,
        blockReason: blockReason.trim()
      });

      if (response.data) {
        toast({
          title: 'Success',
          description: `User ${selectedUser.full_name} has been blocked`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        setBlockReason('');
        setSelectedUser(null);
        onBlockClose();
        fetchBlockedUsers();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to block user',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Unblock user function
  const handleUnblockUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.post('/admins/unblock-user', {
        userId: selectedUser._id
      });

      if (response.data) {
        toast({
          title: 'Success',
          description: `User ${selectedUser.full_name} has been unblocked`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        setSelectedUser(null);
        onUnblockClose();
        fetchBlockedUsers();
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to unblock user',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: t('Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
        minWidth: 60,
        width: 60,
      },
      {
        Header: t('User Name'),
        accessor: "full_name",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.full_name || '-'}`} bold={"bold"} />
        ),
        minWidth: 150,
      },
      {
        Header: t('Phone Number'),
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.phone_number || '-'}`} />
        ),
        minWidth: 120,
      },
      {
        Header: t('Account Type'),
        accessor: "account_type",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.account_type || '-'}`} />
        ),
        minWidth: 120,
      },
      {
        Header: t('Block Reason'),
        accessor: "block_reason",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.block_reason || '-'}`} />
        ),
        minWidth: 200,
      },
      {
        Header: t('Blocked By'),
        accessor: "blocked_by",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.blocked_by?.name || '-'}`} />
        ),
        minWidth: 120,
      },
      {
        Header: t('Blocked On'),
        accessor: "blocked_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={original?.blocked_on ? dayjs(original.blocked_on).format("D MMM, YYYY h:mm A") : '-'} />
        ),
        minWidth: 150,
      },
      {
        Header: t('Status'),
        accessor: "is_blocked",
        Cell: ({ value, row: { original } }) => (
          <Badge colorScheme="red" variant="solid">
            {t('Blocked')}
          </Badge>
        ),
        minWidth: 100,
      },
      {
        Header: t('Actions'),
        accessor: "actions",
        Cell: ({ value, row: { original } }) => (
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<FaUnlock />}
              onClick={() => {
                setSelectedUser(original);
                onUnblockOpen();
              }}
            >
              {t('Unblock')}
            </Button>
          </HStack>
        ),
        minWidth: 120,
      },
    ],
    [t]
  );

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
    <div className="min-h-screen bg-gray-50">
      <NewNavbar />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pt-16 sm:pt-20"
      >
        <motion.div variants={itemVariants} className="p-6">
          <Box className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaUserSlash className="text-red-500" />
                  {t('Blocked Users')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('Manage blocked users and their account restrictions')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  colorScheme="red"
                  leftIcon={<FaBan />}
                  onClick={() => {
                    setSelectedUser(null);
                    setBlockReason('');
                    onBlockOpen();
                  }}
                >
                  {t('Block New User')}
                </Button>
              </div>
            </div>

            {/* Search and Stats */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('Search users...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {t('Total Blocked Users')}: <span className="font-semibold">{filteredData.length}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
              <div className="flex-1 overflow-auto">
                <div className="overflow-x-auto min-w-full">
                  <div className="min-w-[800px]">
                    <Table data={paginatedData} columns={columns} />
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row justify-center p-4 border-t gap-4 items-center bg-gray-50">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    isDisabled={currentPage === 1}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                  >
                    {t('Previous')}
                  </Button>
                  <span className="flex items-center px-3 py-1 text-sm text-gray-600">
                    {t('Page')} {currentPage} {t('of')} {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    isDisabled={currentPage === totalPages}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                  >
                    {t('Next')}
                  </Button>
                </div>
              </div>
            </div>
          </Box>
        </motion.div>
      </motion.div>

      {/* Block User Modal */}
      <Modal isOpen={isBlockOpen} onClose={onBlockClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaBan className="text-red-500" />
              <Text>{t('Block User')}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                {t('Enter the reason for blocking this user. This will prevent them from creating new accounts.')}
              </Text>
              <FormControl>
                <FormLabel>{t('Block Reason')}</FormLabel>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder={t('Enter reason for blocking...')}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onBlockClose}>
              {t('Cancel')}
            </Button>
            <Button colorScheme="red" onClick={handleBlockUser}>
              {t('Block User')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Unblock User Confirmation */}
      <AlertDialog isOpen={isUnblockOpen} onClose={onUnblockClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <HStack>
                <FaUnlock className="text-green-500" />
                <Text>{t('Unblock User')}</Text>
              </HStack>
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('Are you sure you want to unblock')} <strong>{selectedUser?.full_name}</strong>? 
              {t('This will allow them to create new accounts again.')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onUnblockClose}>
                {t('Cancel')}
              </Button>
              <Button colorScheme="green" onClick={handleUnblockUser} ml={3}>
                {t('Unblock')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

export default BlockedUsers;
