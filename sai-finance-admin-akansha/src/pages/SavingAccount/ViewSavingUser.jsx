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
  const btnRef = React.useRef();

  const isLoanAccount = accountData?.account_type === "loan";
  // const accountData =
  //   accountData?.loan_details || accountData?.saving_details || {};

  useEffect(() => {
    console.log(id, "idddd");

    axios.get(`account/${id}`).then((res) => {
      console.log(res.data.account, "account data");
      if (res?.data?.account) {
        console.log(res, "account data");
        
        setAccountData(res.data.account);
        console.log(res.data, "account data");
        
        
      }
    });
  }, [id]);


    useEffect(() => {
    async function fetchData() {
      axios.get(`/savingDailyCollections/getAllSavings`).then((response) => {
        // console.log(response?.data?.result);
        if (response) {
          setTransactions(response?.data?.result || []);
          console.log(response);
          
        }

        // const sum = response.data.result.reduce((acc, item) => {
        //   return acc + (item.amount || 0);
        // }, 0);

        // setTotalAmount(sum);
      });
    }
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: t('Sr No.', 'क्रम संख्या'),
        accessor: "srNo",
        Cell: ({ row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: t('Date', 'तारी���'),
        accessor: "created_on",
        Cell: ({ value }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: t('Total Amount/Day', 'कुल राशि/दिन'),
        accessor: "deposit_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value}`} />,
      },
      {
        Header: t('Withdraw Amount', 'निकासी राशि'),
        accessor: "withdraw_amount",
        Cell: ({ value }) => <Cell text={`Rs. ${value}`} />,
      },
      {
        Header: t('Collected By', 'संग्रहकर्ता'),
        accessor: "collected_officer_name",
        Cell: ({ value }) => <Cell text={value || "-"} bold="bold" />,
      },
    ],
    []
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    const userName = accountData?.full_name || "N/A";
    const title = isLoanAccount ? t('LOAN STATEMENT', 'ऋण विवरण') : t('SAVING STATEMENT', 'बचत विवरण');
    const startDate = dayjs(accountData?.created_on).format("D MMM, YYYY");
    const endDate = startDate;

    const loan =
      accountData?.loan_amount || accountData?.amount_to_be || 0;
    const due = accountData?.total_due_amount || 0;
    const penalty = accountData?.total_penalty_amount || 0;
    const totalPay = accountData?.total_amount || 0;

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
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
    doc.text(`${t('Amount', 'राशि')}: Rs. ${loan}`, 14, y);
    doc.text(`${t('Total Paid', 'कुल भुगतान')}: Rs. ${totalPay}`, pageWidth / 2 + 10, y);
    y += 7;
    doc.text(`${t('Total Penalty', 'कुल दंड')}: Rs. ${penalty}`, 14, y);

    const groupedByMonth = groupBy(transactions, (item) =>
      dayjs(item.created_on).format("MMMM YYYY")
    );
    const groupedByYear = groupBy(transactions, (item) =>
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
        t('EMI Payment', 'ईएमआई भुगतान'),
        `Rs. ${item.amount || 0}`,
        `Rs. ${item.total_penalty_amount || 0}`,
        item.collected_officer_name || "-",
      ]);

      autoTable(doc, {
        startY,
        head: [
          [
            t('Date', 'तारीख'),
            t('Description', 'विवरण'),
            t('Amount (Rs.)', 'राशि (रु.)'),
            t('Penalty (Rs.)', 'दंड (रु.)'),
            t('Collected By', 'संग्रहकर्ता'),
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
      doc.text(`${t('Monthly Total EMI', 'मासिक कुल ईएमआई')}: Rs. ${totalEMI}`, 14, startY);
      doc.text(`${t('Monthly Total Penalty', 'मासिक कुल दंड')}: Rs. ${totalPenalty}`, 100, startY);
      startY += 10;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(t('Yearly Summary', 'वार्षिक सारांश'), 14, startY);
    startY += 6;

    const yearlyRows = Object.entries(groupedByYear).map(([year, records]) => {
      const totalEMI = records.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalPenalty = records.reduce(
        (sum, r) => sum + (r.total_penalty_amount || 0),
        0
      );
      return [year, `Rs. ${totalEMI}, Rs. ${totalPenalty}`];
    });

    autoTable(doc, {
      startY,
      head: [[t('Year', 'वर्ष'), t('Total EMI', 'कुल ईएमआई'), t('Total Penalty', 'कुल दंड')]],
      body: yearlyRows,
      headStyles: { fillColor: [255, 204, 0], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 14, right: 14 },
      theme: "striped",
    });

    doc.save(`${userName}_${title.replace(/\s+/g, "_")}`.pdf);
  };

  console.log(accountData, "account data in view");
  

  return (
    <div className="lg:py-8 py-4 bg-primaryBg pt-20">
      <section className="md:p-1">
        <div className="py-6">
                      <div className="flex justify-between items-center">
              <div className="flex w-3/2 flex-col gap-2 text-start">
                <h2 className="text-xl font-bold text-purple">
                  {t('Full Name', 'पूरा नाम')}:{" "}
                  <span className="ml-4">{accountData?.user_id?.full_name}</span>
                </h2>
              <div className="flex gap-20">
                <h2 className="text-lg font-bold text-purple">
                  {t('Start Date', 'प्रारंभ तिथि')}:{" "}
                  <span className="ml-4">
                    {dayjs(accountData?.created_on).format("D MMM, YYYY")}
                  </span>
                </h2>
                <h2 className="text-lg font-bold text-purple">
                  {t('End Date', 'समाप्ति तिथि')}:{" "}
                  <span className="ml-4">
                    {dayjs(accountData?.created_on).format("D MMM, YYYY")}
                  </span>
                </h2>
              </div>
            </div>

                          <div className="w-1/2 flex flex-col gap-4">
                <div className="w-full flex gap-4 justify-end">
                  <Menu>
                    <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight" colorScheme="#FF782D" onClick={generatePDF}>
                      {t('Download PDF', 'पीडीएफ डाउनलोड')}
                    </MenuButton>
                    <Link to={`/dash/add-Saving-collection/${accountData?.user_id?._id}`}>
                      <MenuButton as={Button} className="bg-purple" colorScheme="#FF782D">
                        {t('Withdraw', 'निकासी')}
                      </MenuButton>
                    </Link>
                  </Menu>
                </div>
              <div className="w-full flex gap-4 justify-end">
                <Menu>
                  <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight" colorScheme="#FF782D">
                    {t('Total Amount', 'कुल राशि')}: Rs. {(accountData.total_amount || 0) + (accountData.current_amount || 0)}
                  </MenuButton>
                  {/* <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight" colorScheme="#FF782D">
                    Total Interest Pay: Rs. {accountData.total_interest_pay}
                  </MenuButton> */}
                  <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight" colorScheme="#FF782D">
                    {t('Total Withdraw', 'कुल निकासी')}: Rs. {accountData.total_withdrawal || 0}
                  </MenuButton>
                </Menu>
              </div>
              {/* <div className="w-full flex gap-4 justify-end">
                <Menu>
                  <MenuButton as={Button} className="bg-primaryDark hover:bg-primaryLight" colorScheme="#FF782D">
                    Paid: Rs. {accountData.amount_to_be}
                  </MenuButton>
                  <MenuButton
                    as={Button}
                    colorScheme="#FF782D"
                    className="bg-primaryDark hover:bg-primaryLight"
                    onClick={generatePDF}
                  >
                    Download PDF
                  </MenuButton>
                </Menu>
              </div> */}
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
                <DrawerHeader>{t('Edit', 'संपादित करें')}</DrawerHeader>
                <DrawerBody>
                  <Input placeholder={t('Type here...', 'यहां टाइप करें...')} />
                </DrawerBody>
                <DrawerFooter>
                  <Button variant="outline" mr={3} onClick={onClose2}>
                    {t('Cancel', 'रद्द करें')}
                  </Button>
                  <Button colorScheme="blue">{t('Save', 'सेव करें')}</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          <div className="mt-2 overflow-x-auto scrollbar-hide">
            <Table data={transactions} columns={columns} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default ViewSavingUser;
