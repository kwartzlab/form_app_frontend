import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function ReimbursementForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    comments: ''
  });
  
  const [expenses, setExpenses] = useState([
    { id: 1, approval: '', vendor: '', description: '', amount: '', hst: 'HST included in amount', calculated_amount: '' }
  ]);
  
  const [files, setFiles] = useState([]);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {                        //only first name, last name, email, and comments call handleInputChange. Expense rows and files call their own handlers 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp      //for every expense, if expense id matches id, expand expense and replace value of passed field with passed value, else leave expense the same
    ));
  };

  const newHSTCalculateAmount = (exp, value) => {
    exp['hst'] = value;
    if (value === 'HST excluded from amount') exp['calculated_amount'] = (exp['amount'] * 1.13).toFixed(2);
    else exp['calculated_amount'] = exp['amount'];
    return exp;
  }

  const newAmountCalculateAmount = (exp, value) => {
    exp['amount'] = value;
    if (exp['hst'] === 'HST excluded from amount') exp['calculated_amount'] = (value * 1.13).toFixed(2);
    else exp['calculated_amount'] = value;
    return exp;
  }

  const handleExpenseHSTChange = (id, field, value) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? newHSTCalculateAmount(exp, value) : exp
    ));
  }

  const handleExpenseAmountChange = (id, field, value) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? newAmountCalculateAmount(exp, Math.max(value, 0)) : exp
    ));
  }

  const addExpenseRow = () => {
    const newId = Math.max(...expenses.map(e => e.id)) + 1;     //sets new ID at highest of old IDs + 1, rather than re-using deleted lower ids. testing shows no problems, probably don't need to test beyond normal integer bounds
    setExpenses([...expenses, {
      id: newId,
      approval: '',
      vendor: '',
      description: '',
      amount: '',
      hst: 'HST included in amount',
      calculated_amount: '',
    }]);
  };

  const removeExpenseRow = (id) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(exp => exp.id !== id));     //filter returns new array containing all elements that meet the condition
    }
  };

  const fileInputRef = React.useRef(null);
  const hcaptchaRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
      // Reset the input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));            //files.filter() passes iterable list of files to fn inside brackets, "_" shows that the file itself is ignored
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, exp) => {
      const amount = parseFloat(exp.calculated_amount) || 0;
      return sum + amount;
    }, 0).toFixed(2);
  };

  const handleSubmit = async () => {
    // Validate captcha
    if (!captchaToken) {
      setMessage({ type: 'error', text: 'Please complete the captcha verification.' });
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    // Validate at least one expense with amount
    const hasValidExpense = expenses.some(exp => exp.amount && parseFloat(exp.amount) > 0);
    if (!hasValidExpense) {
      setMessage({ type: 'error', text: 'Please add at least one expense with an amount.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('comments', formData.comments);
      formDataToSend.append('expenses', JSON.stringify(expenses));
      formDataToSend.append('captchaToken', captchaToken);
      
      files.forEach((file, index) => {
        formDataToSend.append(`file${index}`, file);
      });

      // Replace with your actual backend URL
      /*const response = await fetch('https://your-backend-url.railway.app/submit', {
        method: 'POST',
        body: formDataToSend
      });*/

      //for dev
      const response = await fetch('http://localhost:5000/submit', {
        method: 'POST',
        body: formDataToSend
      })


      if (response.ok) {
        setMessage({ type: 'success', text: 'Reimbursement request submitted successfully!' });
        // Reset
        setFormData({ firstName: '', lastName: '', email: '', comments: '' });
        setExpenses([{ id: 1, approval: '', vendor: '', description: '', amount: '', hst: 'HST included in amount', calculated_amount: '' }]);
        setFiles([]);
        setCaptchaToken(null);
        hcaptchaRef.current?.resetCaptcha();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Submission failed. Please try again.' });
        hcaptchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
      hcaptchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Reimbursement Request</h1>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Expenses Table */}
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
                        onChange={(e) => handleExpenseChange(expense.id, 'approval', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={expense.vendor}
                        onChange={(e) => handleExpenseChange(expense.id, 'vendor', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={expense.description}
                        onChange={(e) => handleExpenseChange(expense.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={expense.amount}
                        onChange={(e) => handleExpenseAmountChange(expense.id, 'amount', e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <select
                        value={expense.hst}
                        onChange={(e) => handleExpenseHSTChange(expense.id, 'hst', e.target.value)}
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
                        onClick={() => removeExpenseRow(expense.id)}
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
              onClick={addExpenseRow}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <Plus size={16} /> Add Row
            </button>
            <div className="text-lg font-semibold text-gray-800">
              Total: ${calculateTotal()}
            </div>
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded p-4">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="file-upload"
            />
            <button
              type="button"
              onClick={handleUploadClick}
              className="flex items-center justify-center gap-2 w-full cursor-pointer text-blue-600 hover:text-blue-800"
            >
              <Upload size={20} />
              <span>Click to upload files</span>
            </button>
            
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Comments
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Captcha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Check <span className="text-red-500">*</span>
          </label>
          <HCaptcha
            ref={hcaptchaRef}
            sitekey="24a08dca-e6e4-4f3e-b174-ce08af6a235a"
            onVerify={onCaptchaChange}
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Reimbursement Request'}
        </button>
      </div>
    </div>
  );
}