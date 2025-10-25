import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../axios';
import { FaPlus, FaSearch, FaEye, FaPhone, FaUserTie, FaUsers } from 'react-icons/fa';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  // InputRightAddon,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  // DrawerCloseButton,
  // AlertDialog,
  // AlertDialogOverlay,
  // AlertDialogContent,
  // AlertDialogHeader,
  // AlertDialogBody,
  // AlertDialogFooter,
  useToast,
  Select,
  // Modal,
  // ModalOverlay,
  // ModalContent,
  // ModalHeader,
  // ModalBody,
  // ModalCloseButton,
  // ModalFooter,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useLocalTranslation } from '../../../../hooks/useLocalTranslation';
import Table from '../../../../componant/Table/Table';
import Cell from '../../../../componant/Table/cell';
import { MdEdit } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";
import { GrOverview } from "react-icons/gr";

const ManagerOfficer = () => {
  const navigate = useNavigate();
  const { t } = useLocalTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalOfficers, setTotalOfficers] = useState(0);
  const [activeOfficers, setActiveOfficers] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [sortBy, setSortBy] = useState('');
  // const [sortOrder, setSortOrder] = useState('asc');
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [officers, setOfficers] = useState([]);
  const toast = useToast();
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const cancelRef = React.useRef();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('officers');
      if (response?.data?.result) {
        const officersData = response.data.result;
        setData(officersData);
        setFilteredData(officersData);
        setTotalOfficers(officersData.length);
        setActiveOfficers(officersData.filter(officer => officer.is_active).length);
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      setIsLoadingOfficers(true);
      const response = await axios.get('officers');
      if (response?.data?.result) {
        setOfficers(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching officers for edit:', error);
    } finally {
      setIsLoadingOfficers(false);
    }
  };

  // Sort functions
  // const getSortDisplayName = (sortKey) => {
  //   const sortNames = {
  //     'name_a_to_z': 'Name (A to Z)',
  //     'name_z_to_a': 'Name (Z to A)',
  //     'type_a_to_z': 'Type (A to Z)',
  //     'type_z_to_a': 'Type (Z to A)',
  //     'status_active': 'Status (Active)',
  //     'status_inactive': 'Status (Inactive)',
  //     'date_newest': 'Date (Newest)',
  //     'date_oldest': 'Date (Oldest)'
  //   };
  //   return sortNames[sortKey] || sortKey;
  // };

  const handleSort = (sortKey) => {
    setSortBy(sortKey);
    
    let sortedData = [...filteredData];
    
    switch (sortKey) {
      case 'name_a_to_z':
        sortedData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_z_to_a':
        sortedData.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'type_a_to_z':
        sortedData.sort((a, b) => (a.role || '').localeCompare(b.role || ''));
        break;
      case 'type_z_to_a':
        sortedData.sort((a, b) => (b.role || '').localeCompare(a.role || ''));
        break;
      case 'status_active':
        sortedData.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
        break;
      case 'status_inactive':
        sortedData.sort((a, b) => (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0));
        break;
      case 'date_newest':
        sortedData.sort((a, b) => new Date(b.created_on || 0) - new Date(a.created_on || 0));
        break;
      case 'date_oldest':
        sortedData.sort((a, b) => new Date(a.created_on || 0) - new Date(b.created_on || 0));
        break;
      default:
        break;
    }
    
    setFilteredData(sortedData);
  };

  const handleEditOfficer = (officer) => {
    setEditData(officer);
    setIsEditing(true);
    fetchOfficers();
  };

  const handleEditSave = async () => {
    try {
      if (!editData) return;

      const updateData = {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        role: editData.role,
        is_active: editData.is_active
      };

      const response = await axios.put(`officers/${editData._id}`, updateData);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Officer updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Update local data
        setData(prevData => 
          prevData.map(officer => 
            officer._id === editData._id ? { ...officer, ...updateData } : officer
          )
        );
        
        handleEditClose();
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating officer:', error);
      toast({
        title: "Error",
        description: "Failed to update officer",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditClose = () => {
    setEditData(null);
    setIsEditing(false);
  };

  useEffect(() => {
    let result = data;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(officer =>
        officer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.phone?.toLowerCase().includes(searchTerm) ||
        officer.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(officer => {
        if (filterStatus === 'active') return officer.is_active === true;
        if (filterStatus === 'inactive') return officer.is_active === false;
        return true;
      });
    }
    
    setFilteredData(result);
  }, [data, searchTerm, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleViewOfficer = (officerId) => {
    navigate(`/manager-dashboard/view-officer/${officerId}`);
  };

  const getStatusColor = (status) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getOfficerTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'collection officer': return 'bg-blue-100 text-blue-800';
      case 'accounter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: t('SR NO.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={startIndex + index + 1} />,
      },
      {
        Header: t('OFFICER NAME'),
        accessor: "name",
        Cell: ({ value, row: { original } }) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              {/* <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FaUser className="h-4 w-4 text-blue-600" />
              </div> */}
            </div>
            <div className="ml-3">
              <Cell text={`${original?.name || original?.full_name}`} bold={"bold"} />
              <p className="text-xs text-gray-500">{original?.email}</p>
            </div>
          </div>
        ),
      },
      {
        Header: t('OFFICER TYPE'),
        accessor: "role",
        Cell: ({ value, row: { original } }) => (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOfficerTypeColor(original?.role)}`}>
            {original?.role?.toUpperCase() || 'Collection Officer'}
          </span>
        ),
      },
      {
        Header: t('OFFICER CODE'),
        accessor: "officer_code",
        Cell: ({ value, row: { original } }) => (
          <Cell text={original?.officer_code} />
        ),
      },
      {
        Header: t('PHONE NUMBER'),
        accessor: "phone",
        Cell: ({ value, row: { original } }) => (
          <div className="flex items-center">
            <FaPhone className="h-3 w-3 text-gray-400 mr-2" />
            <Cell text={`${original?.phone_number || 'N/A'}`} />
          </div>
        ),
      },
      {
        Header: t('STATUS'),
        accessor: "is_active",
        Cell: ({ value, row: { original } }) => {
          const isActive = original?.is_active;
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(isActive)}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        Header: t('ACTION'),
        accessor: "action",
        Cell: ({ value, row: { original } }) => (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleViewOfficer(original._id)}
              className="text-blue-600 hover:text-blue-900 p-1"
              title="View Details"
            >
              <FaEye />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleEditOfficer(original)}
              className="text-purple-600 hover:text-purple-900 p-1"
              title="Edit Officer"
            >
              <MdEdit />
            </motion.button>
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                <HiStatusOnline />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleViewOfficer(original._id)}>
                  <GrOverview className="mr-2" />
                  View Details
                </MenuItem>
                <MenuItem onClick={() => handleEditOfficer(original)}>
                  <MdEdit className="mr-2" />
                  Edit Officer
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        ),
      },
    ],
    [startIndex, t]
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

  // const itemVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: { duration: 0.5 }
  //   }
  // };

  return (
    <>
      <style>
        {`
          .saving-header-responsive {
            @media (max-width: 640px) {
              padding: 1rem;
            }
          }
          .search-section {
            @media (max-width: 640px) {
              flex-direction: column;
              gap: 0.75rem;
            }
          }
          .actions-section {
            @media (max-width: 640px) {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        `}
      </style>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-2 sm:px-4 lg:px-6 bg-primaryBg pt-4"
      >
      <div className="md:p-1">
        {/* Header Section */}
        <div className="saving-header-responsive  p-4 sm:p-6 mb-4 sm:mb-6">
          
          

          {/* Search and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="search-section flex flex-col sm:flex-row gap-4 flex-1">
                 {/* Stats Buttons */}
          
            <Button
             
              colorScheme="blue"
              p={0}
              className="flex-1 bg-primaryDark hover:bg-primaryLight text-white"
              leftIcon={<FaUsers />}
            >
              {t('Total Officers')} {totalOfficers}
            </Button>
            <Button
              p={0}
              colorScheme="purple"
              className="flex-1 bg-primaryDark hover:bg-primaryLight text-white"
              leftIcon={<FaUserTie />}
            >
              {t('Active Officers')} {activeOfficers}
            </Button>
              <InputGroup className="flex-1">
                <InputLeftElement pointerEvents="none">
                  <FaSearch className="text-gray-400" />
                </InputLeftElement>
                <Input
                  placeholder={t('Search...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </InputGroup>
              
              <Button
                colorScheme="blue"
                size="sm"
                className="w-full sm:w-auto"
              >
                {t('Search')}
              </Button>
              
              <Menu>
                <MenuButton as={Button}  className="w-full sm:w-auto">
                  {t('Sort By')}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => handleSort('name_a_to_z')}>{t('Name (A to Z)')}</MenuItem>
                  <MenuItem onClick={() => handleSort('name_z_to_a')}>{t('Name (Z to A)')}</MenuItem>
                  <MenuItem onClick={() => handleSort('type_a_to_z')}>{t('Type (A to Z)')}</MenuItem>
                  <MenuItem onClick={() => handleSort('type_z_to_a')}>{t('Type (Z to A)')}</MenuItem>
                  <MenuItem onClick={() => handleSort('status_active')}>{t('Status (Active)')}</MenuItem>
                  <MenuItem onClick={() => handleSort('status_inactive')}>{t('Status (Inactive)')}</MenuItem>
                  <MenuItem onClick={() => handleSort('date_newest')}>{t('Date (Newest)')}</MenuItem>
                  <MenuItem onClick={() => handleSort('date_oldest')}>{t('Date (Oldest)')}</MenuItem>
                </MenuList>
              </Menu>
            </div>

            <div className="actions-section flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => navigate('/manager-dashboard/create-officer')}
                leftIcon={<FaPlus />}
                className="w-full sm:w-auto"
              >
                {t('Add New Officer')}
              </Button>
              
              <Button
                colorScheme="gray"
                size="sm"
                onClick={fetchData}
                leftIcon={<FaSearch />}
                className="w-full sm:w-auto"
              >
                {t('Refresh Data')}
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">{t('Loading officers...')}</span>
            </div>
          ) : (
            <Table
              data={paginatedData}
              columns={columns}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Edit Officer Drawer */}
      <Drawer isOpen={isEditing} onClose={handleEditClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <div className="flex items-center gap-3">
              <MdEdit className="text-blue-600" />
              <span>{t('Edit Officer')}</span>
            </div>
          </DrawerHeader>
          <DrawerBody>
            {editData && (
              <div className="space-y-4">
                <FormControl>
                  <FormLabel>{t('Officer Name')}</FormLabel>
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    placeholder={t('Enter officer name')}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>{t('Email')}</FormLabel>
                  <Input
                    value={editData.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    placeholder={t('Enter email')}
                    type="email"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>{t('Phone Number')}</FormLabel>
                  <Input
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    placeholder={t('Enter phone number')}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>{t('Officer Type')}</FormLabel>
                  <Select
                    value={editData.role || ''}
                    onChange={(e) => setEditData({...editData, role: e.target.value})}
                  >
                    <option value="collection_officer">{t('Collection Officer')}</option>
                    <option value="accounter">{t('Accounter')}</option>
                    <option value="manager">{t('Manager')}</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>{t('Status')}</FormLabel>
                  <Select
                    value={editData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setEditData({...editData, is_active: e.target.value === 'active'})}
                  >
                    <option value="active">{t('Active')}</option>
                    <option value="inactive">{t('Inactive')}</option>
                  </Select>
                </FormControl>
              </div>
            )}
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={handleEditClose}>
              {t('Cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave} isLoading={isLoadingOfficers}>
              {t('Save Changes')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      </motion.div>
    </>
  );
};

export default ManagerOfficer;