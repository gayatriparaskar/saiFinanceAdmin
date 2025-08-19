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

function LoanAccount() {
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [totalLoanAmt, setTotalLoanAmt] = useState(0);
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
      axios.get("users/").then((response) => {
        if (response?.data) {
          setData(response?.data?.result);
          console.log(response?.data?.result);
          setFilteredData(response?.data?.result);
        }
        const sum = response.data.result.reduce((acc, item) => {
          return acc + (item.active_loan_id?.total_amount || 0);
        }, 0);
        setTotalLoanAmt(sum)
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
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number?.toString().includes(searchTerm)
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
            title: `Success! User has been deleted successfully`,
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
          description: err.response?.data?.message || "Something went wrong while deleting the user",
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
          title: `User updated successfully`,
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
        Header: "Name",
        accessor: "full_name",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.full_name}`} bold={"bold"} />
        ),
      },
      {
        Header: "Loan Amount",
        accessor: "loan_amount",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`Rs. ${original?.active_loan_id?.loan_amount}`} />
        ),
      },
      {
        Header: "Total Pay Amount",
        accessor: "total_amount",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`Rs. ${original?.active_loan_id?.total_amount}`} />
        ),
      },
      {
        Header: "Total EMI/Day",
        accessor: "emi_day",
        Cell: ({ value, row: { original } }) => <Cell text={`Rs. ${original?.active_loan_id?.emi_day}`} />,
      },
      {
        Header: "Remaining Emi",
        accessor: "remaining_emi",
        Cell: ({ value, row: { original } }) => <Cell text={`${Math.ceil(original?.active_loan_id?.total_due_amount / original?.active_loan_id?.emi_day)}`} />,
      },
      {
        Header: "Total Due Amount",
        accessor: "total_due_amount",
        Cell: ({ value, row: { original } }) => <Cell text={`Rs. ${original?.active_loan_id?.total_due_amount}`} />,
      },
      {
        Header: "Date",
        accessor: "created_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: "Mobile Number",
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${Math.ceil(value)}`} />
        ),
      },
      {
        Header: "Action",
        accessor: "",
        Cell: ({ value, row: { original } }) => {
          return (
            <Menu>
              <MenuButton
                as={Button}
                className="bg-purple "
                colorScheme="bgBlue hover:bg-secondaryLight"
                onClick={() => setNewID(original._id)}
              >
                Actions
              </MenuButton>
              <MenuList>
                <Link to={`/dash/view-user-details/${original?.active_loan_id?.user_id}`}>
                  <MenuItem >
                    <HiStatusOnline className="mr-4" /> View User
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
                    Total Collection : ₹ {totalLoanAmt.toLocaleString()}
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
                    Total Active User : {data.length}
                  </MenuButton>
                </Menu>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="w-96"
              >
                <InputGroup borderRadius={5} size="sm">
                  <InputLeftElement pointerEvents="none" />
                  <Input
                    type="text"
                    placeholder="Search..."
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
                    <MenuItem>Amount High to Low</MenuItem>
                    <MenuItem>Amount Low to High</MenuItem>
                    <MenuItem>Name A-Z</MenuItem>
                    <MenuItem>Date Created</MenuItem>
                  </MenuList>
                </Menu>

                <Menu>
                  <Link to={`/dash/create-loan-account`}>
                    <MenuButton
                      as={Button}
                      colorScheme="blue"
                      className="bg-primary hover:bg-primaryDark"
                    >
                      Add New User
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
            <h3 className="text-xl font-bold text-gray-800">Loan Accounts</h3>
          </div>

          {/* Only the table content scrolls */}
          <div className="flex-1 overflow-auto">
            <Table
              data={paginatedData}
              columns={columns}
            />
          </div>

          {/* Fixed Pagination */}
          <div className="flex-shrink-0 flex justify-center p-4 border-t gap-4 items-center bg-gray-50">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
              colorScheme="blue"
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm bg-primary text-white px-4 py-2 rounded-md font-medium">
              {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages}
              colorScheme="blue"
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
        <DrawerContent bg="slate.800" color="white">
          <DrawerCloseButton />
          <DrawerHeader>Account Details</DrawerHeader>
          <DrawerBody>
            <Input placeholder="Type here..." bg="slate.700" border="1px solid #475569" />
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose2}>
              Cancel
            </Button>
            <Button colorScheme="blue">Save</Button>
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
          <AlertDialogContent bg="slate.800" color="white">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="outline">
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
        <DrawerContent bg="slate.800" color="white">
          <DrawerCloseButton />
          <DrawerHeader>Edit User</DrawerHeader>
          <DrawerBody>
            <Input
              placeholder="Full Name"
              value={editData?.full_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, full_name: e.target.value })
              }
              mb={3}
              bg="slate.700"
              border="1px solid #475569"
            />
            <Input
              placeholder="Phone Number"
              value={editData?.phone_number || ""}
              onChange={(e) =>
                setEditData({ ...editData, phone_number: e.target.value })
              }
              mb={3}
              bg="slate.700"
              border="1px solid #475569"
            />
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

export default LoanAccount;
