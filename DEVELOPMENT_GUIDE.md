# SAI Finance Admin - Development Guide

## 📋 Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Coding Standards](#coding-standards)
3. [Git Workflow](#git-workflow)
4. [Testing Guidelines](#testing-guidelines)
5. [Performance Optimization](#performance-optimization)
6. [Security Best Practices](#security-best-practices)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🛠 Development Environment Setup

### Prerequisites
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **Git**: Latest version
- **VS Code**: Recommended IDE
- **Chrome DevTools**: For debugging

### Required VS Code Extensions
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd sai-finance-admin

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

### Environment Configuration
```env
# .env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

---

## 📝 Coding Standards

### JavaScript/React Standards

#### 1. File Naming Conventions
```
✅ Good:
- CreateLoanUser.jsx
- officerInfo.jsx
- useLocalTranslation.js
- apiHandler.js

❌ Bad:
- createLoanUser.jsx
- OfficerInfo.jsx
- useLocalTranslation.jsx
- api_handler.js
```

#### 2. Component Structure
```javascript
// Standard component structure
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalTranslation } from '../../hooks/useLocalTranslation';
import axios from '../../axios';

const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks
  const { t } = useLocalTranslation();
  const [state, setState] = useState(initialValue);
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 3. Event handlers
  const handleEvent = () => {
    // Event logic
  };
  
  // 4. Helper functions
  const helperFunction = () => {
    // Helper logic
  };
  
  // 5. Render
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

#### 3. State Management
```javascript
// ✅ Good: Use descriptive state names
const [isLoading, setIsLoading] = useState(false);
const [userData, setUserData] = useState(null);
const [formErrors, setFormErrors] = useState({});

// ❌ Bad: Use generic names
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState({});
```

#### 4. Function Naming
```javascript
// ✅ Good: Use descriptive function names
const handleUserSubmit = () => {};
const fetchOfficerData = () => {};
const validatePhoneNumber = () => {};

// ❌ Bad: Use generic names
const submit = () => {};
const fetch = () => {};
const validate = () => {};
```

### CSS/Tailwind Standards

#### 1. Class Organization
```javascript
// ✅ Good: Organized classes
className="
  flex items-center justify-between
  p-4 bg-white rounded-lg shadow-md
  hover:shadow-lg transition-all duration-300
  dark:bg-gray-800 dark:text-white
"

// ❌ Bad: Random order
className="
  bg-white p-4 flex shadow-md
  dark:text-white rounded-lg
  hover:shadow-lg items-center
  transition-all duration-300 justify-between
  dark:bg-gray-800
"
```

#### 2. Responsive Design
```javascript
// ✅ Good: Mobile-first approach
className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 lg:grid-cols-3
  xl:grid-cols-4
"

// ❌ Bad: Desktop-first
className="
  grid grid-cols-4 gap-4
  lg:grid-cols-3 md:grid-cols-2
  sm:grid-cols-1
"
```

### Form Validation Standards

#### 1. Validation Patterns
```javascript
// Common validation patterns
const VALIDATION_PATTERNS = {
  phone: /^[0-9]{10}$/,
  aadhar: /^[0-9]{12}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  amount: /^[0-9]+(\.[0-9]{1,2})?$/
};
```

#### 2. Error Handling
```javascript
// ✅ Good: Comprehensive error handling
const handleSubmit = async (formData) => {
  try {
    // Validation
    if (!VALIDATION_PATTERNS.phone.test(formData.phone_number)) {
      throw new Error('Invalid phone number');
    }
    
    // API call
    const response = await axios.post('/api/endpoint', formData);
    
    // Success handling
    toast({
      title: 'Success!',
      description: response.data.message,
      status: 'success'
    });
    
    return response.data;
  } catch (error) {
    // Error handling
    const errorMessage = error.response?.data?.message || error.message;
    
    toast({
      title: 'Error!',
      description: errorMessage,
      status: 'error'
    });
    
    throw error;
  }
};
```

---

## 🔄 Git Workflow

### Branch Naming Convention
```
feature/feature-name
bugfix/bug-description
hotfix/urgent-fix
release/version-number
```

### Commit Message Format
```
type(scope): description

feat(auth): add login functionality
fix(forms): resolve validation errors
docs(readme): update installation guide
style(ui): improve button styling
refactor(api): optimize data fetching
test(components): add unit tests
```

### Pull Request Process
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

3. **Push Changes**
   ```bash
   git push origin feature/new-feature
   ```

4. **Create Pull Request**
   - Use descriptive title
   - Add detailed description
   - Include screenshots if UI changes
   - Request code review

5. **Code Review Checklist**
   - [ ] Code follows standards
   - [ ] Tests are included
   - [ ] Documentation is updated
   - [ ] No console errors
   - [ ] Responsive design works
   - [ ] Accessibility standards met

---

## 🧪 Testing Guidelines

### Unit Testing
```javascript
// __tests__/components/CardDataStats.test.js
import { render, screen } from '@testing-library/react';
import CardDataStats from '../../src/componant/CardDataStats/CardDataStats';

describe('CardDataStats', () => {
  test('renders with correct props', () => {
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
  
  test('handles missing props gracefully', () => {
    render(<CardDataStats title="Test" />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });
});
```

### Integration Testing
```javascript
// __tests__/integration/FormSubmission.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateLoanUser from '../../src/pages/LoanAccounts/CreateLoanUser';

describe('CreateLoanUser Form', () => {
  test('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<CreateLoanUser onSubmit={mockSubmit} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '1234567890' }
    });
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText(/submit/i));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        phone_number: '1234567890',
        full_name: 'John Doe'
      });
    });
  });
});
```

### API Testing
```javascript
// __tests__/api/endpoints.test.js
import axios from 'axios';

describe('API Endpoints', () => {
  test('GET /users/ returns user list', async () => {
    const response = await axios.get('/users/');
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.result)).toBe(true);
  });
  
  test('POST /admins/login with valid credentials', async () => {
    const credentials = {
      email: 'admin@example.com',
      password: 'password123'
    };
    
    const response = await axios.post('/admins/login', credentials);
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.result.token).toBeDefined();
  });
});
```

### Test Coverage
```bash
# Run tests with coverage
npm test -- --coverage --watchAll=false

# Generate coverage report
npm run test:coverage
```

---

## ⚡ Performance Optimization

### 1. Code Splitting
```javascript
// Lazy load components
import React, { lazy, Suspense } from 'react';

const CreateLoanUser = lazy(() => import('./pages/LoanAccounts/CreateLoanUser'));
const CreateSavingUser = lazy(() => import('./pages/SavingAccount/CreateSavingUser'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/create-loan" element={<CreateLoanUser />} />
      <Route path="/create-saving" element={<CreateSavingUser />} />
    </Routes>
  </Suspense>
);
```

### 2. Memoization
```javascript
// Memoize expensive components
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // Expensive rendering logic
  return <div>{/* Component content */}</div>;
});

// Memoize expensive calculations
import React, { useMemo } from 'react';

const Dashboard = ({ users }) => {
  const totalAmount = useMemo(() => {
    return users.reduce((sum, user) => sum + (user.amount || 0), 0);
  }, [users]);
  
  return <div>Total: {totalAmount}</div>;
};
```

### 3. API Optimization
```javascript
// Debounce API calls
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (searchTerm) => {
  const response = await axios.get(`/users/search?q=${searchTerm}`);
  setSearchResults(response.data.result);
}, 300);

// Cache API responses
const useCachedApi = (endpoint, cacheKey) => {
  const [data, setData] = useState(() => {
    const cached = sessionStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  });
  
  useEffect(() => {
    if (!data) {
      axios.get(endpoint).then(response => {
        setData(response.data.result);
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data.result));
      });
    }
  }, [endpoint, cacheKey, data]);
  
  return data;
};
```

### 4. Bundle Optimization
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

---

## 🔒 Security Best Practices

### 1. Input Validation
```javascript
// Sanitize user inputs
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }
  return input;
};

// Validate form data
const validateFormData = (data) => {
  const errors = {};
  
  if (!data.phone_number || !/^[0-9]{10}$/.test(data.phone_number)) {
    errors.phone_number = 'Invalid phone number';
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email address';
  }
  
  return errors;
};
```

### 2. Authentication
```javascript
// Token management
const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = (userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/login';
  };
  
  const isAuthenticated = () => {
    return !!token;
  };
  
  return { token, login, logout, isAuthenticated };
};
```

### 3. XSS Prevention
```javascript
// Sanitize HTML content
import DOMPurify from 'dompurify';

const SafeHTML = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};

// Escape user content
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
```

### 4. CSRF Protection
```javascript
// Add CSRF token to requests
const addCSRFToken = (config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  if (token) {
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
};

axios.interceptors.request.use(addCSRFToken);
```

---

## 🚀 Deployment Guide

### 1. Build Process
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Analyze bundle
npm run analyze
```

### 2. Environment Configuration
```env
# Production environment
REACT_APP_API_BASE_URL=https://api.saifinance.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
```

### 3. Docker Deployment
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name saifinance.com;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        REACT_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}
    
    - name: Deploy to server
      run: |
        # Deployment commands
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --reset-cache
```

#### 2. API Connection Issues
```javascript
// Check network connectivity
const checkNetworkStatus = async () => {
  try {
    await axios.get('/health');
    return true;
  } catch (error) {
    console.error('Network error:', error);
    return false;
  }
};
```

#### 3. Memory Leaks
```javascript
// Cleanup useEffect
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data', {
        signal: controller.signal
      });
      setData(response.data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  };
  
  fetchData();
  
  return () => {
    controller.abort();
  };
}, []);
```

#### 4. Performance Issues
```javascript
// Monitor component re-renders
import { useWhyDidYouUpdate } from 'use-why-did-you-update';

const ExpensiveComponent = React.memo(({ data }) => {
  useWhyDidYouUpdate('ExpensiveComponent', { data });
  
  return <div>{/* Component content */}</div>;
});
```

### Debug Tools

#### 1. React Developer Tools
- Install React Developer Tools extension
- Use Profiler to identify performance issues
- Check component hierarchy and props

#### 2. Network Tab
- Monitor API calls
- Check response times
- Identify failed requests

#### 3. Console Debugging
```javascript
// Add debug logging
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

const debugLog = (message, data) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
};
```

---

## 📚 Additional Resources

### Documentation
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chakra UI Documentation](https://chakra-ui.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### Tools
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting
- [Jest](https://jestjs.io/) - Testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Best Practices
- [React Best Practices](https://reactjs.org/docs/hooks-faq.html)
- [JavaScript Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [CSS Best Practices](https://developer.mozilla.org/en-US/docs/Learn/CSS)

---

*This development guide should be updated as the project evolves and new best practices are adopted.*
