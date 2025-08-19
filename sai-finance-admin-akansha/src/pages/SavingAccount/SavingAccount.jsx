import React from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

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
      axios.get("account/").then((response) => {
        if (response?.data) {
          setData(response?.data?.result);
          console.log(response?.data?.result);
          setFilteredData(response?.data?.result);

          const sum = response.data.result.reduce(
            (acc, item) => acc + (item.amount_to_be || 0),
            0
          );
          setTotalLoanAmt(sum);
        }
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
            title: `Success! This loan account has been deleted`,
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top",
          });
          window.location.reload();
        }
      })
      .catch(() => {
        toast({
          title: `Something went wrong!`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
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
        Cell: ({ row: { original } }) => (
          <Cell text={`${original?.full_name}`} bold={"bold"} />
        ),
      },
      {
        Header: "Phone Number",
        accessor: "phone_number",
        Cell: ({ value }) => <Cell text={value} />,
      },
      {
        Header: "Daily Amount",
        accessor: "amount_to_be",
        Cell: ({ row: { original } }) => (
          <Cell text={`Rs. ${original?.saving_account_id?.amount_to_be}`} />
        ),
      },
      {
        Header: "Total Amount",
        accessor: "total_amount",
        Cell: ({ row: { original } }) => (
          <Cell text={`Rs. ${original?.saving_account_id?.total_amount + original?.saving_account_id?.current_amount  }`} />
        ),
      },
      // {
      //   Header: "Total Interest Pay",
      //   accessor: "total_interest_pay",
      //   Cell: ({ row: { original } }) => (
      //     <Cell
      //       text={`Rs. ${original?.saving_account_id?.total_interest_pay}`}
      //     />
      //   ),
      // },
      {
        Header: "Total Withdrawal",
        accessor: "total_withdrawal",
        Cell: ({ row: { original } }) => (
          <Cell text={`Rs. ${original?.saving_account_id?.total_withdrawal}`} />
        ),
      },
         {
              Header: "Date",
              accessor: "created_on",
              Cell: ({ value, row: { original } }) => (
                <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
              ),
            },
      {
        Header: "Interest Rate",
        accessor: "interest_rate",
        Cell: ({ row: { original } }) => (
          <Cell text={`${original?.saving_account_id?.interest_rate}%`} />
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row: { original } }) => (
          <Menu>
            <MenuButton
              as={Button}
              className="bg-purple"
              colorScheme="bgBlue"
              onClick={() => setNewID(original?._id)}
            >
              Actions
            </MenuButton>
            <MenuList>
              {(() => {
                const idForView = original?.user_id?._id || original?._id;
                return (
                  <Link to={`/dash/view-savingUser-details/${idForView}`}>
                    <MenuItem>
                      <HiStatusOnline className="mr-4" /> View User
                    </MenuItem>
                  </Link>
                );
              })()}
              {/* <Link to={`/dash/edit-course/${original._id}`}> */}
              <MenuItem onClick={() => { setEditData(original); setIsEditing(true); }}>
                <MdEdit className="mr-4" /> Edit
              </MenuItem>
              {/* </Link> */}
              <MenuItem onClick={onOpen}>
                <MdDelete className="mr-4" /> Delete
              </MenuItem>
              <MenuItem onClick={onOpen2}>
                <HiStatusOnline className="mr-4" /> Status
              </MenuItem>
            </MenuList>
          </Menu>
        ),
      },
    ],
    [data, currentPage]
  );


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
        // Update state without reload
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

  return (
    <div
      className="lg:py-8 py-4 bg-primaryBg"
    // style={{
    //   backgroundImage: `url('${bgImage}')`,
    //   backgroundSize: "cover",
    //   backgroundRepeat: "no-repeat",
    //   backgroundPosition: "center",
    // }}
    >
      <section className=" md:p-1 ">
        <div className="py-6 ">
          <div className="flex  justify-between items-center">
            {/* <div>
              <h2 class="text-xl font-bold  mb-4 text-purple text-oswald">
                Demo User
              </h2>
            </div> */}

            <div className="flex gap-2">
              <Menu>
                <MenuButton
                  as={Button}
                  colorScheme="#FF782D"
                  zIndex={20}
                  className="bg-primary"
                  fontWeight={800}
                  fontSize={18}
                >
                  Total Collection : ₹ {totalLoanAmt}
                </MenuButton>
              </Menu>
              <Menu>
                <MenuButton
                  as={Button}
                  colorScheme="#FF782D"
                  zIndex={20}
                  className="bg-primary"
                  fontWeight={800}
                  fontSize={18}
                  ref={btnRef}
                  onClick={onOpen2}
                >
                  Total Active User : {data.length}
                </MenuButton>
              </Menu>
            </div>
            <div className=" w-96">
              <InputGroup borderRadius={5} size="sm">
                <InputLeftElement
                  pointerEvents="none"
                // children={<Search2Icon color="gray.600" />}
                />
                <Input
                  type="text"
                  placeholder="Search..."
                  focusBorderColor="teal.500"
                  border="1px solid #949494 "
                  value={searchTerm} // bind value
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <InputRightAddon p={0} border="none">
                  <Button
                    className="bg-primary hover:bg-primaryLight"
                    colorScheme="#FF782D"
                    size="sm"
                    borderLeftRadius={0}
                    borderRightRadius={3.3}
                    border="1px solid #949494"
                  // onClick={handleSearch}
                  >
                    Search
                  </Button>
                </InputRightAddon>
              </InputGroup>
            </div>


            <div className="flex gap-2">
              <Menu>
                <MenuButton
                  as={Button}
                  colorScheme="#FF782D"
                  zIndex={20}
                  className="bg-bgBlue hover:bg-yellow-300"

                >
                  Sort By
                </MenuButton>
                <MenuList zIndex={20}>
                  <MenuItem>Download</MenuItem>
                  <MenuItem>Create a Copy</MenuItem>
                  <MenuItem>Mark as Draft</MenuItem>
                  <MenuItem>Delete</MenuItem>
                  <MenuItem>Attend a Workshop</MenuItem>
                </MenuList>
              </Menu>

              <Menu>
                <Link to={`/dash/create-saving-account`}>
                  <MenuButton
                    as={Button}
                    colorScheme="#FF782D"
                    zIndex={20}
                    className="bg-primary hover:bg-primaryLight"
                  //   ref={btnRef}  onClick={onOpen2}
                  >
                    Add New User
                  </MenuButton>
                </Link>
              </Menu>
            </div>
            <Drawer
              isOpen={isOpen2}
              placement="right"
              onClose={onClose2}
              finalFocusRef={btnRef}
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Create your account</DrawerHeader>

                <DrawerBody>
                  <Input placeholder="Type here..." />
                </DrawerBody>

                <DrawerFooter>
                  <Button variant="outline" mr={3} onClick={onClose2}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue">Save</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
          <div className="mt-2 overflow-x-auto scrollbar-hide">
            <Table data={paginatedData} columns={columns} />

          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 gap-4 items-center">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm bg-blue-500 w-10 p-2 rounded-md text-white"> {currentPage} </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </section>


      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Course
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? Delete this Users
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
          <DrawerHeader>Edit User</DrawerHeader>
          <DrawerBody>
            <Input
              placeholder="Full Name"
              value={editData?.full_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, full_name: e.target.value })
              }
              mb={3}
            />
            <Input
              placeholder="Phone Number"
              value={editData?.phone_number || ""}
              onChange={(e) =>
                setEditData({ ...editData, phone_number: e.target.value })
              }
              mb={3}
            />
             
            {/* aur bhi fields yahan dal sakte ho */}
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

    </div>
  );
}

export default LoanAccount;
