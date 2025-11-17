# Reimbursement Form Frontend

React frontend for Kwartzlab's reimbursement request and purchase approval forms. Provides a user-friendly interface for submitting expenses with file attachments.

## Features

- Two form types with dynamic field switching:
  - Reimbursement Request (with HST calculation)
  - Purchase Approval
- Dynamic expense table with add/remove rows
- File upload with validation (type, size, total size)
- Real-time HST calculation for Reimbursement Requests
- Client-side validation matching backend rules
- hCaptcha integration
- Responsive design with Tailwind CSS
- Auto-clearing success/error messages
- Character counters for text fields

## Prerequisites

- Node.js 14+
- npm or yarn
- Backend API running (locally or deployed)
- hCaptcha site key

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Backend API URL (leave empty for local backend on port 5000)
REACT_APP_API_URL=

# hCaptcha Site Key (get from https://dashboard.hcaptcha.com/)
REACT_APP_HCAPTCHA_SITEKEY=your_hcaptcha_site_key
```

**For local development with backend on localhost:5000:**
```bash
# Leave REACT_APP_API_URL empty or explicitly set it
REACT_APP_API_URL=http://localhost:5000
REACT_APP_HCAPTCHA_SITEKEY=your_site_key
```

**Important Notes:**
- If `REACT_APP_API_URL` is not set, it defaults to `http://localhost:5000`
- For production, set `REACT_APP_API_URL` to your deployed backend URL
- Get your hCaptcha site key from [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)
- The site key is public and safe to commit (unlike the secret key used in backend)

### 3. Run the Application

```bash
# Start development server
npm start

# Application will open at http://localhost:3000
```

### 4. Test the Form

1. Navigate to http://localhost:3000
2. Select form type (Reimbursement Request or Purchase Approval)
3. Fill in contact information
4. Add expense line items
5. Upload test files (optional)
6. Complete hCaptcha
7. Submit form

**Make sure the backend is running** on http://localhost:5000 for submissions to work.

## Project Structure

```
frontend/
├── public/
│   ├── index.html           # HTML template
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── App.js               # Main form component with state management
│   ├── App.css              # Global styles
│   ├── index.js             # React entry point
│   ├── index.css            # Tailwind imports
│   ├── FormTypes.js         # Form type definitions
│   ├── tableConfigs.js      # Expense table configurations
│   └── components/
│       ├── Header.js        # Form header with title and description
│       ├── ContactInfoSection.js    # Name and email inputs
│       ├── ExpensesTable.js         # Dynamic expense table
│       ├── FileUploadSection.js     # File upload and display
│       └── CommentsSection.js       # Optional comments field
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment variable template
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

## Form Configuration

### FormTypes.js
Defines the two form types and their metadata:
```javascript
{
  "Reimbursement Request": {
    title: "Reimbursement Request",
    blurb: "Description text...",
    endpoint: "/submit"
  },
  "Purchase Approval": {
    title: "Purchase Approval", 
    blurb: "Description text...",
    endpoint: "/submit-PA"
  }
}
```

### tableConfigs.js
Defines expense table columns for each form type:
```javascript
{
  "Reimbursement Request": {
    columns: [
      { key: 'approval', label: 'Approval/Project', type: 'text', required: true },
      { key: 'vendor', label: 'Vendor', type: 'text', required: true },
      // ... more columns
    ],
    initialExpense: { id: 1, approval: '', vendor: '', ... },
    calculateAmount: (expense) => { /* HST calculation logic */ }
  },
  "Purchase Approval": {
    columns: [ /* simplified columns */ ],
    initialExpense: { id: 1, vendor: '', ... },
    calculateAmount: (expense) => expense.amount
  }
}
```

## Validation Rules

The frontend validates all inputs before submission to provide immediate feedback:

### Contact Information
- **First Name / Last Name:** Required, max 100 characters
- **Email:** Required, valid email format, max 255 characters

### Expenses
- **Text fields** (vendor, description, approval): Required, max 500 characters
- **Amount:** Required, positive number, max $1,000,000, cannot be zero
- **HST** (Reimbursement Request only): Required, select dropdown with 3 options

### Files
- **Allowed types:** .pdf, .png, .jpg, .jpeg, .gif, .bmp, .tiff, .xlsx, .xls, .csv, .doc, .docx, .txt
- **Size limits:** 
  - 10MB per file
  - 50MB total across all files
- File type validation happens on selection

### Comments
- Optional field
- Max 2000 characters
- Character counter displayed

### Other
- **hCaptcha:** Required, must be completed before submission

## Key Features Explained

### Dynamic Form Switching
Users can switch between Reimbursement Request and Purchase Approval forms. When switching:
- Common fields are preserved (vendor, description, amount)
- Form-specific fields are added/removed
- HST calculation is enabled/disabled based on form type

### HST Calculation
For Reimbursement Requests, when "HST excluded from amount" is selected:
- Calculated Amount = Amount × 1.13
- Displayed in readonly field
- Used for total calculation

### Expense Rows
- Start with one empty row
- Add more rows with "Add Row" button
- Remove rows with trash icon (minimum 1 row required)
- Each row has unique ID for React key management
- Empty required fields highlighted in red

### File Handling
- Multiple file selection supported
- Files displayed with name and size
- Individual file removal with X icon
- Validation on selection (immediate feedback)
- Files sent as FormData multipart request

### Error Handling
- Validation errors shown in red banner
- Success messages shown in green banner
- Messages auto-clear after 5 seconds
- Captcha resets on submission (success or failure)

## Building for Production

```bash
# Create optimized production build
npm run build

