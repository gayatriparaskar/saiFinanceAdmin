import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import groupBy from "lodash/groupBy";
import axios from "../../axios";
import Table from "../../componant/Table/Table";
import Cell from "../../componant/Table/cell";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";

function ViewSavingUser() {
  const { t } = useLocalTranslation();
  const { id } = useParams();
  const [accountData, setAccountData] = useState({});
  const [transactions, setTransactions] = useState([]);
  console.log(id);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const {
    isOpen: isDateModalOpen,
    onOpen: onDateModalOpen,
    onClose: onDateModalClose,
  } = useDisclosure();
  const btnRef = React.useRef();
  const toast = useToast();
  
  // Date range states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isLoanAccount = accountData?.account_type === "loan";
  // const accountData =
  //   accountData?.loan_details || accountData?.saving_details || {};

  useEffect(() => {
    console.log(id, "idddd");

    axios
      .get(`account/${id}`)
      .then((res) => {
        console.log(res.data.account, "account data");
        if (res?.data?.account) {
          console.log(res, "account data");
          setAccountData(res.data.account);
          console.log(res.data, "account data");
        }
      })
      .catch((error) => {
        console.error("Error fetching account data:", error);
        // Set fallback data to prevent crashes
        setAccountData({
          user_id: { full_name: "-" },
          created_on: new Date(),
          total_amount: 0,
          current_amount: 0,
          total_withdrawal: 0,
        });
      });
  }, [id]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `/savingDailyCollections/getAllSavings`
        );
        if (response) {
          setTransactions(response?.data?.result || []);
          console.log(response);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        // Set fallback data
        setTransactions([]);
      }
    }
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: t("Sr No.", "Sr No."),
        accessor: "srNo",
        Cell: ({ row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: t("Date", "Date"),
        accessor: "created_on",
        Cell: ({ value }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: t("Total Amount/Day", "Total Amount/Day"),
        accessor: "deposit_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value}`} />,
      },
      {
        Header: t("Withdraw Amount", "Withdraw Amount"),
        accessor: "withdraw_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value}`} />,
      },
      {
        Header: t("Collected By", "Collected By"),
        accessor: "collected_officer_name",
        Cell: ({ value }) => <Cell text={value || "-"} bold="bold" />,
      },
    ],
    []
  );

  const generatePDF = (customStartDate = null, customEndDate = null) => {
    const doc = new jsPDF();
    const userName = accountData?.full_name || "-";
    // Check if current language is Hindi to add language indicator
    const isHindi = t("localization_testing") === "hindi";
    const title = isLoanAccount
      ? isHindi
        ? "SAI FINANCE LOAN STATEMENT (Hindi)"
        : "SAI FINANCE LOAN STATEMENT"
      : isHindi
      ? "SAI FINANCE SAVING STATEMENT (Hindi)"
      : "SAI FINANCE SAVING STATEMENT";
    const startDate = dayjs(accountData?.created_on).format("D MMM, YYYY");
    const endDate = startDate;

    const loan = accountData?.loan_amount || accountData?.amount_to_be || 0;
    const due = accountData?.total_due_amount || 0;
    const penalty = accountData?.total_penalty_amount || 0;
    const totalPay = accountData?.total_amount || 0;

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    let y = 30;
    // Use English text in PDF to avoid font rendering issues
    doc.text(`Name: ${userName}`, 14, y);
    doc.text(`End Date: ${endDate}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`Start Date: ${startDate}`, 14, y);
    doc.text(`Total Due: Rs. ${due}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`Amount: Rs. ${loan}`, 14, y);
    doc.text(`Total Paid: Rs. ${totalPay}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`Total Penalty: Rs. ${penalty}`, 14, y);

    // Filter data by date range if provided
    let filteredData = transactions;
    if (customStartDate && customEndDate) {
      filteredData = transactions.filter(item => {
        const itemDate = dayjs(item.created_on);
        return itemDate.isAfter(dayjs(customStartDate).subtract(1, 'day')) && 
               itemDate.isBefore(dayjs(customEndDate).add(1, 'day'));
      });
    }

    const groupedByMonth = groupBy(filteredData, (item) =>
      dayjs(item.created_on).format("MMMM YYYY")
    );
    const groupedByYear = groupBy(filteredData, (item) =>
      dayjs(item.created_on).format("YYYY")
    );

    let startY = 70;

    Object.entries(groupedByMonth).forEach(([monthYear, records]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`${monthYear}`, 14, startY);
      startY += 6;

      const rows = records.map((item) => [
        dayjs(item.created_on).format("D MMM, YYYY h:mm A"),
        "Saving Deposit",
        `Rs. ${item.amount || 0}`,
        `Rs. ${item.total_penalty_amount || 0}`,
        item.collected_officer_name || "-",
      ]);

      autoTable(doc, {
        startY,
        head: [
          [
            "Date",
            "Description",
            "Amount (Rs.)",
            "Penalty (Rs.)",
            "Collected By",
          ],
        ],
        body: rows,
        headStyles: { fillColor: [211, 211, 211], fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
        theme: "striped",
      });

      const totalEMI = records.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalPenalty = records.reduce(
        (sum, r) => sum + (r.total_penalty_amount || 0),
        0
      );
      startY = doc.lastAutoTable.finalY + 4;
      doc.setFontSize(10);
      doc.text(`Monthly Total Amount: Rs. ${totalEMI}`, 14, startY);
      // doc.text(`Monthly Total Penalty: Rs. ${totalPenalty}`, 100, startY);
      startY += 10;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Yearly Summary", 14, startY);
    startY += 6;

    const yearlyRows = Object.entries(groupedByYear).map(([year, records]) => {
      const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalPenalty = records.reduce(
        (sum, r) => sum + (r.total_penalty_amount || 0),
        0
      );
      return [year, `Rs. ${totalAmount}`, `Rs. ${totalPenalty}`];
    });

    autoTable(doc, {
      startY,
      head: [["Year", "Total Amount", "Total Penalty"]],
      body: yearlyRows,
      headStyles: { fillColor: [255, 204, 0], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 14, right: 14 },
      theme: "striped",
    });

    // Generate filename with date range if provided
    let fileName;
    if (customStartDate && customEndDate) {
      const startStr = dayjs(customStartDate).format("DD-MM-YYYY");
      const endStr = dayjs(customEndDate).format("DD-MM-YYYY");
      fileName = isHindi 
        ? `${userName}_Saving_Statement_${startStr}_to_${endStr}_Hindi.pdf` 
        : `${userName}_Saving_Statement_${startStr}_to_${endStr}.pdf`;
    } else {
      fileName = isHindi
        ? `${userName}_Saving_Statement_Hindi.pdf`
        : `${userName}_Saving_Statement.pdf`;
    }
    doc.save(fileName);
  };

  // Handle date range PDF generation
  const handleDateRangePDF = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Please select both start and end dates",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (dayjs(startDate).isAfter(dayjs(endDate))) {
      toast({
        title: "Start date cannot be after end date",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    generatePDF(startDate, endDate);
    onDateModalClose();
    setStartDate("");
    setEndDate("");
  };

  // Handle full PDF generation (all data)
  const handleFullPDF = () => {
    generatePDF();
  };

  console.log(accountData, "account data in view");

  return (
    <div className="lg:py-16 lg:pt-24 py-8 pt-20 px-6 bg-primaryBg">
      <section className="md:p-1">
        <div className="py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            {/* User Information Section */}
            <div className="flex flex-col gap-4 text-start w-full lg:w-auto">
              <h2 className="text-lg sm:text-xl font-bold text-purple">
                {t("Full Name", "Full Name")}:{" "}
                <span className="ml-2 lg:ml-4 text-base sm:text-lg">{accountData?.user_id?.full_name}</span>
              </h2>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-20">
                <h2 className="text-lg font-bold text-purple">
                  {t("Start Date", "Start Date")}:{" "}
                  <span className="ml-2 lg:ml-4">
                    {dayjs(accountData?.created_on).format("D MMM, YYYY")}
                  </span>
                </h2>
                <h2 className="text-lg font-bold text-purple">
                  {t("End Date", "End Date")}:{" "}
                  <span className="ml-2 lg:ml-4">
                    {dayjs(accountData?.created_on).format("D MMM, YYYY")}
                  </span>
                </h2>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col gap-4 w-full lg:w-auto lg:items-end">
              {/* Summary Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full lg:w-auto">
                <Button
                  className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto"
                  colorScheme="#FF782D"
                >
                  {t("Total Amount", "Total Amount")}: Rs.{" "}
                  {(accountData.total_amount || 0) + (accountData.current_amount || 0)}
                </Button>

                <Button
                  className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto"
                  colorScheme="#FF782D"
                >
                  {t("Total Withdraw", "Total Withdraw")}: Rs.{" "}
                  {accountData.total_withdrawal || 0}
                </Button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full lg:w-auto">
                <Menu>
                  <MenuButton
                    as={Button}
                    className="bg-primaryDark hover:bg-primaryLight w-full sm:w-auto"
                    colorScheme="#FF782D"
                    rightIcon={<span>▼</span>}
                  >
                    {t("Download PDF", "Download PDF")}
                  </MenuButton>
                  <MenuList bg="white" border="1px solid #e2e8f0" boxShadow="lg" zIndex={9999}>
                    <MenuItem onClick={handleFullPDF} _hover={{ bg: "gray.100" }}>
                      {t("Download All Data", "Download All Data")}
                    </MenuItem>
                    <MenuItem onClick={onDateModalOpen} _hover={{ bg: "gray.100" }}>
                      {t("Download Date Range", "Download Date Range")}
                    </MenuItem>
                  </MenuList>
                </Menu>

                <Link to={`/dash/add-Saving-collection/${accountData?.user_id?._id}`} className="w-full sm:w-auto">
                  <Button className="bg-purple w-full" colorScheme="#FF782D">
                    {t("Withdraw", "Withdraw")}
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
              <DrawerHeader>{t("Edit", "Edit")}</DrawerHeader>
              <DrawerBody>
                <Input placeholder={t("Type here...", "Type here...")} />
              </DrawerBody>
              <DrawerFooter>
                <Button variant="outline" mr={3} onClick={onClose2}>
                  {t("Cancel", "Cancel")}
                </Button>
                <Button colorScheme="blue">{t("Save", "Save")}</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <div className="mt-2 overflow-x-auto scrollbar-hide">
            <Table data={transactions} columns={columns} />
          </div>
        </div>
      </section>

      {/* Date Range Modal */}
      <Modal isOpen={isDateModalOpen} onClose={onDateModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Select Date Range for PDF', 'Select Date Range for PDF')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('Start Date', 'Start Date')}</FormLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('End Date', 'End Date')}</FormLabel>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={onDateModalClose}>
                {t('Cancel', 'Cancel')}
              </Button>
              <Button colorScheme="blue" onClick={handleDateRangePDF}>
                {t('Generate PDF', 'Generate PDF')}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default ViewSavingUser;
