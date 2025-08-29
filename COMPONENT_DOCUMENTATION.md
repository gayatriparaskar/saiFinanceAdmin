# SAI Finance Admin - Component Documentation

## 📋 Table of Contents
1. [Core Components](#core-components)
2. [Page Components](#page-components)
3. [Form Components](#form-components)
4. [Utility Components](#utility-components)
5. [Chart Components](#chart-components)

---

## 🧩 Core Components

### CardDataStats
**Location**: `src/componant/CardDataStats/CardDataStats.jsx`

**Purpose**: Reusable card component for displaying statistics and metrics on the dashboard.

**Props**:
- `title` (string): The title of the card
- `total` (string/number): The main value to display
- `rate` (string): Percentage change (e.g., "+2.1%")
- `levelUp` (boolean): Show upward trend icon
- `levelDown` (boolean): Show downward trend icon

**Usage**:
```jsx
<CardDataStats
  title="Total Active Loan Users"
  total={activeLoanUsers}
  rate="+2.1%"
  levelUp
/>
```

**Features**:
- Responsive design with hover effects
- Icon support for trend indicators
- Customizable styling with Tailwind CSS
- Animation support with Framer Motion

---

### Table
**Location**: `src/componant/Table/Table.jsx`

**Purpose**: Reusable table component for displaying data in tabular format.

**Props**:
- `headers` (array): Array of column headers
- `data` (array): Array of data objects
- `actions` (array): Array of action buttons for each row
- `onEdit` (function): Edit action handler
- `onDelete` (function): Delete action handler

**Usage**:
```jsx
<Table
  headers={["Name", "Phone", "Amount", "Actions"]}
  data={userData}
  actions={[
    { label: "Edit", onClick: handleEdit },
    { label: "Delete", onClick: handleDelete }
  ]}
/>
```

**Features**:
- Responsive table design
- Action button support
- Search and pagination ready
- Customizable styling

---

### Button
**Location**: `src/componant/Button/Button.jsx`

**Purpose**: Reusable button component with consistent styling.

**Props**:
- `children` (node): Button content
- `variant` (string): Button style variant
- `size` (string): Button size
- `onClick` (function): Click handler
- `disabled` (boolean): Disable button
- `loading` (boolean): Show loading state

**Usage**:
```jsx
<Button
  variant="primary"
  size="md"
  onClick={handleSubmit}
  loading={isLoading}
>
  Submit
</Button>
```

---

### Toast
**Location**: `src/componant/Toast/Toast.jsx`

**Purpose**: Notification component for displaying success, error, and info messages.

**Props**:
- `title` (string): Toast title
- `description` (string): Toast description
- `status` (string): Toast type (success, error, warning, info)
- `duration` (number): Display duration in milliseconds
- `isClosable` (boolean): Show close button

**Usage**:
```jsx
toast({
  title: "Success!",
  description: "User created successfully",
  status: "success",
  duration: 4000,
  isClosable: true
});
```

---

## 📄 Page Components

### FixedEnhancedDashHome
**Location**: `src/pages/Dashboard/userPanal/dashhome/FixedEnhancedDashHome.jsx`

**Purpose**: Main dashboard home page with analytics cards and charts.

**Key Features**:
- 8-card layout for financial metrics
- Real-time data fetching from multiple APIs
- Interactive charts and graphs
- Responsive design with animations
- Loading states and error handling

**State Management**:
```javascript
const [activeLoanUsers, setActiveLoanUsers] = useState(0);
const [totalLoanAmt, setTotalLoanAmt] = useState(0);
const [dailyCollection, setDailyCollection] = useState(0);
const [totalSavings, setTotalSavings] = useState(0);
// ... more state variables
```

**API Integration**:
- Fetches data from multiple endpoints
- Handles API errors gracefully
- Provides fallback data for testing
- Real-time updates

---

### Officer
**Location**: `src/pages/OfficerData/Officer.jsx`

**Purpose**: Officer management page for viewing and managing officers.

**Key Features**:
- Officer list with search functionality
- Action menu for each officer
- Navigation to officer details
- Create officer button
- Responsive table design

**State Management**:
```javascript
const [officers, setOfficers] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState("");
```

---

### OfficerInfo
**Location**: `src/pages/SavingAccount/officerInfo.jsx`

**Purpose**: Detailed officer information page with collections data.

**Key Features**:
- Officer personal information display
- User collections table
- Edit officer functionality
- PDF report generation
- Collection statistics

**State Management**:
```javascript
const [officerData, setOfficerData] = useState(null);
const [userCollections, setUserCollections] = useState([]);
const [isEditing, setIsEditing] = useState(false);
const [editData, setEditData] = useState({});
```

**PDF Generation**:
```javascript
const handleDownloadPdf = () => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Officer Report', 105, 20, { align: 'center' });
  
  // Add officer details
  doc.setFontSize(12);
  doc.text(`Name: ${officerData?.full_name}`, 20, 40);
  doc.text(`ID: ${officerData?.officer_code}`, 20, 50);
  
  // Add collections table
  autoTable(doc, {
    head: [['S.No', 'User Name', 'Phone', 'Amount', 'Date', 'Status']],
    body: userCollections.map((collection, index) => [
      index + 1,
      collection.name || collection.user_id,
      collection.phone_number || 'N/A',
      `₹${collection.collected_amount}`,
      dayjs(collection.collected_on).format('DD/MM/YYYY'),
      collection.account_type
    ])
  });
  
  doc.save(`officer-report-${officerData?.officer_code}.pdf`);
};
```

---

### CreateLoanUser
**Location**: `src/pages/LoanAccounts/CreateLoanUser.jsx`

**Purpose**: Form for creating new loan users with validation.

**Key Features**:
- Comprehensive form validation
- Phone number validation (10 digits)
- Real-time validation feedback
- Success/error notifications
- Form reset after submission

**Validation Rules**:
```javascript
// Phone number validation
const phoneRegex = /^[0-9]{10}$/;
if (!phoneRegex.test(formData.phone_number)) {
  toast({
    title: t("Invalid Phone Number! Must be 10 digits."),
    status: "error",
    duration: 4000,
    isClosable: true,
    position: "top",
  });
  return;
}
```

---

### CreateSavingUser
**Location**: `src/pages/SavingAccount/CreateSavingUser.jsx`

**Purpose**: Form for creating new saving account users with validation.

**Key Features**:
- Aadhar number validation (12 digits)
- PAN number validation
- Phone number validation
- Comprehensive error handling
- Form validation feedback

**Validation Rules**:
```javascript
// Aadhar validation
const aadharRegex = /^[0-9]{12}$/;
if (!aadharRegex.test(formData.aadhar_no)) {
  toast({
    title: t("Invalid Aadhar Number! Must be 12 digits."),
    status: "error",
    duration: 4000,
    isClosable: true,
    position: "top",
  });
  return;
}
```

---

### CreateOfficer
**Location**: `src/pages/OfficerData/CreateOfficer.jsx`

**Purpose**: Form for creating new officers with validation.

**Key Features**:
- Officer information form
- Phone number validation
- Form validation feedback
- Success notifications
- Form reset functionality

---

### AddSavingCollection
**Location**: `src/pages/SavingAccount/AddSavingCollection.jsx`

**Purpose**: Form for adding saving collections (deposits/withdrawals).

**Key Features**:
- Transaction type selection (deposit/withdrawal)
- Amount validation
- Penalty handling
- 3% deduction logic for withdrawals
- Real-time calculations

**Withdrawal Logic**:
```javascript
// 3% extra deduction logic
const threePercent = (formData.withdraw_amount * 3) / 100;
const totalDeduction = formData.withdraw_amount + threePercent;

payload = {
  ...payload,
  withdraw_amount: formData.withdraw_amount, // user ko jitna milega
  total_deduction: totalDeduction, // total deduction from account
};
```

---

## 🎨 Chart Components

### SimpleChart
**Location**: `src/componant/Charts/SimpleChart.jsx`

**Purpose**: Simple line chart for displaying data trends.

**Props**:
- `title` (string): Chart title
- `data` (array): Data points for the chart

### MonthlyChart
**Location**: `src/componant/Charts/MonthlyChart.jsx`

**Purpose**: Monthly statistics chart.

**Props**:
- `title` (string): Chart title
- `data` (array): Monthly data points

### WeeklyChart
**Location**: `src/componant/Charts/WeeklyChart.jsx`

**Purpose**: Weekly statistics chart.

**Props**:
- `title` (string): Chart title
- `data` (array): Weekly data points

### PerformanceChart
**Location**: `src/componant/Charts/PerformanceChart.jsx`

**Purpose**: Performance metrics chart.

**Props**:
- `title` (string): Chart title

---

## 🔧 Utility Components

### Loader
**Location**: `src/componant/Loader/Loding.jsx`

**Purpose**: Loading spinner component.

**Props**:
- `size` (string): Loader size
- `color` (string): Loader color

### Pagination
**Location**: `src/componant/Pagination/Pagination.jsx`

**Purpose**: Pagination component for tables.

**Props**:
- `currentPage` (number): Current page number
- `totalPages` (number): Total number of pages
- `onPageChange` (function): Page change handler

### Avatar
**Location**: `src/componant/Avatar/Avatar.jsx`

**Purpose**: User avatar component.

**Props**:
- `src` (string): Image source
- `alt` (string): Alt text
- `size` (string): Avatar size

---

## 🎯 Component Best Practices

### 1. Props Validation
```javascript
import PropTypes from 'prop-types';

CardDataStats.propTypes = {
  title: PropTypes.string.isRequired,
  total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  rate: PropTypes.string,
  levelUp: PropTypes.bool,
  levelDown: PropTypes.bool
};
```

### 2. Error Boundaries
```javascript
// src/components/ErrorBoundary/ApiErrorHandler.jsx
class ApiErrorHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### 3. Loading States
```javascript
// src/components/LoadingStates/ApiLoader.jsx
const ApiLoader = ({ isLoading, children, fallback }) => {
  if (isLoading) {
    return fallback || <Loader />;
  }
  return children;
};
```

### 4. Custom Hooks
```javascript
// src/hooks/useLocalTranslation.js
const useLocalTranslation = () => {
  const [language, setLanguage] = useState('en');
  
  const t = (key) => {
    return translations[language][key] || key;
  };

  return { t, language, setLanguage };
};
```

---

## 🔄 Component Lifecycle

### 1. Component Mounting
```javascript
useEffect(() => {
  // Fetch data on component mount
  fetchData();
  
  // Cleanup function
  return () => {
    // Cancel any pending requests
    if (controller) {
      controller.abort();
    }
  };
}, []);
```

### 2. Component Updates
```javascript
useEffect(() => {
  // Re-fetch data when dependencies change
  if (id) {
    fetchOfficerData(id);
  }
}, [id]);
```

### 3. Component Unmounting
```javascript
useEffect(() => {
  return () => {
    // Cleanup subscriptions, timers, etc.
    clearInterval(timer);
  };
}, []);
```

---

## 🎨 Styling Guidelines

### 1. Tailwind CSS Classes
```javascript
// Responsive design
className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"

// Hover effects
className="hover:bg-gray-50 hover:shadow-lg transition-all duration-300"

// Dark mode support
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

### 2. Custom CSS Classes
```css
/* src/styles/GlobalAnimations.css */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 3. Component-Specific Styles
```javascript
// Inline styles for dynamic values
const cardStyle = {
  backgroundColor: isActive ? '#10B981' : '#F3F4F6',
  transform: isHovered ? 'scale(1.05)' : 'scale(1)'
};
```

---

## 🧪 Testing Components

### 1. Unit Testing
```javascript
// Example test for CardDataStats component
import { render, screen } from '@testing-library/react';
import CardDataStats from './CardDataStats';

test('renders card with correct title and total', () => {
  render(
    <CardDataStats
      title="Test Title"
      total="100"
      rate="+5%"
      levelUp
    />
  );
  
  expect(screen.getByText('Test Title')).toBeInTheDocument();
  expect(screen.getByText('100')).toBeInTheDocument();
  expect(screen.getByText('+5%')).toBeInTheDocument();
});
```

### 2. Integration Testing
```javascript
// Example test for form submission
test('submits form with valid data', async () => {
  const mockSubmit = jest.fn();
  render(<CreateLoanUser onSubmit={mockSubmit} />);
  
  fireEvent.change(screen.getByLabelText(/phone/i), {
    target: { value: '1234567890' }
  });
  
  fireEvent.click(screen.getByText(/submit/i));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      phone_number: '1234567890'
    });
  });
});
```

---

## 📚 Component Documentation Template

### Component Name
**Location**: `path/to/component.jsx`

**Purpose**: Brief description of what the component does.

**Props**:
- `propName` (type): Description of the prop

**Usage**:
```jsx
<ComponentName propName="value" />
```

**Features**:
- Feature 1
- Feature 2
- Feature 3

**State Management**:
```javascript
const [state, setState] = useState(initialValue);
```

**API Integration**:
```javascript
// API calls and data handling
```

---

*This documentation should be updated whenever components are modified or new components are added.*
