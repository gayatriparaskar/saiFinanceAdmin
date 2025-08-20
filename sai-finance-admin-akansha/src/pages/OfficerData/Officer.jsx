import React from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";

import axios from "../../axios";
import { FaArrowRightLong } from "react-icons/fa6";
import Correct from "../../Images/Vector.png";
import bgImage from "../../Images/Section (2).png";
import Info from "../../Images/ph_info-duotone.png";
import Table from "../../componant/Table/Table";
import Cell from "../../componant/Table/cell";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  InputRightAddon,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";

import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";
import { GrOverview } from "react-icons/gr";

function Officer() {
  const { t } = useLocalTranslation();
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const usersPerPage = 10;
  const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const cancelRef = React.useRef();
  const btnRef = React.useRef();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("officers/");
        if (response?.data) {
          setData(response?.data?.result || []);
          setFilteredData(response?.data?.result || []);
        }
      } catch (error) {
        console.error("Error fetching officers:", error);
        toast({
          title: "Error fetching officers",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    }
    fetchData();
  }, [toast]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const result = data.filter(
        (officer) =>
          officer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          officer.employee_id?.toString().includes(searchTerm) ||
          officer.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(result);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  const handleDelete = () => {
    axios
      .delete(`officers/${newID}`)
      .then((res) => {
        if (res.data) {
          toast({
            title: `Success! Officer has been deleted successfully`,
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top"
          });
          setData((prev) => prev.filter((item) => item._id !== newID));
          setFilteredData((prev) => prev.filter((item) => item._id !== newID));
          onClose();
        }
      })
      .catch((err) => {
        toast({
          title: `Delete Failed!`,
          description: err.response?.data?.message || "Something went wrong while deleting the officer",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  const handleEditSave = async () => {
    try {
      const res = await axios.put(`officers/${editData._id}`, editData);
      if (res.data) {
        toast({
          title: `Officer updated successfully`,
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });
        setData((prev) =>
          prev.map((item) =>
            item._id === editData._id ? { ...item, ...editData } : item
          )
        );
        setFilteredData((prev) =>
          prev.map((item) =>
            item._id === editData._id ? { ...item, ...editData } : item
          )
        );
        setIsEditing(false);
      }
    } catch (err) {
      toast({
        title: `Update Failed`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredData.slice(startIndex, startIndex + usersPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / usersPerPage);

  const columns = React.useMemo(
    () => [
      {
        Header: t('Sr No.', 'Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: t('Officer Name', 'Officer Name'),
        accessor: "name",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.name || 'N/A'}`} bold={"bold"} />
        ),
      },
      {
        Header: t('Employee ID', 'Employee ID'),
        accessor: "employee_id",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.employee_id || 'N/A'}`} />
        ),
      },
      {
        Header: t('Department', 'Department'),
        accessor: "department",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.department || 'N/A'}`} />
        ),
      },
      {
        Header: t('Position', 'Position'),
        accessor: "position",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.position || 'N/A'}`} />
        ),
      },
      {
        Header: t('Phone Number', 'Phone Number'),
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.phone_number || 'N/A'}`} />
        ),
      },
      {
        Header: t('Email', 'Email'),
        accessor: "email",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.email || 'N/A'}`} />
        ),
      },
      {
        Header: t('Join Date', 'Join Date'),
        accessor: "join_date",
        Cell: ({ value, row: { original } }) => (
          <Cell text={original?.join_date ? dayjs(original.join_date).format("D MMM, YYYY") : 'N/A'} />
        ),
      },
      {
        Header: t('Status', 'Status'),
        accessor: "status",
        Cell: ({ value, row: { original } }) => (
          <Cell text={original?.status || "Active"} translate={true} />
        ),
      },
      {
        Header: t('Action', 'Action'),
        accessor: "",
        Cell: ({ value, row: { original } }) => {
          return (
            <Menu>
              <MenuButton
                as={Button}
                className="bg-primary hover:bg-primaryDark"
                colorScheme="blue"
                onClick={() => setNewID(original._id)}
              >
                {t('Actions', 'Actions')}
              </MenuButton>
              <MenuList>
                <Link to={`/dash/view-officer/${original?._id}`}>
                  <MenuItem>
                    <HiStatusOnline className="mr-4" /> {t('View Officer', 'View Officer')}
                  </MenuItem>
                </Link>
                <MenuItem onClick={() => { setEditData(original); setIsEditing(true); }}>
                  <MdEdit className="mr-4" /> {t('Edit', 'Edit')}
                </MenuItem>
                <MenuItem onClick={() => { setNewID(original._id); onOpen(); }}>
                  <MdDelete className="mr-4" />
                  {t('Delete', 'Delete')}
                </MenuItem>
                <MenuItem onClick={onOpen2}>
                  <HiStatusOnline className="mr-4" /> {t('Status', 'Status')}
                </MenuItem>
              </MenuList>
            </Menu>
          );
        },
      },
    ],
    [data, currentPage]
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-screen bg-primaryBg flex flex-col"
    >
      {/* Fixed Header Section */}
      <motion.div 
        variants={itemVariants}
        className="flex-shrink-0 pt-20 pb-4 px-4"
      >
        <section className="md:p-1">
          <div className="py-6">
            <motion.div 
              variants={itemVariants}
              className="flex justify-between items-center mb-6"
            >
              <motion.div 
                variants={itemVariants}
                className="flex gap-2"
              >
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="blue"
                    className="bg-primary hover:bg-primaryDark text-white"
                    fontWeight={800}
                    fontSize={18}
                  >
                    {t('Total Officers', 'Total Officers')} : {data.length}
                  </MenuButton>
                </Menu>
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="purple"
                    className="bg-secondary hover:bg-secondaryDark text-white"
                    fontWeight={800}
                    fontSize={18}
                    ref={btnRef}
                    onClick={onOpen2}
                  >
                    {t('Active Officers', 'Active Officers')} : {data.filter(officer => officer.status === 'Active').length}
                  </MenuButton>
                </Menu>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="w-96"
              >
                <InputGroup borderRadius={5} size="sm">
                  <InputLeftElement
                    pointerEvents="none"
                  />
                  <Input
                    type="text"
                    placeholder={t('Search officers...', 'Search officers...')}
                    focusBorderColor="blue.500"
                    border="1px solid #949494"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <InputRightAddon p={0} border="none">
                    <Button
                      className="bg-primary hover:bg-primaryDark"
                      colorScheme="blue"
                      size="sm"
                      borderLeftRadius={0}
                      borderRightRadius={3.3}
                      border="1px solid #949494"
                    >
                      {t('Search', 'Search')}
                    </Button>
                  </InputRightAddon>
                </InputGroup>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="flex gap-2"
              >
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="gray"
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    {t('Sort By', 'Sort By')}
                  </MenuButton>
                  <MenuList>
                    <MenuItem>{t('Name A-Z')}</MenuItem>
                    <MenuItem>{t('Department')}</MenuItem>
                    <MenuItem>{t('Join Date')}</MenuItem>
                    <MenuItem>{t('Status')}</MenuItem>
                  </MenuList>
                </Menu>

                <Menu>
                  <Link to={`/dash/create-officer`}>
                    <MenuButton
                      as={Button}
                      colorScheme="blue"
                      className="bg-primary hover:bg-primaryDark"
                    >
                      {t('Add New Officer', 'Add New Officer')}
                    </MenuButton>
                  </Link>
                </Menu>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </motion.div>

      {/* Scrollable Table Section */}
      <motion.div 
        variants={itemVariants}
        className="flex-1 px-4 pb-4 overflow-hidden"
      >
        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
          {/* Only the table content scrolls */}
          <div className="flex-1 overflow-auto">
            <Table data={paginatedData} columns={columns} />
          </div>

          {/* Fixed Pagination */}
          <div className="flex-shrink-0 flex justify-center p-4 border-t gap-4 items-center bg-gray-50">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
              colorScheme="blue"
              variant="outline"
            >
              {t('Previous', 'Previous')}
            </Button>
            <span className="text-sm bg-primary text-white px-4 py-2 rounded-md font-medium">
              {currentPage} {t('of')} {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages}
              colorScheme="blue"
              variant="outline"
            >
              {t('Next', 'Next')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Drawers and Dialogs */}
      <Drawer
        isOpen={isOpen2}
        placement="right"
        onClose={onClose2}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('Officer Statistics', 'Officer Statistics')}</DrawerHeader>

          <DrawerBody>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-blue-900">{t('Total Officers', 'Total Officers')}</h4>
                <p className="text-2xl font-bold text-blue-600">{data.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-bold text-green-900">{t('Active Officers', 'Active Officers')}</h4>
                <p className="text-2xl font-bold text-green-600">
                  {data.filter(officer => officer.status === 'Active').length}
                </p>
              </div>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose2}>
              {t('Close', 'Close')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('Delete Officer', 'Delete Officer')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('Are you sure you want to delete this officer? This action cannot be undone.', 'Are you sure you want to delete this officer? This action cannot be undone.')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('Cancel', 'Cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                {t('Delete', 'Delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Drawer isOpen={isEditing} placement="right" onClose={() => setIsEditing(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('Edit Officer', 'Edit Officer')}</DrawerHeader>
          <DrawerBody>
            <div className="space-y-4">
              <Input
                placeholder={t('Officer Name', 'Officer Name')}
                value={editData?.name || ""}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
              <Input
                placeholder={t('Employee ID', 'Employee ID')}
                value={editData?.employee_id || ""}
                onChange={(e) =>
                  setEditData({ ...editData, employee_id: e.target.value })
                }
              />
              <Input
                placeholder={t('Department', 'Department')}
                value={editData?.department || ""}
                onChange={(e) =>
                  setEditData({ ...editData, department: e.target.value })
                }
              />
              <Input
                placeholder={t('Position', 'Position')}
                value={editData?.position || ""}
                onChange={(e) =>
                  setEditData({ ...editData, position: e.target.value })
                }
              />
              <Input
                placeholder={t('Phone Number', 'Phone Number')}
                value={editData?.phone_number || ""}
                onChange={(e) =>
                  setEditData({ ...editData, phone_number: e.target.value })
                }
              />
              <Input
                placeholder={t('Email', 'Email')}
                type="email"
                value={editData?.email || ""}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={() => setIsEditing(false)}>
              {t('Cancel', 'Cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              {t('Save', 'Save')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

export default Officer;
