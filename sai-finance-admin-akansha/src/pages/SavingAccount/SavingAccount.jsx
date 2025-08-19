import React from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [totalSavingAmt, setTotalSavingAmt] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
    async function fetchData() {
      axios.get("account/").then((response) => {
        if (response?.data) {
          setData(response?.data?.result);
          console.log(response?.data?.result);
          setFilteredData(response?.data?.result);
        }
        const sum = response.data.result.reduce((acc, item) => {
          return acc + (item.balance || 0);
        }, 0);
        setTotalSavingAmt(sum)
      });
    }
    fetchData();
  }, []);

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
      .delete(`account/${newID}`)
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
      const res = await axios.put(`account/${editData._id}`, editData);
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
        Header: "Sr No.",
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: "Account Holder",
        accessor: "account_holder_name",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.account_holder_name}`} bold={"bold"} />
          </>
        ),
      },
      {
        Header: "Account Number",
        accessor: "account_number",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.account_number}`} />
          </>
        ),
      },
      {
        Header: "Balance",
        accessor: "balance",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`₹ ${original?.balance?.toLocaleString()}`} />
          </>
        ),
      },
      {
        Header: "Account Type",
        accessor: "account_type",
        Cell: ({ value, row: { original } }) => <Cell text={original?.account_type || "Saving"} />,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value, row: { original } }) => (
          <Cell text={original?.status || "Active"} />
        ),
      },
      {
        Header: "Date Created",
        accessor: "created_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: "Phone",
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.phone_number || 'N/A'}`} />
        ),
      },
      {
        Header: "Action",
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
                  Actions
                </MenuButton>
                <MenuList>
                  <Link to={`/dash/view-saving-user/${original?._id}`}>
                    <MenuItem>
                      <HiStatusOnline className="mr-4" /> View Account
                    </MenuItem>
                  </Link>
                  <MenuItem onClick={() => { setEditData(original); setIsEditing(true); }}>
                    <MdEdit className="mr-4" /> Edit
                  </MenuItem>
                  <MenuItem onClick={() => { setNewID(original._id); onOpen(); }}>
                    <MdDelete className="mr-4" />
                    Delete
                  </MenuItem>
                  <MenuItem onClick={onOpen2}>
                    <HiStatusOnline className="mr-4" /> Status
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
      className="h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col"
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
                    colorScheme="purple"
                    className="bg-secondary hover:bg-secondaryDark text-white"
                    fontWeight={800}
                    fontSize={18}
                  >
                    Total Savings : ₹ {totalSavingAmt.toLocaleString()}
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
                    Total Accounts : {data.length}
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
                    placeholder="Search accounts..."
                    focusBorderColor="purple.500"
                    border="1px solid #949494"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <InputRightAddon p={0} border="none">
                    <Button
                      className="bg-secondary hover:bg-secondaryDark"
                      colorScheme="purple"
                      size="sm"
                      borderLeftRadius={0}
                      borderRightRadius={3.3}
                      border="1px solid #949494"
                    >
                      Search
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
                    Sort By
                  </MenuButton>
                  <MenuList>
                    <MenuItem>Balance High to Low</MenuItem>
                    <MenuItem>Balance Low to High</MenuItem>
                    <MenuItem>Name A-Z</MenuItem>
                    <MenuItem>Date Created</MenuItem>
                  </MenuList>
                </Menu>

                <Menu>
                  <Link to={`/dash/create-saving-account`}>
                    <MenuButton
                      as={Button}
                      colorScheme="purple"
                      className="bg-secondary hover:bg-secondaryDark"
                    >
                      Add New Account
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
          <div className="p-4 border-b">
            <h3 className="text-xl font-bold text-gray-800">Saving Accounts</h3>
          </div>
          
          {/* Only the table content scrolls */}
          <div className="flex-1 overflow-auto">
            <Table data={paginatedData} columns={columns} />
          </div>

          {/* Fixed Pagination */}
          <div className="flex-shrink-0 flex justify-center p-4 border-t gap-4 items-center bg-gray-50">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
              colorScheme="purple"
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm bg-secondary text-white px-4 py-2 rounded-md font-medium">
              {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages}
              colorScheme="purple"
              variant="outline"
            >
              Next
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
          <DrawerHeader>Account Details</DrawerHeader>

          <DrawerBody>
            <Input placeholder="Account details..." />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose2}>
              Cancel
            </Button>
            <Button colorScheme="purple">Save</Button>
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
              Delete Account
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this saving account? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Drawer isOpen={isEditing} placement="right" onClose={() => setIsEditing(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit Account</DrawerHeader>
          <DrawerBody>
            <Input
              placeholder="Account Holder Name"
              value={editData?.account_holder_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, account_holder_name: e.target.value })
              }
              mb={3}
            />
            <Input
              placeholder="Account Number"
              value={editData?.account_number || ""}
              onChange={(e) =>
                setEditData({ ...editData, account_number: e.target.value })
              }
              mb={3}
            />
            <Input
              placeholder="Balance"
              type="number"
              value={editData?.balance || ""}
              onChange={(e) =>
                setEditData({ ...editData, balance: parseFloat(e.target.value) })
              }
              mb={3}
            />
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleEditSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

export default SavingAccount;
