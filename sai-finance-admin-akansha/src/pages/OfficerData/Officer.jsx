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
} from "@chakra-ui/react";

import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";
import { GrOverview } from "react-icons/gr";
import { toast } from "react-toastify";
function Officer() {
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  console.log(data);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const cancelRef = React.useRef();
  const btnRef = React.useRef();
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast()
  useEffect(() => {
    async function fetchData() {
      axios.get("officers").then((response) => {
        console.log(response?.data);
        if (response?.data) {
          setData(response?.data?.result);
          setFilteredData(response?.data?.result);
          // localStorage.setItem("plans", JSON.stringify(response?.data?.result));
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
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number?.toString().includes(searchTerm)
      );
      setFilteredData(result);
    }
  }, [searchTerm, data]);


  const handleEditSave = async () => {
    try {
      const res = await axios.put(`officers/${editData._id}`, editData);
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

  //   const initialFormState = {
  //     user_name: "",
  //     password: "",
  //     full_name: "",
  //     phone_number: "",
  //     monthly_income: "",
  //     pan_no: "",
  //     aadhar_no: "",
  //     address: "",
  //     dob: "",
  //     loan_details: {
  //         loan_amount: 0,
  //         principle_amount: 0,
  //         file_charge: 500,
  //         interest_rate: "",
  //         duration_months: 4,
  //         emi_day: 0,
  //         total_amount: 0,
  //         total_interest_pay: 0,
  //         total_penalty_amount: 0,
  //         total_due_amount:0
  //     }
  // }

  const columns = React.useMemo(
    () => [
      {
        Header: "Sr No.",
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.name}`} bold={"bold"} />
          </>
        ),
      },

      {
        Header: "Officer Code",
        accessor: "officer_code",
        Cell: ({ value, row: { original } }) => (
          <>
            {/* {console.log(original)} */}
            <Cell text={`${value}`} />
          </>
        ),
      },
      //   {
      //     Header: "Total Pay Ammount",
      //     accessor: "total_amount",
      //     Cell: ({ value, row: { original } }) => (
      //       <>
      //         <Cell text={`Rs. ${value}`} />
      //       </>
      //     ),
      //   },

      //   {
      //     Header: "Total EMI/Day",
      //     accessor: "emi_day",
      //     Cell: ({ value, row: { original } }) => <Cell text={value} />,
      //   },

      //   {
      //     Header: "Date",
      //     accessor: "created_on",
      //     Cell: ({ value, row: { original } }) => (
      //       <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
      //     ),
      //   },
      {
        Header: "Status",
        accessor: "isActive || is_active",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original.is_active ? "Active" : "InActive"}`} />
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
                  className="bg-purple "
                  colorScheme="bgBlue"
                  onClick={() => setNewID(original._id)}
                >
                  Actions
                </MenuButton>
                <MenuList>
                  <Link to={`/dash/view-user-details/${original._id}`}>
                    <MenuItem>
                      {" "}
                      <HiStatusOnline className="mr-4" /> View User
                    </MenuItem>
                  </Link>

                  {/* <Link to={`/dash/edit-course/${original._id}`}> */}
                  <MenuItem onClick={() => { setEditData(original); setIsEditing(true); }}>
                    <MdEdit className="mr-4" /> Edit
                  </MenuItem>
                  {/* </Link> */}

                  <MenuItem onClick={onOpen}>
                    {" "}
                    <MdDelete className="mr-4" />
                    Delete
                  </MenuItem>
                  <MenuItem onClick={onOpen2}>
                    {" "}
                    <HiStatusOnline className="mr-4" /> Status
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

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
                  className="bg-primary hover:bg-primaryLight"
                  fontWeight={800}
                  fontSize={18}
                >
                  Total Collection :0
                </MenuButton>
              </Menu>
              <Menu>
                <MenuButton
                  as={Button}
                  colorScheme="#FF782D"
                  zIndex={20}
                  className="bg-purple"
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
                <Link to={`/dash/create-officer`}>
                  <MenuButton
                    as={Button}
                    colorScheme="#FF782D"
                    zIndex={20}
                    className="bg-primary hover:bg-primaryLight"
                  //   ref={btnRef}  onClick={onOpen2}
                  >
                    Add New Officer
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
            <Table
              // isLoading={isLoading}
              data={filteredData || []}
              columns={columns}
            // total={data?.total}
            />
          </div>
        </div>
      </section>

      <Drawer isOpen={isEditing} placement="right" onClose={() => setIsEditing(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit User</DrawerHeader>
          <DrawerBody>
            <Input
              placeholder="Full Name"
              value={editData?.name || ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              mb={3}
            />
            <Input
              placeholder="Officer Code"
              value={editData?.officer_code || ""}
              onChange={(e) =>
                setEditData({ ...editData, officer_code: e.target.value })
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

export default Officer;
