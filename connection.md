# Page Connections & Dependencies

This document maps the relationships between pages, components, and other files in the Snooker Management System.

## Page Structure Overview

```
Pages/
├── Authentication (Public)
├── Dashboard (Protected)
├── Tables Management (Protected)
├── Bookings Management (Protected)
├── Billing System (Protected)
├── Members Management (Protected)
└── Reports Module (Protected)
```

---

## Authentication Pages (Public Routes)

### 🔐 Login Page (`src/pages/auth/login.jsx`)

**Route:** `/login`

**Dependencies:**

- **Hooks:** `useAuth` from `src/hooks/index.js`
- **Router:** `Navigate`, `Link` from `react-router-dom`
- **Styling:** `src/styles/custom.css`
- **Context:** Uses AuthContext via useAuth hook

**Components Used:**

- Native form elements with custom styling
- Error message display
- Loading states

**Features:**

- Email/password authentication
- Form validation
- Auto-redirect if already logged in
- Link to registration page

---

### 📝 Register Page (`src/pages/auth/register.jsx`)

**Route:** `/register`

**Dependencies:**

- **Hooks:** `useAuth` from `src/hooks/index.js`
- **Router:** `Navigate`, `Link` from `react-router-dom`
- **Styling:** `src/styles/custom.css`
- **Context:** Uses AuthContext via useAuth hook

**Components Used:**

- Registration form with validation
- Password confirmation
- Error/success message display
- Loading states

**Features:**

- Full name, email, password registration
- Password strength validation
- Auto-redirect if already logged in
- Link to login page

---

## Protected Pages (Requires Authentication)

All protected pages are wrapped by:

- **Layout Component:** `src/app/Layout.jsx`
- **Protected Route:** `src/app/ProtectedRoute.jsx`
- **Context Providers:** AuthContext, GameContext, BookingContext

### 🏠 Dashboard (`src/pages/dashboard/Dashboard.jsx`)

**Route:** `/dashboard` (default route)

**Dependencies:**

- **Components:**
  - `src/components/layout/Navbar.jsx`
  - `src/components/layout/Sidebar.jsx`
  - `src/components/layout/Footer.jsx`
  - `src/components/common/PageHeader.jsx`
  - `src/components/common/Loading.jsx`
- **Context:** AuthContext, GameContext, BookingContext
- **Services:** `src/services/api.js`
- **Utils:** `src/utils/priceCalculator.js`
- **Data:** `src/data/mockData.js`

**Features:**

- Overview statistics
- Recent bookings
- Table availability
- Revenue summary

---

### 🎱 Tables Management

#### Tables List (`src/pages/tables/Tables.jsx`)

**Route:** `/tables`

**Dependencies:**

- **Components:**
  - Layout components (Navbar, Sidebar, Footer)
  - `src/components/common/PageHeader.jsx`
  - `src/components/common/EmptyState.jsx`
  - `src/components/game/TableCard.jsx`
- **Context:** GameContext, AuthContext
- **Services:** `src/services/api.js`
- **Utils:** `src/utils/constants.js`

**Features:**

- Table listing with status
- Search and filter functionality
- Add new table action
- Table availability display

#### Table Details (`src/pages/tables/TableDetails.jsx`)

**Route:** `/tables/:id`

**Dependencies:**

- **Components:**
  - Layout components
  - `src/components/game/TableInfo.jsx`
  - `src/components/booking/BookingHistory.jsx`
- **Context:** GameContext, BookingContext
- **Services:** `src/services/api.js`
- **Utils:** `src/utils/timeUtils.js`

**Features:**

- Detailed table information
- Current booking status
- Booking history
- Maintenance records

---

### 📅 Bookings Management

#### Bookings List (`src/pages/bookings/Bookings.jsx`)

**Route:** `/bookings`

**Dependencies:**

- **Components:**
  - Layout components
  - `src/components/booking/BookingCard.jsx`
  - `src/components/common/Loading.jsx`
  - `src/components/common/EmptyState.jsx`
- **Context:** BookingContext, AuthContext, GameContext
- **Services:** `src/services/api.js`
- **Utils:**
  - `src/utils/timeUtils.js`
  - `src/utils/priceCalculator.js`

**Features:**

- Current and upcoming bookings
- Booking status management
- Search and filter options
- Quick actions (cancel, modify)

---

### 💰 Billing System

#### Billing Dashboard (`src/pages/billing/Billing.jsx`)

