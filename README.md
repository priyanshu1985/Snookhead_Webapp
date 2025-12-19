# Snooker Club Management System

A comprehensive web-based management system for snooker clubs built with React and Vite. This application provides complete functionality for managing tables, bookings, members, billing, and generating reports.

## ✨ Features

### 🎱 **Table Management**

- Real-time table status monitoring (Available, Occupied, Maintenance, Reserved)
- Table details with specifications and current game information
- Interactive game timer with live duration tracking
- Table booking and reservation system

### 📅 **Booking System**

- Create and manage customer bookings
- Advanced availability checking
- Booking status tracking (Pending, Confirmed, Cancelled)
- Customer information management

### 👥 **Member Management**

- Member registration and profile management
- Membership tiers (Basic, Standard, Premium) with different discount rates
- Member statistics and visit history
- Search and filter functionality

### 💳 **Billing & Payment**

- Automated bill generation with tax calculations
- Peak hour and weekend pricing
- Membership discount application
- Payment status tracking
- Print and email receipts

### 📊 **Reports & Analytics**

- Revenue reports with daily/weekly/monthly views
- Table usage statistics and utilization rates
- Customer analytics and spending patterns
- Export functionality (PDF, Excel)

### 🔐 **Authentication**

- Secure login system
- Role-based access control
- User session management

## 🏗️ Project Structure

```
src/
├── pages/               # Main application pages
│   ├── auth/           # Login and authentication
│   ├── dashboard/      # Main dashboard with statistics
│   ├── tables/         # Table management and details
│   ├── bookings/       # Booking management
│   ├── billing/        # Billing and payment tracking
│   ├── members/        # Member management
│   └── reports/        # Analytics and reports
│
├── components/         # Reusable UI components
│   ├── layout/         # Navigation, sidebar, footer
│   ├── common/         # Shared components (Loading, EmptyState)
│   ├── game/           # Game-specific components
│   ├── booking/        # Booking form components
│   └── billing/        # Bill summary components
│
├── context/           # React Context providers
│   ├── AuthContext.jsx    # Authentication state
│   ├── GameContext.jsx    # Game and table state
│   └── BookingContext.jsx # Booking system state
│
├── hooks/             # Custom React hooks
│   └── index.js       # Centralized hook exports
│
├── services/          # API and external services
│   └── api.js         # API service layer
│
├── utils/             # Utility functions
│   ├── priceCalculator.js  # Advanced pricing logic
│   ├── timeUtils.js       # Time formatting utilities
│   └── constants.js       # App constants and enums
│
├── data/              # Mock data and test fixtures
│   └── mockData.js    # Development mock data
│
├── assets/            # Static assets
│   ├── images/        # Image assets
│   └── icons/         # Icon files
│
└── styles/            # CSS and styling
    └── custom.css     # Custom CSS framework
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd snooker-web
   ```

2. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 UI Components

### Layout Components

- **Navbar** - Top navigation with user menu
- **Sidebar** - Collapsible navigation sidebar
- **Footer** - Application footer

### Game Components

- **GameCard** - Interactive table status display
- **GameTimer** - Real-time game duration tracker
- **GameStatusBadge** - Visual status indicators

### Business Components

- **BookingForm** - Complete booking creation form
- **BillSummary** - Detailed invoice display
- **PageHeader** - Consistent page headers with breadcrumbs

## 🧮 Pricing System

The application includes a sophisticated pricing calculator that handles:

- **Base hourly rates** by table type
- **Peak hour pricing** (6 PM - 10 PM) with 1.5x multiplier
- **Weekend pricing** with 1.2x multiplier
- **Membership discounts** (Basic: 5%, Standard: 10%, Premium: 15%)
- **Tax calculations** (10% default)
- **Time rounding** to nearest 15-minute intervals

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Business Settings

Modify `src/utils/constants.js` to configure:

- Operating hours
- Pricing rates
- Tax rates
- Membership tiers

## 📱 Responsive Design

The application is fully responsive with:

- Mobile-first design approach
- Collapsible sidebar navigation
- Touch-friendly interfaces
- Print-optimized layouts

## 🔍 Code Quality

The project maintains high code quality with:

- ✅ **Zero compilation errors** - All React hooks and JavaScript issues resolved
- ✅ **ESLint compliance** - Follows React best practices
- ✅ **Component separation** - Proper separation of concerns
- ✅ **Performance optimization** - Efficient state management and rendering

## 🎯 Recent Updates

### ✅ Error Resolution (December 2025)

- Fixed React Hook violations and cascading render issues
- Resolved impure function calls in render cycles
- Optimized component state management
- Fixed Fast Refresh warnings in development
- Eliminated unused imports and variables
- Improved function hoisting and dependency management

### 🏗️ Architecture Improvements

- Separated custom hooks into dedicated files
- Implemented proper context provider patterns
- Created comprehensive utility libraries
- Added extensive mock data for development
- Built custom CSS framework with theming

## 🔮 Future Enhancements

- [ ] Real-time WebSocket integration for live updates
- [ ] Mobile app development (React Native)
- [ ] Advanced reporting with charts and graphs
- [ ] Multi-language support
- [ ] Equipment rental management
- [ ] Tournament management system
- [ ] Customer loyalty program
- [ ] SMS/Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend Developer** - React.js, UI/UX Implementation
- **System Architect** - Project structure and component design

---

**Built with ❤️ for the snooker community**
