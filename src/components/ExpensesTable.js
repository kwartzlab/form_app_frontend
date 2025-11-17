import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ExpensesTable({ 
  expenses, 
  config,
  onExpenseChange,
  onAddRow, 
  onRemoveRow,
  calculateTotal 
}) {
  const renderField = (column, expense) => {
    const isEmpty = !expense[column.key] || expense[column.key] === '';
    const isRequired = column.required;
    const highlightClass = isEmpty && isRequired ? 'bg-red-50' : '';

    const commonClasses = `w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 ${highlightClass}`;
    
    switch (column.type) {
      case 'text':
        return (
          <input
            type="text"
            value={expense[column.key] || ''}
            onChange={(e) => onExpenseChange(expense.id, column.key, e.target.value)}
            className={commonClasses}
            required={isRequired}
          />
        );
      
      case 'number':
        if (column.readonly) {
          return (
            <input
              type="number"
              readOnly
              value={expense[column.key] || ''}
              className={commonClasses}
            />
          );
        }
        return (
          <input
            type="number"
            step={column.step || 0.01}
            min={column.min || 0}
            value={expense[column.key] || ''}
            onChange={(e) => onExpenseChange(expense.id, column.key, e.target.value)}
            className={commonClasses}
          />
        );
      
      case 'select':
        return (
          <select
            value={expense[column.key] || column.options[0]}
            onChange={(e) => onExpenseChange(expense.id, column.key, e.target.value)}
            className={commonClasses}
          >
            {column.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Expenses <span className="text-red-500">*</span>
      </label>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {config.columns.map((column) => (
                <th 
                  key={column.key}
                  className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700"
                >
                  {column.label}
                </th>
              ))}
              <th className="border border-gray-300 px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                {config.columns.map((column) => (
                  <td key={column.key} className="border border-gray-300 p-1">
                    {renderField(column, expense)}
                  </td>
                ))}
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