**Route:** `/billing`

**Dependencies:**

- **Components:**
  - Layout components
  - `src/components/billing/InvoiceCard.jsx`
  - `src/components/billing/PaymentSummary.jsx`
  - `src/components/common/PageHeader.jsx`
- **Context:** AuthContext, BookingContext
- **Services:** `src/services/api.js`
- **Utils:** `src/utils/priceCalculator.js`
- **Data:** `src/data/mockData.js`

**Features:**

- Revenue overview
- Outstanding payments
- Invoice management
- Payment history

---

### 👥 Members Management

#### Members List (`src/pages/members/Members.jsx`)

**Route:** `/members`

**Dependencies:**

- **Components:**
  - Layout components
  - `src/components/common/PageHeader.jsx`
  - `src/components/common/Loading.jsx`
  - Member-specific components
- **Context:** AuthContext
- **Services:** `src/services/api.js`
- **Utils:** `src/utils/constants.js`

**Features:**

- Member directory
- Membership status
- Member search and filters
- Registration management

---

### 📊 Reports Module

#### Reports Dashboard (`src/pages/reports/Reports.jsx`)

**Route:** `/reports`

**Dependencies:**

- **Components:**
  - Layout components
  - Chart/graph components
  - `src/components/common/PageHeader.jsx`
- **Context:** AuthContext, GameContext, BookingContext
- **Services:** `src/services/api.js`
- **Utils:**
  - `src/utils/timeUtils.js`
  - `src/utils/priceCalculator.js`

**Features:**

- Revenue reports
- Usage analytics
- Member statistics
- Export functionality

---

## Core Application Architecture

### App Router (`src/app/AppRoutes.jsx`)

**Central routing configuration that connects all pages**

**Dependencies:**

- **Router:** React Router DOM
- **Context Providers:**
  - `src/context/AuthContext.jsx`
  - `src/context/GameContext.jsx`
  - `src/context/BookingContext.jsx`
- **Components:**
  - `src/app/Layout.jsx`
  - `src/app/ProtectedRoute.jsx`
- **All Page Components:** Listed above

**Structure:**

```jsx
<Router>
  <AuthProvider>
    <GameProvider>
      <BookingProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>{/* All protected page routes */}</Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BookingProvider>
    </GameProvider>
  </AuthProvider>
</Router>
```

### Layout Component (`src/app/Layout.jsx`)

**Wraps all protected pages**

**Dependencies:**

- `src/components/layout/Navbar.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/Footer.jsx`

### Protected Route (`src/app/ProtectedRoute.jsx`)

**Authentication guard for protected pages**

**Dependencies:**

- **Hooks:** `useAuth` from `src/hooks/index.js`
- **Router:** `Navigate` from `react-router-dom`
- **Context:** AuthContext via useAuth hook

---

## Shared Dependencies

### Context Providers

- **AuthContext** (`src/context/AuthContext.jsx`) - User authentication state
- **GameContext** (`src/context/GameContext.jsx`) - Game and table state
- **BookingContext** (`src/context/BookingContext.jsx`) - Booking management state

### Custom Hooks

- **useAuth** - Authentication operations
- **useGame** - Game state management
- **useBooking** - Booking operations

### Services

- **API Service** (`src/services/api.js`) - HTTP requests to backend
- **Mock Data** (`src/data/mockData.js`) - Development data

### Utilities

- **Price Calculator** (`src/utils/priceCalculator.js`) - Pricing logic
- **Time Utils** (`src/utils/timeUtils.js`) - Date/time formatting
- **Constants** (`src/utils/constants.js`) - Application constants

### Styling

- **Custom CSS** (`src/styles/custom.css`) - Global styles and themes
- **Component Styles** - Scoped styling within components

---

## Navigation Flow

```
Entry Point (App.jsx)
    ↓
AppRoutes.jsx (Router Setup)
    ↓
Public Routes (/login, /register)
    OR
Protected Routes (ProtectedRoute → Layout → Page)
    ↓
Layout (Navbar + Sidebar + Footer + Page Content)
    ↓
Specific Page Component with its dependencies
```

## Data Flow

```
Context Providers (Auth, Game, Booking)
    ↓
Custom Hooks (useAuth, useGame, useBooking)
    ↓
Page Components
    ↓
API Services
    ↓
Backend/Mock Data
```

This connection map helps understand how components are interconnected and makes it easier to debug issues or add new features.
