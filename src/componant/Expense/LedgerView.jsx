import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../../services/expenseService';

const LedgerView = ({ expenses, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getExpenseTypeColor = (type) => {
    return type === 'debit' ? 'text-red-600' : 'text-green-600';
  };

  const getExpenseTypeIcon = (type) => {
    return type === 'debit' ? '📉' : '📈';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Ledger Header */}
      <div className="bg-gradient-to-r from-pink-100 to-pink-200 p-4 rounded-t-lg border-b-2 border-pink-300">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">A.R. FINANCIAL SERVICES</h2>
            <p className="text-sm text-gray-600">Expense Ledger</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString('en-IN')}</p>
            <p className="text-sm text-gray-600">Total Entries: {expenses.length}</p>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                नामे/DEBIT A/c. No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Type
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                र / Rupees
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                पै./P.
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense, index) => (
              <motion.tr
                key={expense._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm text-gray-900 border-r">
                  <div className="font-medium">{expense.account_number || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{expense.ledger_page || 'N/A'}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 border-r">
                  <div className="font-medium">{expense.title}</div>
                  {expense.description && (
                    <div className="text-xs text-gray-500 mt-1">{expense.description}</div>
                  )}
                  {expense.notes && (
                    <div className="text-xs text-blue-600 mt-1 italic">{expense.notes}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-center border-r">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(expense.expense_type)}`}>
                    <span className="mr-1">{getExpenseTypeIcon(expense.expense_type)}</span>
                    {expense.expense_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r">
                  {formatCurrency(expense.amount)}
                  {expense.currency_notes && expense.currency_notes.total_notes_amount > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Notes: ₹{expense.currency_notes.total_notes_amount.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500 border-r">
                  {expense.reference_number || 'N/A'}
                  {expense.withdrawal_type && (
                    <div className="text-xs text-blue-600 mt-1 capitalize">
                      {expense.withdrawal_type}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                    expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ledger Footer */}
      <div className="bg-gray-50 p-4 rounded-b-lg border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Prepared by:</p>
            <p className="text-gray-600">
              {expenses.length > 0 && expenses[0].prepared_by ? expenses[0].prepared_by : 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Checked by:</p>
            <p className="text-gray-600">
              {expenses.length > 0 && expenses[0].checked_by ? expenses[0].checked_by : 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Passed by:</p>
            <p className="text-gray-600">
              {expenses.length > 0 && expenses[0].passed_by ? expenses[0].passed_by : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total Amount: <span className="font-bold text-lg">{formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}</span>
            </div>
            <div className="text-sm text-gray-500">
              Page: 1 | Entries: {expenses.length}
            </div>
          </div>
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No expenses found</div>
          <div className="text-gray-400 text-sm mt-2">
            Create your first expense to see it in ledger format
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerView;
