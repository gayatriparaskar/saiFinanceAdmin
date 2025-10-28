import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { 
  EXPENSE_CATEGORIES, 
  EXPENSE_PRIORITIES, 
  // formatCurrency 
} from '../../services/expenseService';

const ExpenseForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditing = false,
  loading = false 
}) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      amount: '',
      category: 'personal',
      expense_date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      tags: '',
      receipt_url: '',
      supporting_documents: [],
      // Additional fields for ledger-style records
      expense_type: 'debit', // debit/credit
      account_number: '',
      reference_number: '',
      prepared_by: '',
      checked_by: '',
      passed_by: '',
      ledger_page: '',
      notes: '',
      // Currency notes tracking
      currency_notes: {
        notes_2000: 0,
        notes_500: 0,
        notes_200: 0,
        notes_100: 0,
        notes_50: 0,
        notes_20: 0,
        notes_10: 0,
        notes_5: 0,
        notes_2: 0,
        notes_1: 0,
        coins_5: 0,
        coins_2: 0,
        coins_1: 0,
        total_notes_amount: 0
      },
      withdrawal_type: 'cash',
      withdrawal_reason: ''
    });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        amount: initialData.amount || '',
        category: initialData.category || 'personal',
        expense_date: initialData.expense_date ? new Date(initialData.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        priority: initialData.priority || 'medium',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
        receipt_url: initialData.receipt_url || '',
        supporting_documents: initialData.supporting_documents || [],
        expense_type: initialData.expense_type || 'debit',
        account_number: initialData.account_number || '',
        reference_number: initialData.reference_number || '',
        prepared_by: initialData.prepared_by || '',
        checked_by: initialData.checked_by || '',
        passed_by: initialData.passed_by || '',
        ledger_page: initialData.ledger_page || '',
        notes: initialData.notes || '',
        currency_notes: initialData.currency_notes || {
          notes_2000: 0, notes_500: 0, notes_200: 0, notes_100: 0,
          notes_50: 0, notes_20: 0, notes_10: 0, notes_5: 0,
          notes_2: 0, notes_1: 0, coins_5: 0, coins_2: 0, coins_1: 0,
          total_notes_amount: 0
        },
        withdrawal_type: initialData.withdrawal_type || 'cash',
        withdrawal_reason: initialData.withdrawal_reason || ''
      });
    } else if (!isEditing) {
      // Reset form for new expense
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: 'personal',
        expense_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        tags: '',
        receipt_url: '',
        supporting_documents: [],
        expense_type: 'debit',
        account_number: '',
        reference_number: '',
        prepared_by: '',
        checked_by: '',
        passed_by: '',
        ledger_page: '',
        notes: '',
        currency_notes: {
          notes_2000: 0, notes_500: 0, notes_200: 0, notes_100: 0,
          notes_50: 0, notes_20: 0, notes_10: 0, notes_5: 0,
          notes_2: 0, notes_1: 0, coins_5: 0, coins_2: 0, coins_1: 0,
          total_notes_amount: 0
        },
        withdrawal_type: 'cash',
        withdrawal_reason: ''
      });
    }
  }, [isEditing, initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.expense_date) {
      newErrors.expense_date = 'Expense date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };

    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      url: URL.createObjectURL(file),
      filename: file.name,
      uploaded_on: new Date()
    }));

    setFormData(prev => ({
      ...prev,
      supporting_documents: [...prev.supporting_documents, ...newDocuments]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      supporting_documents: prev.supporting_documents.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black bg-opacity-50 flex ${
          isEditing ? 'items-center' : 'items-start pt-24 sm:pt-32'
        } justify-center z-[20000] p-4 overscroll-contain`}
        onClick={onClose}
      >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl ${isEditing ? 'max-h-[95vh]' : 'max-h-[calc(100vh-10rem)]'} overflow-y-auto z-[20001]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter expense title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter expense description"
              />
            </div>

            {/* Amount and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Date and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Date *
                </label>
                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.expense_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.expense_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.expense_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(EXPENSE_PRIORITIES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter tags separated by commas"
              />
              <p className="text-gray-500 text-sm mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Receipt URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt URL
              </label>
              <input
                type="url"
                name="receipt_url"
                value={formData.receipt_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/receipt"
              />
            </div>

            {/* Ledger Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ledger Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Type
                  </label>
                  <select
                    name="expense_type"
                    value={formData.expense_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter reference number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ledger Page
                  </label>
                  <input
                    type="text"
                    name="ledger_page"
                    value={formData.ledger_page}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 62.1"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Additional notes or remarks"
                />
              </div>
            </div>

            {/* Currency Notes Tracking */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Notes Tracking</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Type
                  </label>
                  <select
                    name="withdrawal_type"
                    value={formData.withdrawal_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Reason
                  </label>
                  <input
                    type="text"
                    name="withdrawal_reason"
                    value={formData.withdrawal_reason}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Reason for withdrawal"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="text-md font-medium text-gray-900 mb-3">Notes & Coins Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { key: 'notes_2000', label: '₹2000', color: 'bg-purple-100' },
                    { key: 'notes_500', label: '₹500', color: 'bg-blue-100' },
                    { key: 'notes_200', label: '₹200', color: 'bg-green-100' },
                    { key: 'notes_100', label: '₹100', color: 'bg-yellow-100' },
                    { key: 'notes_50', label: '₹50', color: 'bg-orange-100' },
                    { key: 'notes_20', label: '₹20', color: 'bg-red-100' },
                    { key: 'notes_10', label: '₹10', color: 'bg-pink-100' },
                    { key: 'notes_5', label: '₹5', color: 'bg-indigo-100' },
                    { key: 'notes_2', label: '₹2', color: 'bg-teal-100' },
                    { key: 'notes_1', label: '₹1', color: 'bg-gray-100' },
                    { key: 'coins_5', label: '₹5 Coin', color: 'bg-amber-100' },
                    { key: 'coins_2', label: '₹2 Coin', color: 'bg-cyan-100' },
                    { key: 'coins_1', label: '₹1 Coin', color: 'bg-lime-100' }
                  ].map((note) => (
                    <div key={note.key} className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${note.color}`}>
                        {note.label}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.currency_notes[note.key]}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            currency_notes: {
                              ...prev.currency_notes,
                              [note.key]: value
                            }
                          }));
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            setFormData(prev => ({
                              ...prev,
                              currency_notes: {
                                ...prev.currency_notes,
                                [note.key]: 0
                              }
                            }));
                          }
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Total Notes Amount: </span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{Object.entries(formData.currency_notes).reduce((total, [key, value]) => {
                        if (key === 'total_notes_amount') return total;
                        const denomination = key.includes('notes_') ? 
                          parseInt(key.replace('notes_', '')) : 
                          parseInt(key.replace('coins_', ''));
                        return total + (value * denomination);
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Chain */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Chain</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prepared By
                  </label>
                  <input
                    type="text"
                    name="prepared_by"
                    value={formData.prepared_by}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Name of person who prepared"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Checked By
                  </label>
                  <input
                    type="text"
                    name="checked_by"
                    value={formData.checked_by}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Name of person who checked"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passed By
                  </label>
                  <input
                    type="text"
                    name="passed_by"
                    value={formData.passed_by}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Name of person who passed"
                  />
                </div>
              </div>
            </div>

            {/* Supporting Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Documents
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              
              {formData.supporting_documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.supporting_documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{doc.filename}</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Expense' : 'Create Expense')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
    ),
    document.body
  );
};

export default ExpenseForm;
