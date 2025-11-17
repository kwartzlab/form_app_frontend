// src/tableConfigs.js

const tableConfigs = {
  "Reimbursement Request": {
    columns: [
      { 
        key: 'approval', 
        label: 'Approval/Project', 
        type: 'text',
        required: true
      },
      { 
        key: 'vendor', 
        label: 'Vendor', 
        type: 'text',
        required: true
      },
      { 
        key: 'description', 
        label: 'Item Description', 
        type: 'text',
        required: true
      },
      { 
        key: 'amount', 
        label: 'Amount ($)', 
        type: 'number',
        required: true,
        min: 0,
        step: 0.01
      },
      { 
        key: 'hst', 
        label: 'HST', 
        type: 'select',
        options: [
          'HST included in amount',
          'HST excluded from amount',
          'HST not charged'
        ],
        required: true
      },
      { 
        key: 'calculated_amount', 
        label: 'Calculated Amount ($)', 
        type: 'number',
        readonly: true,
        required: false
      }
    ],
    initialExpense: { 
      id: 1,
      approval: '', 
      vendor: '', 
      description: '', 
      amount: '', 
      hst: 'HST included in amount', 
      calculated_amount: '' 
    },
    // HST calculation logic specific to this form
    calculateAmount: (expense) => {
      if (expense.hst === 'HST excluded from amount') {
        return (parseFloat(expense.amount) * 1.13).toFixed(2);
      }
      return expense.amount;
    }
  },
  
  "Purchase Approval": {
    columns: [
      { 
        key: 'vendor', 
        label: 'Vendor', 
        type: 'text',
        required: true
      },
      { 
        key: 'description', 
        label: 'Item Description', 
        type: 'text',
        required: true
      },
      { 
        key: 'amount', 
        label: 'Amount ($)', 
        type: 'number',
        required: true,
        min: 0,
        step: 0.01
      }
    ],
    initialExpense: { 
      id: 1,
      vendor: '', 
      description: '', 
      amount: ''
    },
    // No HST calculation for purchase approval
    calculateAmount: (expense) => {
      return expense.amount;
    }
  }
};

export default tableConfigs;