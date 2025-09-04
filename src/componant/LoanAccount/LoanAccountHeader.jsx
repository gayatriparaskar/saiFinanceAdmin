import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import {
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  InputRightAddon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

const LoanAccountHeader = ({
  searchTerm,
  setSearchTerm,
  totalLoanAmt,
  data,
  sortBy,
  sortOrder,
  handleSort,
  getSortDisplayName,
  fetchOfficers,
  isLoadingOfficers
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

  return (
    <motion.div 
      variants={itemVariants}
      className="flex justify-between items-center mb-0 loan-header-responsive"
    >
      {/* Search Section */}
      <motion.div
        variants={itemVariants}
        className="w-96 search-section"
      >
        <InputGroup borderRadius={5} size="sm">
          <InputLeftElement pointerEvents="none" />
          <Input
            type="text"
            placeholder={t('Search...')}
            focusBorderColor="blue.500"
            border="1px solid #949494"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputRightAddon p={0} border="none">
            <Button
              className="bg-primary hover:bg-primaryDark text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              colorScheme="blue"
              size="sm"
              borderLeftRadius={0}
              borderRightRadius={3.3}
              border="1px solid #949494"
            >
              {t('Search')}
            </Button>
          </InputRightAddon>
        </InputGroup>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        variants={itemVariants}
        className="flex gap-2 stats-section"
      >
        <Menu>
          <MenuButton
            as={Button}
            colorScheme="blue"
            className="bg-primary hover:bg-primaryDark text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            fontWeight={700}
          >
            <span className="hidden sm:inline">{t('Total Collection')} : ₹ {totalLoanAmt.toLocaleString()}</span>
            <span className="sm:hidden">Total: ₹{totalLoanAmt.toLocaleString()}</span>
          </MenuButton>
        </Menu>
        <Menu>
          <MenuButton
            as={Button}
            colorScheme="purple"
            className="bg-secondary hover:bg-secondaryDark text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            fontWeight={700}
          >
            <span className="hidden sm:inline">{t('Total Active User')} : {data.length}</span>
            <span className="sm:hidden">Active: {data.length}</span>
          </MenuButton>
        </Menu>
        <Link to="/dash/overdue-loans">
          <Button
            colorScheme="red"
            className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            fontWeight={700}
          >
            <span className="hidden sm:inline">{t('Overdue Loans')} ⚠️</span>
            <span className="sm:hidden">Overdue ⚠️</span>
          </Button>
        </Link>
      </motion.div>

      {/* Actions Section */}
      <motion.div
        variants={itemVariants}
        className="flex gap-2 actions-section"
      >
        <Menu>
          <MenuButton
            as={Button}
            colorScheme="gray"
            className="bg-gray-600 hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            {sortBy ? `${t('Sort By', 'Sort By')}: ${getSortDisplayName(sortBy)} ${sortOrder === 'asc' ? '↑' : '↓'}` : t('Sort By', 'Sort By')}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleSort('amount_high_to_low')}>
              {t('Amount High to Low')} {sortBy === 'amount_high_to_low' && (sortOrder === 'asc' ? '↑' : '↓')}
            </MenuItem>
            <MenuItem onClick={() => handleSort('amount_low_to_high')}>
              {t('Amount Low to High')} {sortBy === 'amount_low_to_high' && (sortOrder === 'asc' ? '↑' : '↓')}
            </MenuItem>
            <MenuItem onClick={() => handleSort('name_a_z')}>
              {t('Name A-Z')} {sortBy === 'name_a_z' && (sortOrder === 'asc' ? '↑' : '↓')}
            </MenuItem>
            <MenuItem onClick={() => handleSort('date_created')}>
              {t('Date Created')} {sortBy === 'date_created' && (sortOrder === 'asc' ? '↑' : '↓')}
            </MenuItem>
            {sortBy && (
              <MenuItem onClick={() => { setSortBy(''); setSortOrder('asc'); }}>
                {t('Clear Sort', 'Clear Sort')}
              </MenuItem>
            )}
          </MenuList>
        </Menu>

        <Link to={`/dash/create-loan-user`} onClick={() => console.log('🔄 Navigating to create loan user...')}>
          <Button
            colorScheme="blue"
            className="bg-primary hover:bg-primaryDark text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            <span className="hidden sm:inline">{t('Add New User', 'Add New User')}</span>
            <span className="sm:hidden">Add User</span>
          </Button>
        </Link>
        <Button
          colorScheme="gray"
          className="bg-gray-500 hover:bg-gray-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          onClick={fetchOfficers}
          isLoading={isLoadingOfficers}
        >
          <span className="hidden sm:inline">{t('Refresh Officers', 'Refresh Officers')}</span>
          <span className="sm:hidden">Refresh</span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default LoanAccountHeader;
