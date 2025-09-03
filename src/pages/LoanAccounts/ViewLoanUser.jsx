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

      {
        Header: t('Collected By', 'Collected By'),
        accessor: "collected_officer_name",
        Cell: ({ value, row: { original } }) => (
          <>
            <Cell text={`${original?.collected_officer_name}`} bold={"bold"} />
          </>
        ),
      },

      // {
      //   Header: t('Action', 'Action'),
      //   accessor: "",
      //   Cell: ({ value, row: { original } }) => {
      //     return (
      //       <>
      //         <Menu>
      //           <MenuButton
      //             as={Button}
      //             className="bg-purple "
      //             colorScheme="bgBlue"
      //             onClick={() => setNewID(original._id)}
      //           >
      //             {t('Actions', 'Actions')}
      //           </MenuButton>
      //           <MenuList>
      //             <Link to={`/dash/edit-course/${original._id}`}>
      //               <MenuItem>
      //                 {" "}
      //                 <HiStatusOnline className="mr-4" /> {t('View User', 'View User')}
      //               </MenuItem>
      //             </Link>

      //             <Link to={`/dash/edit-course/${original._id}`}>
      //               <MenuItem>
      //                 {" "}
      //                 <MdEdit className="mr-4" /> {t('Edit', 'Edit')}
      //               </MenuItem>
      //             </Link>

      //             <MenuItem onClick={onOpen}>
      //               {" "}
      //               <MdDelete className="mr-4" />
      //               {t('Delete', 'Delete')}
      //             </MenuItem>
      //             <MenuItem onClick={onOpen2}>
      //               {" "}
      //               <HiStatusOnline className="mr-4" /> {t('Status', 'Status')}
      //             </MenuItem>
      //           </MenuList>
      //         </Menu>
      //       </>
      //     );
      //   },
      // },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Dailydata]
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    const userName = userdata?.full_name || "N/A";
    const startDate = dayjs(userdata?.active_loan_id?.created_on).format("D MMM, YYYY");
    const endDate = userdata?.active_loan_id?.end_date 
      ? dayjs(userdata?.active_loan_id?.end_date).format("D MMM, YYYY")
      : dayjs(userdata?.active_loan_id?.created_on).add(120, 'day').format("D MMM, YYYY");
    const loan = userdata?.active_loan_id?.loan_amount || 0;
    const due = userdata?.active_loan_id?.total_due_amount || 0;
    const penalty = userdata?.active_loan_id?.total_penalty_amount || 0;
    const totalPay = userdata?.active_loan_id?.total_amount || 0;

    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Check if current language is Hindi to add language indicator
    const isHindi = t('localization_testing') === 'hindi';

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const title = isHindi ? "SAI FINANCE LOAN STATEMENT (Hindi)" : "SAI FINANCE LOAN STATEMENT";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    let y = 30;
    // Use English text in PDF to avoid font rendering issues
    doc.text(`Name: ${userName}`, 14, y);
    doc.text(`End Date: ${endDate}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`Start Date: ${startDate}`, 14, y);
    doc.text(`Total Due: Rs. ${due}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`Total Loan: Rs. ${loan}`, 14, y);
    doc.text(`Total Paid: Rs. ${totalPay}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`Total Penalty: Rs. ${penalty}`, 14, y);

    const groupedByMonth = groupBy(Dailydata, item => dayjs(item.created_on).format("MMMM YYYY"));
    const groupedByYear = groupBy(Dailydata, item => dayjs(item.created_on).format("YYYY"));

    let startY = 70;

    Object.entries(groupedByMonth).forEach(([monthYear, records]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`${monthYear}`, 14, startY);
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
      doc.text(`Monthly Total EMI Paid: Rs. ${totalEMI}`, 14, startY);
      doc.text(`Monthly Total Penalty: Rs. ${totalPenalty}`, 100, startY);
      startY += 10;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Yearly Summary", 14, startY);
    startY += 6;

    const yearlyRows = Object.entries(groupedByYear).map(([year, records]) => {
      const totalEMI = records.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalPenalty = records.reduce((sum, r) => sum + (r.total_penalty_amount || 0), 0);
      return [year, `Rs. ${totalEMI}`, `Rs. ${totalPenalty}`];
    });

    autoTable(doc, {
      startY,
      head: [["Year", "Total EMI", "Total Penalty"]],
      body: yearlyRows,
      headStyles: { fillColor: [255, 204, 0], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 14, right: 14 },
      theme: 'striped'
    });

    const fileName = isHindi ? `${userName}_Loan_Statement_Hindi.pdf` : `${userName}_Loan_Statement.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="lg:py-8 py-4 px-6 bg-primaryBg mt-6">
      <section className=" md:p-1 ">
        <div className="py-6 ">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            {/* User Information Section */}
            <div className="flex flex-col gap-4 text-start w-full lg:w-auto">
              <h2 className="text-xl font-bold text-purple text-oswald">
                {t('Name', 'Name')}: <span className="ml-2 lg:ml-4">{userdata?.full_name}</span>
              </h2>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-20">
                <h2 className="text-lg font-bold text-purple text-oswald">
                  {t('Start Date', 'Start Date')}:
                  <span className="ml-2 lg:ml-4">
                    {dayjs(userdata?.active_loan_id?.created_on).format(
                      "D MMM, YYYY"
                    )}
                  </span>
                </h2>
                <h2 className="text-lg font-bold text-purple text-oswald">
                  {t('End Date', 'End Date')}:
                  <span className="ml-2 lg:ml-4">
                    {userdata?.active_loan_id?.end_date 
                      ? dayjs(userdata?.active_loan_id?.end_date).format("D MMM, YYYY")
                      : dayjs(userdata?.active_loan_id?.created_on).add(120, 'day').format("D MMM, YYYY")
                    }
                  </span>
                </h2>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col gap-4 w-full lg:w-auto lg:items-end">
              {/* Summary Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full lg:w-auto">
                <Button
                  colorScheme="blue"
                  size="md"
                  borderRadius="md"
                  px={2}
                  className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto"
                >
                  Total Loan {userdata?.active_loan_id?.loan_amount} Rs.
                </Button>

                <Button
                  colorScheme="blue"
                  size="md"
                  borderRadius="md"
                  px={2}
                  className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto"
                >
                  {t('Total Due Amount', 'Total Due Amount')}{" "}
                  {userdata?.active_loan_id?.total_due_amount} रु.
                </Button>

                <Button
                  colorScheme="blue"
                  size="md"
                  borderRadius="md"
                  px={2}
                  className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto"
                >
                  {t('Total Penalty', 'Total Penalty')}{" "}
                  {userdata?.active_loan_id?.total_penalty_amount} रु.
                </Button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full lg:w-auto">
                <Button
                  colorScheme="blue"
                  size="md"
                  borderRadius="md"
                  px={2}
                  onClick={generatePDF}
                  className="w-full sm:w-auto"
                >
                  {t('Download PDF', 'Download PDF')}
                </Button>

                <Link to={`/dash/add-daily-collection/${userdata?._id}`} className="w-full sm:w-auto">
                  <Button
                    colorScheme="purple"
                    size="md"
                    borderRadius="md"
                    px={2}
                    className="w-full"
                  >
                    {t('Add Amount', 'Add Amount')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Drawer Component */}
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

          <div className="mt-2">
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
