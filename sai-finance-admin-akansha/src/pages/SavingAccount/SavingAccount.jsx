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
import { createTimeoutAwareCall } from "../../utils/retryHelper";
import ApiLoader from "../../components/LoadingStates/ApiLoader";
import ApiErrorHandler from "../../components/ErrorBoundary/ApiErrorHandler";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
} from "@chakra-ui/react";

import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";

function SavingAccount() {
  const { t } = useLocalTranslation();
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [totalSavingAmt, setTotalSavingAmt] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const usersPerPage = 10;
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const cancelRef = React.useRef();
  const btnRef = React.useRef();

  useEffect(() => {
    const fetchData = createTimeoutAwareCall(
      () => axios.get("account/"),
      {
        maxRetries: 3,
        showToast: toast,
        fallbackData: { result: [] },
        errorMessage: "Failed to load savings accounts. Please check your connection and try again."
      }
    );

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchData();
        if (response?.data) {
          setData(response?.data?.result || []);
          console.log(response?.data?.result);
          setFilteredData(response?.data?.result || []);

          // Calculate total safely
          const sum = (response.data.result || []).reduce((acc, item) => {
            return acc + (item.amount_to_be || 0);
          }, 0);
          setTotalSavingAmt(sum);
        }
      } catch (error) {
        console.error('Failed to load savings accounts:', error);
        setError(error);
        // Fallback data
        setData([]);
        setFilteredData([]);
        setTotalSavingAmt(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Retry function for error recovery
  const handleRetry = () => {
    const fetchData = createTimeoutAwareCall(
      () => axios.get("account/"),
      {
        maxRetries: 3,
        showToast: toast,
        fallbackData: { result: [] },
        errorMessage: "Failed to load savings accounts. Please check your connection and try again."
      }
    );

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchData();
        if (response?.data) {
          setData(response?.data?.result || []);
          setFilteredData(response?.data?.result || []);

          const sum = (response.data.result || []).reduce((acc, item) => {
            return acc + (item.amount_to_be || 0);
          }, 0);
          setTotalSavingAmt(sum);
        }
      } catch (error) {
        setError(error);
        setData([]);
        setFilteredData([]);
        setTotalSavingAmt(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const result = data.filter(
        (user) =>
          user.account_holder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.account_number?.toString().includes(searchTerm)
      );
      setFilteredData(result);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  const handleDelete = () => {
    axios
      .delete(`users/${newID}`)
      .then((res) => {
        if (res.data) {
          toast({
            title: `Success! Account has been deleted successfully`,
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
          description: err.response?.data?.message || "Something went wrong while deleting the account",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  const handleEditSave = async () => {
    try {
      const res = await axios.put(`users/${editData._id}`, editData);
      if (res.data) {
        toast({
          title: `Account updated successfully`,
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

        Header: t('Account Holder', 'खाता धारक'),
        accessor: "full_name",



        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.full_name}`} bold={"bold"} />
          </>
        ),
      },
      {
        Header: t('Account Number', 'Account Number'),
        accessor: "account_number",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.saving_account_id?.amount_to_be}`} />
          </>
        ),
      },
      {

        Header: t('Balance', 'शेष राशि'),
        accessor: "amount_to_be",

        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`₹ ${original?.saving_account_id?.amount_to_be?.toLocaleString()}`} />
          </>
        ),
      },
      {

        Header: t('Total Amount', 'कुल राशि'),
        accessor: "total_amount",
        Cell: ({ value, row: { original } }) => <Cell text={original?.saving_account_id?.total_amount} />,

      },
      {
        Header: t('Status', 'Status'),
        accessor: "status",
        Cell: ({ value, row: { original } }) => (
          <Cell text={original?.status || "Active"} translate={true} />
        ),
      },
      {
        Header: t('Date Created', 'Date Created'),
        accessor: "created_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: t('Phone', 'Phone'),
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.phone_number || 'N/A'}`} />
        ),
      },
      {
        Header: t('Action', 'Action'),
        accessor: "",
        Cell: ({ value, row: { original } }) => {
          return (
            <>
              <Menu>
                <MenuButton
                  as={Button}
                  className="bg-secondary hover:bg-secondaryDark"
                  colorScheme="purple"
                  onClick={() => setNewID(original._id)}
                >
                  {t('Actions', 'Actions')}
                </MenuButton>
                <MenuList>
                  <Link to={`/dash/view-savingUser-details/${original?._id}`}>
                    <MenuItem>
                      <HiStatusOnline className="mr-4" /> {t('View Account', 'खाता देखें')}
                    </MenuItem>
                  </Link>
                  <MenuItem onClick={() => { setEditData(original); setIsEditing(true); }}>
                    <MdEdit className="mr-4" /> {t('Edit', 'संपादित करें')}
                  </MenuItem>
                  <MenuItem onClick={() => { setNewID(original._id); onOpen(); }}>
                    <MdDelete className="mr-4" />
                    {t('Delete', 'हटाएं')}
                  </MenuItem>
                  <MenuItem onClick={onOpen2}>
                    <HiStatusOnline className="mr-4" /> {t('Status', 'स्थिति')}
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
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
        className="flex-shrink-0 pt-20 pb-0 px-4"
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
                    colorScheme="purple"
                    className="bg-secondary hover:bg-secondaryDark text-white"
                    fontWeight={800}
                    fontSize={18}
                  >
                    {t('Total Savings', 'Total Savings')} : ₹ {totalSavingAmt.toLocaleString()}
                  </MenuButton>
                </Menu>
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="blue"
                    className="bg-primary hover:bg-primaryDark text-white"
                    fontWeight={800}
                    fontSize={18}
                    ref={btnRef}
                    onClick={onOpen2}
                  >
                    {t('Total Accounts', 'Total Accounts')} : {data.length}
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
                    placeholder={t('Search accounts...', 'खाते खोजें...')}
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
                    <MenuItem>{t('Balance High to Low', 'Balance High to Low')}</MenuItem>
                    <MenuItem>{t('Balance Low to High', 'Balance Low to High')}</MenuItem>
                    <MenuItem>{t('Name A-Z', 'Name A-Z')}</MenuItem>
                    <MenuItem>{t('Date Created', 'Date Created')}</MenuItem>
                  </MenuList>
                </Menu>

                <Menu>
                  <Link to={`/dash/create-saving-account`}>
                    <MenuButton
                      as={Button}
                      colorScheme="blue"
                      className="bg-primary hover:bg-primaryDark"
                    >
                      {t('Add New Account', 'Add New Account')}
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
        className="flex-1 px-4 pb-0 overflow-hidden mt-0"
      >

        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col mt-0">
          

          {/* Only the table content scrolls */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <ApiLoader
                message="Loading savings accounts..."
                size="lg"
              />
            ) : error ? (
              <ApiErrorHandler
                error={error}
                onRetry={handleRetry}
                message="Failed to load savings accounts"
              />
            ) : (
              <Table data={paginatedData} columns={columns} />
            )}
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
              {currentPage} {t('of', 'of')} {totalPages}
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
          <DrawerHeader>{t('Account Details', 'Account Details')}</DrawerHeader>

          <DrawerBody>
            <Input placeholder={t('Account details...', 'Account details...')} />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose2}>
              {t('Cancel', 'Cancel')}
            </Button>
            <Button colorScheme="blue">{t('Save', 'Save')}</Button>
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
              {t('Delete Account', 'Delete Account')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('Are you sure you want to delete this saving account? This action cannot be undone.', 'Are you sure you want to delete this saving account? This action cannot be undone.')}
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
          <DrawerHeader>{t('Edit Account', 'Edit Account')}</DrawerHeader>
          <DrawerBody>
            <div className="space-y-4">
              <Input
                placeholder={t('Account Holder Name', 'Account Holder Name')}
                value={editData?.account_holder_name || ""}
                onChange={(e) =>
                  setEditData({ ...editData, account_holder_name: e.target.value })
                }
              />
              <Input
                placeholder={t('Account Number', 'Account Number')}
                value={editData?.account_number || ""}
                onChange={(e) =>
                  setEditData({ ...editData, account_number: e.target.value })
                }
              />
              <Input
                placeholder={t('Balance', 'Balance')}
                type="number"
                value={editData?.balance || ""}
                onChange={(e) =>
                  setEditData({ ...editData, balance: parseFloat(e.target.value) })
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

export default SavingAccount;
