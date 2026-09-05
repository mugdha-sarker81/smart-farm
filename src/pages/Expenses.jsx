// src/pages/Expenses.jsx
import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { DollarSign, Plus, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Expenses = () => {
  const { expenses, fields, crops, addExpense, loading } = useFarm();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Supplies',
    date: new Date().toISOString().split('T')[0],
    field_id: '',
    crop_id: '',
    notes: ''
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyBudget = 60000;
  const budgetUsed = (totalExpenses / monthlyBudget) * 100;
  const isOverBudget = totalExpenses > monthlyBudget;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setShowModal(false);
      setFormData({
        description: '',
        amount: '',
        category: 'Supplies',
        date: new Date().toISOString().split('T')[0],
        field_id: '',
        crop_id: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const categoryColors = {
    'Supplies': 'bg-blue-100 text-blue-700',
    'Labor': 'bg-purple-100 text-purple-700',
    'Equipment': 'bg-orange-100 text-orange-700',
    'Seeds': 'bg-green-100 text-green-700',
    'Fertilizer': 'bg-yellow-100 text-yellow-700',
    'Other': 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        <button
          onClick={() => {
            setEditingExpense(null);
            setFormData({
              description: '',
              amount: '',
              category: 'Supplies',
              date: new Date().toISOString().split('T')[0],
              field_id: '',
              crop_id: '',
              notes: ''
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Monthly Budget Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Monthly Budget</p>
            <p className="text-2xl font-bold text-gray-800">৳{monthlyBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>
              ৳{totalExpenses.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remaining</p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>
              ৳{(monthlyBudget - totalExpenses).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`rounded-full h-4 transition-all duration-500 ${isOverBudget ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-farm-green'}`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-sm text-gray-500">
            <span>0%</span>
            <span>{Math.round(budgetUsed)}% used</span>
            <span>100%</span>
          </div>
        </div>
        {budgetUsed > 80 && (
          <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
            isOverBudget ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            <AlertTriangle className="h-5 w-5" />
            <span>
              {isOverBudget 
                ? `Budget exceeded by ৳${(totalExpenses - monthlyBudget).toLocaleString()}!` 
                : `Warning: You've used ${Math.round(budgetUsed)}% of your budget.`}
            </span>
          </div>
        )}
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No expenses yet</h3>
          <p className="text-gray-500 mt-2">Track your farm expenses here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Field/Crop</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => {
                const field = fields.find(f => f.id === expense.field_id);
                const crop = crops.find(c => c.id === expense.crop_id);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(parseISO(expense.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {expense.description}
                      {expense.notes && (
                        <p className="text-xs text-gray-500">{expense.notes}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[expense.category] || 'bg-gray-100 text-gray-700'}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {field?.name || crop?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">
                      ৳{expense.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan="4" className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">
                  Total
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">
                  ৳{totalExpenses.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add New Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="Supplies">Supplies</option>
                  <option value="Labor">Labor</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                <select
                  value={formData.field_id}
                  onChange={(e) => setFormData({ ...formData, field_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="">Select field</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                <select
                  value={formData.crop_id}
                  onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="">Select crop</option>
                  {crops.map(crop => (
                    <option key={crop.id} value={crop.id}>{crop.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;