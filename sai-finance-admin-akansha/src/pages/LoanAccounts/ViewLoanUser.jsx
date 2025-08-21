import React from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";

// new for pdf

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import groupBy from "lodash/groupBy"; // you need to install lodash

import axios from "../../axios";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
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
} from "@chakra-ui/react";

import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";
import { GrOverview } from "react-icons/gr";
function ViewLoanUser() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  console.log(id);
  const [data, setData] = useState([]);
  const [Dailydata, setDailyData] = useState([]);
  const [userdata, setUserData] = useState({});
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


  useEffect(() => {
    async function fetchData() {
      axios.get(`users/`).then((response) => {
        // console.log(response?.data?.result);
        if (response?.data) {
          setData(response?.data?.result);
        }
      });
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      axios.get(`users/${id}`).then((response) => {
        // console.log(response?.data?.result);
        if (response?.data) {
          setUserData(response?.data?.result);
        }
      });
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      axios.get(`dailyCollections/${id}`).then((response) => {
        // console.log(response?.data?.result);
        if (response?.data) {
          setDailyData(response?.data?.result.reverse());
        }

        // const sum = response.data.result.reduce((acc, item) => {
        //   return acc + (item.amount || 0);
        // }, 0);

        // setTotalAmount(sum);
      });
    }
    fetchData();
  }, []);
  console.log(Dailydata);

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
        Header: t('Sr No.', 'Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },

      {
        Header: t('Date', 'Date'),
        accessor: "created_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },


      {
        Header: t('EMI Amount/Day', 'EMI Amount/Day'),
        accessor: "amount",
        Cell: ({ value, row: { original } }) => <Cell text={`Rs. ${value}`} />,
      },
      {
        Header: t('Penalty Amount', 'Penalty Amount'),
        accessor: "total_penalty_amount",
        Cell: ({ value, row: { original } }) => <Cell text={`Rs. ${value}`} />,
      },

      // {
      //   Header: "Mobile Number",
      //   accessor: "phone_number",
      //   Cell: ({ value, row: { original } }) => (
      //     <Cell text={`${Math.ceil(value)}`} />
      //   ),
      // },

      {
        Header: t('Collected By', 'Collected By'),
        accessor: "collected_officer_name",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.collected_officer_name}`} bold={"bold"} />
          </>
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
                  className="bg-purple "
                  colorScheme="bgBlue"
                  onClick={() => setNewID(original._id)}
                >
                  {t('Actions', 'Actions')}
                </MenuButton>
                <MenuList>
                  <Link to={`/dash/edit-course/${original._id}`}>
                    <MenuItem>
                      {" "}
                      <HiStatusOnline className="mr-4" /> {t('View User', 'View User')}
                    </MenuItem>
                  </Link>

                  <Link to={`/dash/edit-course/${original._id}`}>
                    <MenuItem>
                      {" "}
                      <MdEdit className="mr-4" /> {t('Edit', 'Edit')}
                    </MenuItem>
                  </Link>

                  <MenuItem onClick={onOpen}>
                    {" "}
                    <MdDelete className="mr-4" />
                    {t('Delete', 'Delete')}
                  </MenuItem>
                  <MenuItem onClick={onOpen2}>
                    {" "}
                    <HiStatusOnline className="mr-4" /> {t('Status', 'Status')}
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Dailydata]
  );
   const generatePDF = () => {
    const doc = new jsPDF();
    const userName = userdata?.full_name || "N/A";
    const startDate = dayjs(userdata?.active_loan_id?.created_on).format("D MMM, YYYY");
    const endDate = startDate;
    const loan = userdata?.active_loan_id?.loan_amount || 0;
    const due = userdata?.active_loan_id?.total_due_amount || 0;
    const penalty = userdata?.active_loan_id?.total_penalty_amount || 0;
    const totalPay = userdata?.active_loan_id?.total_amount || 0;

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const title = t("SAI FINANCE LOAN STATEMENT", "साई फाइनेंस ऋण विवरण");
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    let y = 30;
    doc.text(`${t('Name', 'नाम')}: ${userName}`, 14, y);
    doc.text(`${t('End Date', 'समाप्ति तिथि')}: ${endDate}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`${t('Start Date', 'प्रारंभ तिथि')}: ${startDate}`, 14, y);
    doc.text(`${t('Total Due', 'कुल बकाया')}: Rs. ${due}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`${t('Total Loan', 'कुल ऋण')}: Rs. ${loan}`, 14, y);
    doc.text(`${t('Total Paid', 'कुल भुगतान')}: Rs. ${totalPay}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`${t('Total Penalty', 'कुल जुर्माना')}: Rs. ${penalty}`, 14, y);

    const groupedByMonth = groupBy(Dailydata, item => dayjs(item.created_on).format("MMMM YYYY"));
    const groupedByYear = groupBy(Dailydata, item => dayjs(item.created_on).format("YYYY"));

    let startY = 70;

    Object.entries(groupedByMonth).forEach(([monthYear, records]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(` ${monthYear}`, 14, startY);
      startY += 6;

      const rows = records.map(item => [
        dayjs(item.created_on).format("D MMM, YYYY h:mm A"),
        "EMI Payment",
        `Rs. ${item.amount || 0}`,
        `Rs. ${item.total_penalty_amount || 0}`,
        item.collected_officer_name || "-"
      ]);

      autoTable(doc, {
        startY,
        head: [["Date", "Description", "Amount (Rs.)", "Penalty (Rs.)", "Collected By"]],
        body: rows,
        headStyles: { fillColor: [211, 211, 211], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
        theme: 'striped'
      });

      const totalEMI = records.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalPenalty = records.reduce((sum, r) => sum + (r.total_penalty_amount || 0), 0);
      startY = doc.lastAutoTable.finalY + 4;
      doc.setFontSize(10);
      doc.text(`Monthly Total EMI: Rs. ${totalEMI}`, 14, startY);
      doc.text(`Monthly Total Penalty: Rs. ${totalPenalty}`, 100, startY);
      startY += 10;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(" Yearly Summary", 14, startY);
    startY += 6;

    const yearlyRows = Object.entries(groupedByYear).map(([year, records]) => {
      const totalEMI = records.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalPenalty = records.reduce((sum, r) => sum + (r.total_penalty_amount || 0), 0);
      return [year, ` ${totalEMI}`, ` ${totalPenalty}`];
    });

    autoTable(doc, {
      startY,
      head: [["Year", "Total EMI ", "Total Penalty "]],
      body: yearlyRows,
      headStyles: { fillColor: [255, 204, 0], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 14, right: 14 },
      theme: 'striped'
    });

    doc.save(`${userName}_Loan_Statement.pdf`);
  };

  return (
    <div className="lg:py-8 py-4 bg-primaryBg mt-6">
      <section className=" md:p-1 ">
        <div className="py-6 ">
          <div className="flex  justify-between items-center ">
            <div className="flex w-3/2 flex-col gap-2 text-start">
              <h2 className="text-xl font-bold   text-purple text-oswald">
                {t('Name', 'Name')} :<span className="ml-4">{userdata?.full_name}</span>
              </h2>
              <div className="flex gap-20">
                <h2 className="text-lg font-bold   text-purple text-oswald">
                  {t('Start Date', 'Start Date')} :
                  <span className="ml-4">
                    {dayjs(userdata?.active_loan_id?.created_on).format(
                      "D MMM, YYYY"
                    )}
                  </span>
                </h2>
                <h2 className="text-lg font-bold   text-purple text-oswald">
                  {t('End Date', 'End Date')} :
                  <span className="ml-4">
                    {dayjs(userdata?.active_loan_id?.created_on).format(
                      "D MMM, YYYY"
                    )}
                  </span>
                </h2>
              </div>
            </div>

            <div className="w-1/2 flex flex-col  gap-4 ">
              <div className="w-full flex gap-4 justify-end ">
                <Menu className="">
                  <MenuButton
                    as={Button}
                    colorScheme="#FF782D"
                    zIndex={20}
                    className="bg-primaryDark hover:bg-primaryLight"
                  >
                    Total Loan {userdata?.active_loan_id?.loan_amount} Rs.
                  </MenuButton>
                  <MenuButton
                    as={Button}
                    colorScheme="#FF782D"
                    zIndex={20}
                    className="bg-primaryDark hover:bg-primaryLight"
                  >
                    {t('Total Due Amount', 'Total Due Amount')}{" "}
                    {userdata?.active_loan_id?.total_due_amount} रु.
                  </MenuButton>
                  <MenuButton
                    as={Button}
                    colorScheme="#FF782D"
                    zIndex={20}
                    className="bg-primaryDark hover:bg-primaryLight"
                  >
                    {t('Total Penalty', 'Total Penalty')}{" "}
                    {userdata?.active_loan_id?.total_penalty_amount} रु.
                  </MenuButton>
                </Menu>
              </div>

              <div className="w-full flex  gap-4 justify-end ">
                <Menu>
                  <MenuButton
                    as={Button}
                    colorScheme="#FF782D"
                    zIndex={20}
                    className="bg-primaryDark hover:bg-primaryLight"
                  >
                    {t('Total Pay', 'Total Pay')} {userdata?.active_loan_id?.total_amount} Rs.
                  </MenuButton>
                  <MenuButton
                    as={Button}
                    colorScheme="#FF782D"
                    zIndex={20}
                    className="bg-primaryDark hover:bg-primaryLight"
                    onClick={generatePDF}
                  >
                    {t('Download PDF', 'Download PDF')}
                  </MenuButton>

                  <Menu>
                    <Link to={`/dash/add-daily-collection/${userdata?._id}`}>
                      <MenuButton
                        as={Button}
                        colorScheme="#FF782D"
                        zIndex={20}
                        className="bg-purple hover:bg-secondaryDark"
                        //   ref={btnRef}  onClick={onOpen2}
                      >
                        {t('Add Amount', 'Add Amount')}
                      </MenuButton>
                    </Link>
                  </Menu>

                  {/* <MenuList zIndex={20}>
                  <MenuItem>Download</MenuItem>
                  <MenuItem>Create a Copy</MenuItem>
                  <MenuItem>Mark as Draft</MenuItem>
                  <MenuItem>Delete</MenuItem>
                  <MenuItem>Attend a Workshop</MenuItem>
                </MenuList> */}
                </Menu>
              </div>
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
          <div className="mt-2 ">
            <Table
              // isLoading={isLoading}
              data={Dailydata || []}
              columns={columns}
              // total={data?.total}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default ViewLoanUser;
