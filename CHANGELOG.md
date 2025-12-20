# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2024-12-19

### Added

- **Authentication System**

  - Login page with context integration (`src/pages/auth/login.jsx`)
  - Register page with form validation (`src/pages/auth/register.jsx`)
  - Authentication context provider (`src/context/AuthContext.jsx`)
  - Protected route component (`src/app/ProtectedRoute.jsx`)
  - Custom authentication hooks (`src/hooks/index.js`)

- **Application Architecture**

  - App routing system with React Router (`src/app/AppRoutes.jsx`)
  - Layout component with Navbar, Sidebar, Footer (`src/app/Layout.jsx`)
  - Context providers for Game and Booking management
  - Comprehensive page structure for all modules

- **Page Components**

  - Dashboard page (`src/pages/dashboard/Dashboard.jsx`)
  - Tables management (`src/pages/tables/Tables.jsx`, `src/pages/tables/TableDetails.jsx`)
  - Bookings management (`src/pages/bookings/Bookings.jsx`)
  - Billing system (`src/pages/billing/Billing.jsx`)
  - Members management (`src/pages/members/Members.jsx`)
  - Reports module (`src/pages/reports/Reports.jsx`)

- **UI Components**

  - Layout components (Navbar, Sidebar, Footer)
  - Common components (PageHeader, Loading, EmptyState)
  - Game-specific components
  - Booking and billing components
  - Form components with validation

- **Context & State Management**

  - AuthContext for user authentication
  - GameContext for game state management
  - BookingContext for reservation management
  - Custom hooks for clean context consumption

- **Utilities & Services**

  - API service layer (`src/services/api.js`)
  - Price calculator with peak hours and membership discounts (`src/utils/priceCalculator.js`)
  - Time utilities for formatting and calculations (`src/utils/timeUtils.js`)
  - Constants file for application configuration (`src/utils/constants.js`)
  - Mock data for development testing (`src/data/mockData.js`)

- **Styling System**
  - Custom CSS framework (`src/styles/custom.css`)
  - CSS variables for theming
  - Responsive design patterns
  - Authentication-specific styles
  - Component styling with utility classes

### Fixed

- **Import Resolution Issues**

  - Fixed module import paths in `AppRoutes.jsx`
  - Corrected component export statements
  - Resolved React Router DOM integration

- **React Hook Violations**

  - Fixed useState in useEffect causing cascading renders
  - Replaced impure function calls (Date.now() in render)
  - Implemented proper state initialization patterns
  - Used useMemo for expensive computations

- **Fast Refresh Warnings**

  - Separated custom hooks into dedicated files
  - Fixed component naming conventions
  - Resolved circular dependency issues

- **Linting and Code Quality**
  - Fixed ESLint errors across all components
  - Removed unused imports and variables
  - Fixed regex escape sequence issues
  - Corrected duplicate key warnings

### Changed

- **Application Entry Point**

  - Updated `App.jsx` to use new routing system
  - Integrated custom CSS framework in `main.jsx`
  - Replaced default Vite template with snooker management system

- **Development Setup**
  - Added React Router DOM dependency
  - Configured development server with custom styling
  - Updated package configuration for snooker management

### Technical Details

- **Dependencies Added**: react-router-dom@^7.11.0
- **React Version**: ^19.2.0
- **Build Tool**: Vite ^7.2.4
- **Code Quality**: ESLint with React hooks plugin

### Development Notes

- All components follow React 18+ patterns with proper hook usage
- Authentication system uses mock implementation for development
- Responsive design supports mobile and desktop viewports
- Component architecture follows separation of concerns principles

---

## [0.1.0] - 2024-12-19

### Added

- Initial project setup with Vite and React 19
- Basic project structure and configuration
- Bootstrap integration for base styling
- ESLint configuration for code quality

### Dependencies

- React 19.2.0
- React DOM 19.2.0
- Vite 7.2.4
- Bootstrap 5.3.8
- ESLint with React plugins

---

**Legend:**

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
