import React, { useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import ContactInfoSection from './components/ContactInfoSection';
import ExpensesTable from './components/ExpensesTable';
import FileUploadSection from './components/FileUploadSection';
import CommentsSection from './components/CommentsSection';
import Header from './components/Header';
import formTypes from './FormTypes';
import tableConfigs from './tableConfigs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total

const DEV = true;

export default function ReimbursementForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    comments: ''
  });

  const [formType, setFormType] = useState({
    type: 'Reimbursement Request',
    title: 'Reimbursement Request',
    blurb: 'This form is for submitting already-approved purchases (or lab consumables under $50). If you need to get approval for a new purchase, use the Purchase Approval Form instead.',
    endpoint: '/submit'
  });

  // Get initial config based on form type
  const [currentConfig, setCurrentConfig] = useState(tableConfigs[formType.type]);

  const [expenses, setExpenses] = useState([
    { ...currentConfig.initialExpense }
  ]);
  
  const [files, setFiles] = useState([]);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fileInputRef = React.useRef(null);
  const hcaptchaRef = React.useRef(null);

  const handleInputChange = (e) => {                        //only first name, last name, email, and comments call handleInputChange. Expense rows and files call their own handlers 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormTypeChange = (e) => {
    const newType = e;
    const newConfig = tableConfigs[newType];
    
    setFormType({ 
      type: newType, 
      title: formTypes[newType]["title"], 
      blurb: formTypes[newType]["blurb"], 
      endpoint: formTypes[newType]["endpoint"] 
    });
    
    setCurrentConfig(newConfig);
    
    // Preserve common fields when switching form types
    const newExpenses = expenses.map(expense => {
      const newExpense = { ...newConfig.initialExpense, id: expense.id };
      
      // Copy over common fields that exist in both configs
      newConfig.columns.forEach(column => {
        if (expense[column.key] !== undefined) {
          newExpense[column.key] = expense[column.key];
        }
      });
      
      // Recalculate calculated_amount if it exists in new config
      if (newExpense.calculated_amount !== undefined) {
        newExpense.calculated_amount = newConfig.calculateAmount(newExpense);
      }
      
      return newExpense;
    });
    
    setExpenses(newExpenses);
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(exp => {
      if (exp.id !== id) return exp;      //for every expense, if expense id matches id, expand expense and replace value of passed field with passed value, else leave expense the same
      
      const updatedExpense = { ...exp, [field]: value };
      
      // If amount or hst changed, recalculate calculated_amount
      if ((field === 'amount' || field === 'hst') && currentConfig.calculateAmount) {
        updatedExpense.calculated_amount = currentConfig.calculateAmount(updatedExpense);
      }
      
      return updatedExpense;
    }));
  };

  const addExpenseRow = () => {
    const newId = Math.max(...expenses.map(e => e.id)) + 1;     //sets new ID at highest of old IDs + 1, rather than re-using deleted lower ids. testing shows no problems, probably don't need to test beyond normal integer bounds
    const newExpense = { ...currentConfig.initialExpense, id: newId };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpenseRow = (id) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(exp => exp.id !== id));     //filter returns new array containing all elements that meet the condition
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Check individual file sizes
      const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        setMessage({ 
          type: 'error', 
          text: `File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 10MB per file.` 
        });
        e.target.value = '';
        return;
      }
      
      // Check total size (existing + new files)
      const currentTotal = files.reduce((sum, file) => sum + file.size, 0);
      const newTotal = newFiles.reduce((sum, file) => sum + file.size, 0);
      
      if (currentTotal + newTotal > MAX_TOTAL_SIZE) {
        setMessage({ 
          type: 'error', 
          text: `Total file size exceeds 50MB limit. Current total: ${((currentTotal + newTotal) / (1024 * 1024)).toFixed(2)}MB` 
        });
        e.target.value = '';
        return;
      }
    
      setFiles([...files, ...newFiles]);
      e.target.value = '';
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));            //files.filter() passes iterable list of files to fn inside brackets, "_" shows that the file itself is ignored
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, exp) => {
      // Use calculated_amount if it exists, otherwise use amount
      const amount = parseFloat(exp.calculated_amount || exp.amount) || 0;
      return sum + amount;
    }, 0).toFixed(2);
  };

  // Filter expenses to only include fields defined in current config before submitting
  const getFilteredExpenses = () => {
    const validKeys = currentConfig.columns.map(col => col.key);
    return expenses.map(expense => {
      const filtered = { id: expense.id };
      validKeys.forEach(key => {
        if (expense[key] !== undefined) {
          filtered[key] = expense[key];
        }
      });
      return filtered;
    });
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
      
      // Send only the fields that exist in the current form config
      formDataToSend.append('expenses', JSON.stringify(getFilteredExpenses()));
      formDataToSend.append('captchaToken', captchaToken);
      
      files.forEach((file, index) => {
        formDataToSend.append(`file${index}`, file);
      });

      //TODO add deployment backend url
      const url = (DEV ? 'http://localhost:5000' : '') + formType["endpoint"];
      console.log(url);
      const response = await fetch(url, {method: 'POST', body: formDataToSend});

      if (response.ok) {
        setMessage({ type: 'success', text: formType.title + ' submitted successfully!' });
        // Reset
        setFormData({ firstName: '', lastName: '', email: '', comments: '' });
        setExpenses([{ ...currentConfig.initialExpense }]);
        setFiles([]);
        setCaptchaToken(null);
        hcaptchaRef.current?.resetCaptcha();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Submission failed. Please try again.' });
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
      <select
        value={formType.type}
        onChange={(e) => handleFormTypeChange(e.target.value)}
        className="w-full px-2 py-4 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option>Reimbursement Request</option>
        <option>Purchase Approval</option>
      </select>

      <Header content={formType}/>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Information */}
        <ContactInfoSection
          formData={formData} 
          onChange={handleInputChange}
        />

        {/* Expenses Table */}
        <ExpensesTable
          expenses={expenses}
          config={currentConfig}
          onExpenseChange={handleExpenseChange}
          onAddRow={addExpenseRow}
          onRemoveRow={removeExpenseRow}
          calculateTotal={calculateTotal}
        />

        {/* File Attachments */}
        <FileUploadSection
          files={files}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
          onUploadClick={handleUploadClick}
          formatFileSize={formatFileSize}
        />

        {/* Comments */}
        <CommentsSection
          formData={formData} 
          onChange={handleInputChange}
        />

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
          {submitting ? 'Submitting...' : 'Submit ' + formType["title"]}
        </button>
      </div>
    </div>
  );
}