# Build output will be in the 'build/' directory
```

The build folder contains static files ready to deploy to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## Environment Variables for Production

When deploying, set these environment variables in your hosting platform:

```bash
# Your deployed backend URL
REACT_APP_API_URL=https://your-backend.run.app

# Your hCaptcha site key
REACT_APP_HCAPTCHA_SITEKEY=your_site_key
```

**Platform-specific instructions:**

**Netlify:**
- Go to Site Settings → Build & Deploy → Environment
- Add variables there

**Vercel:**
- Go to Project Settings → Environment Variables
- Add variables there

## Embedding in Squarespace

The form is designed to be embedded in Squarespace via iframe:

1. Deploy frontend to Netlify/Vercel
2. In Squarespace, add a Code Block
3. Insert iframe code:

```html
<iframe 
  src="https://your-netlify-site.netlify.app" 
  width="100%" 
  height="1200px" 
  frameborder="0"
  title="Reimbursement Form">
</iframe>
```

**Styling tips:**
- The form has `max-w-4xl` (896px max width) and centers itself
- White background with padding
- Adjust iframe height based on typical form size
- Consider making height responsive with JavaScript if needed

## Development Tips

### Debugging Backend Communication
Check browser console and Network tab:
```javascript
// The request URL is logged on submission
console.log(url);

// Check fetch request in Network tab
// Should be POST to http://localhost:5000/submit or /submit-PA
```

## Common Issues

**"Failed to fetch" or network error**
- Backend not running on localhost:5000
- CORS not configured (add CORS to backend in production)
- Wrong REACT_APP_API_URL in .env

**hCaptcha not loading**
- Invalid REACT_APP_HCAPTCHA_SITEKEY
- Ad blocker blocking hCaptcha
- Network connectivity issues

**Form not submitting**
- Check browser console for validation errors
- Verify all required fields are filled
- Ensure hCaptcha is completed
- Check that backend is returning 200 status

**Files not uploading**
- File size too large (check limits)
- Invalid file type
- Backend validation rejecting files

**Styles not loading**
- Run `npm install` to ensure Tailwind is installed
- Check that `index.css` imports Tailwind directives
- Restart development server after Tailwind config changes

## Accessibility Features

- Proper `label` and `input` associations with `htmlFor` and `id`
- ARIA labels on icon buttons
- `role="alert"` and `aria-live="polite"` on messages
- Semantic HTML elements
- Keyboard navigation support
- Focus management

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Next Steps

After local development is working:
1. Test all form scenarios end-to-end with backend
2. Verify validation messages are clear and helpful
3. Test on mobile devices
4. Test embedding in Squarespace
5. Prepare for deployment (see deployment section - to be added)

## Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Eject from Create React App (not recommended)
npm run eject
```

## Dependencies

Key dependencies and their purposes:
- **react** - UI framework
- **@hcaptcha/react-hcaptcha** - Captcha integration
- **lucide-react** - Icon components
- **tailwindcss** - Utility-first CSS framework

See `package.json` for complete list.
