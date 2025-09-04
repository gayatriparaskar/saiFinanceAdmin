import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import Table from '../Table/Table';
import Cell from '../Table/cell';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { MdEdit, MdDelete } from "react-icons/md";
import { HiStatusOnline } from "react-icons/hi";

const LoanAccountTable = ({
  paginatedData,
  currentPage,
  totalPages,
  setCurrentPage,
  setNewID,
  onOpen,
  setEditData,
  setIsEditing,
  setSelectedUserForOfficerChange,
  setNewOfficerId,
  setIsOfficerChangeModalOpen
}) => {
  const { t } = useLocalTranslation();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: t('Sr No.'),
        accessor: "srNo",
        Cell: ({ value, row: { index } }) => <Cell text={index + 1} />,
      },
      {
        Header: t('Name'),
        accessor: "full_name",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${original?.full_name}`} bold={"bold"} />
        ),
      },
      {
        Header: t('Officer Alloted'),
        accessor: "officer_name",
        Cell: ({ value, row: { original } }) => {
          const officer = original?.officer_id;
          if (!officer) {
            return (
              <div className="flex flex-col">
                <Cell text="No Officer" />
                <span className="text-xs text-red-500">Unassigned</span>
              </div>
            );
          }
          
          return (
            <div className="flex flex-col">
              <Cell text={officer.name || officer.full_name || 'Unknown'} />
              {officer.officer_code && (
                <span className="text-xs text-gray-500">
                  Code: {officer.officer_code}
                </span>
              )}
              {officer.role && (
                <span className="text-xs text-blue-500">
                  Role: {officer.role}
                </span>
              )}
            </div>
          );
        },
      },
      {
        Header: t('Loan Amount'),
        accessor: "loan_amount",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`Rs. ${original?.active_loan_id?.loan_amount}`} />
        ),
      },
      {
        Header: t('Total Pay Amount'),
        accessor: "total_amount",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`Rs. ${original?.active_loan_id?.total_amount}`} />
        ),
      },
      {
        Header: t('Total EMI/Day'),
        accessor: "emi_day",
        Cell: ({ value, row: { original } }) => <Cell text={`Rs. ${original?.active_loan_id?.emi_day}`} />,
      },
      {
        Header: t('Remaining Emi'),
        accessor: "remaining_emi",
        Cell: ({ value, row: { original } }) => <Cell text={`${Math.ceil(original?.active_loan_id?.total_due_amount / original?.active_loan_id?.emi_day)}`} />,
      },
      {
        Header: t('Total Due Amount'),
        accessor: "total_due_amount",
        Cell: ({ value, row: { original } }) => <Cell text={`Rs. ${original?.active_loan_id?.total_due_amount}`} />,
      },
      {
        Header: t('Start Date'),
        accessor: "created_on",
        Cell: ({ value, row: { original } }) => (
          <Cell text={dayjs(value).format("D MMM, YYYY h:mm A")} />
        ),
      },
      {
        Header: t('End Date'),
        accessor: "end_date",
        Cell: ({ value, row: { original } }) => (
          <Cell text={
            original?.active_loan_id?.end_date 
              ? dayjs(original?.active_loan_id?.end_date).format("D MMM, YYYY")
              : dayjs(original?.active_loan_id?.created_on).add(120, 'day').format("D MMM, YYYY")
          } />
        ),
      },
      {
        Header: t('Mobile Number'),
        accessor: "phone_number",
        Cell: ({ value, row: { original } }) => (
          <Cell text={`${Math.ceil(value)}`} />
        ),
      },
      {
        Header: t('Action'),
        accessor: "",
        Cell: ({ value, row: { original } }) => {
          return (
            <Menu>
              <MenuButton
                as={Button}
                className="bg-purple "
                colorScheme="bgBlue hover:bg-secondaryLight"
                onClick={() => setNewID(original._id)}
                p={2}
                m={0.5}
              >
                {t('Actions')}
              </MenuButton>
              <MenuList>
                <Link to={`/dash/view-loan-user/${original?.active_loan_id?.user_id}`}>
                  <MenuItem >
                    <HiStatusOnline className="mr-4" /> {t('View User')}
                  </MenuItem>
                </Link>
                <MenuItem onClick={() => { setEditData(original); setIsEditing(true); }}>
                  <MdEdit className="mr-4" /> {t('Edit')}
                </MenuItem>
                <MenuItem onClick={() => { 
                  setSelectedUserForOfficerChange(original); 
                  setNewOfficerId(original?.officer_id?._id || ""); 
                  setIsOfficerChangeModalOpen(true); 
                }}>
                  <HiStatusOnline className="mr-4" /> {t('Change Officer')}
                </MenuItem>
                <MenuItem onClick={() => { setNewID(original._id); onOpen(); }}>
                  <MdDelete className="mr-4" />
                  {t('Delete')}
                </MenuItem>
              </MenuList>
            </Menu>
          );
        },
      },
    ],
    [currentPage]
  );

  return (
    <motion.div
      variants={itemVariants}
      className="flex-1 px-4 pb-0 overflow-hidden mt-4"
    >
      <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
        
        {/* Only the table content scrolls */}
        <div className="flex-1 overflow-auto">
          <Table
            data={paginatedData}
            columns={columns}
          />
        </div>

        {/* Fixed Pagination */}
        <div className="flex-shrink-0 flex justify-center p-0 border-t gap-4 items-center bg-gray-50">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
            colorScheme="blue"
            variant="outline"
          >
            {t('Previous')}
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
            {t('Next')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LoanAccountTable;
