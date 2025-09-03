# Manager Dashboard Components

This folder contains the modularized components for the Manager Dashboard.

## Component Structure

### 📁 `index.jsx` - Main Component
- **Purpose**: Main ManagerDashboard component that orchestrates all other components
- **Responsibilities**: 
  - State management
  - Data fetching
  - Event handling
  - Component coordination

### 📊 `StatsCards.jsx` - Statistics Display
- **Purpose**: Displays the four stats cards (Total Officers, Active Officers, Total Collections, Today's Collections)
- **Props**: `stats` object containing dashboard statistics
- **Features**: Responsive grid layout with icons and hover effects

### 📋 `OfficerTable.jsx` - Data Table
- **Purpose**: Displays the table of officers with their collection data and action buttons
- **Props**: 
  - `officers` array
  - `editingOfficer` and `editingField` for inline editing
  - Various handler functions for actions
- **Features**: 
  - Inline editing for amounts
  - Action buttons (View, Assign To, Status, Bank)
  - Responsive design

### 🪟 `Modals.jsx` - Modal Components
- **Purpose**: Contains all modal dialogs used in the dashboard
- **Components**:
  - Officer Details Modal
  - Assign To Modal
  - Status Modal
  - Bank Assignment Modal
- **Props**: Various state variables and handler functions

### 📄 `index.js` - Export File
- **Purpose**: Provides clean import path for the main component
- **Usage**: `import ManagerDashboard from './ManagerDashboard'`

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused in other parts of the application
3. **Maintainability**: Easier to locate and fix issues
4. **Testing**: Individual components can be tested in isolation
5. **Code Organization**: Clear separation of concerns

## Import Usage

```javascript
// Import the main component
import ManagerDashboard from './ManagerDashboard';

// Or import individual components if needed
import StatsCards from './ManagerDashboard/StatsCards';
import OfficerTable from './ManagerDashboard/OfficerTable';
import Modals from './ManagerDashboard/Modals';
```

## State Management

The main component (`index.jsx`) manages all state and passes it down to child components as props. This ensures:
- Single source of truth for data
- Consistent state across all components
- Easy debugging and state tracking

## Event Handling

All event handlers are defined in the main component and passed down to child components. This centralizes:
- Business logic
- API calls
- State updates
- Error handling
