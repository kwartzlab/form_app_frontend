import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ExpensesTable({ 
  expenses, 
  onExpenseChange, 
  onExpenseAmountChange,
  onExpenseHSTChange,
  onAddRow, 
  onRemoveRow,
  calculateTotal 
}) {
    return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expenses <span className="text-red-500">*</span>
          </label>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700">Approval/Project</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700">Vendor</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700">Item Description</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700">Amount ($)</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700">HST</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700">Calculated Amount ($)</th>
                  <th className="border border-gray-300 px-2 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={expense.approval}
                        onChange={(e) => onExpenseChange(expense.id, 'approval', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={expense.vendor}
                        onChange={(e) => onExpenseChange(expense.id, 'vendor', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={expense.description}
                        onChange={(e) => onExpenseChange(expense.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={expense.amount}
                        onChange={(e) => onExpenseAmountChange(expense.id, 'amount', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <select
                        value={expense.hst}
                        onChange={(e) => onExpenseHSTChange(expense.id, 'hst', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option>HST included in amount</option>
                        <option>HST excluded from amount</option>
                        <option>HST not charged</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="number"
                        readonly
                        value={expense.calculated_amount}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveRow(expense.id)}
                        disabled={expenses.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={onAddRow}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <Plus size={16} /> Add Row
            </button>
            <div className="text-lg font-semibold text-gray-800">
              Total: ${calculateTotal()}
            </div>
          </div>
        </div>
    );
}