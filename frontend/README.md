# Snooker Club Management - Frontend

React + Vite frontend application for the Snooker Club Management System.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **React 18** - UI library with modern hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management
- **Custom CSS** - Styled with CSS variables and utility classes

## 📦 Dependencies

### Core Dependencies

- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Routing

### Development Dependencies

- `@vitejs/plugin-react` - Vite React plugin with Fast Refresh
- `eslint` - Code linting
- `vite` - Build tool

## 🏗️ Architecture

### State Management

- **React Context** - Used for global state (Auth, Game, Booking)
- **useState/useEffect** - Local component state
- **Custom Hooks** - Shared logic abstraction

### Component Structure

- **Pages** - Route-level components
- **Components** - Reusable UI components
- **Context** - Global state providers
- **Hooks** - Custom hook utilities

### Styling Approach

- **CSS Variables** - Consistent theming
- **Utility Classes** - Common styling patterns
- **Component-specific CSS** - Scoped styling
- **Responsive Design** - Mobile-first approach

## 🎨 Design System

### Colors

- Primary: Green palette for snooker theme
- Status colors for different states
- Semantic colors for success/warning/error states

### Typography

- Inter font family
- Consistent font scales
- Proper line heights

### Spacing

- 8px grid system
- Consistent padding/margins
- Responsive breakpoints

## 🧪 Development Guidelines

### Code Quality

- All React hooks follow Rules of Hooks
- No unused imports or variables
- Proper component separation
- Consistent naming conventions

### Performance

- Components are optimized for re-rendering
- State is properly managed to avoid cascading updates
- Images and assets are optimized

### Accessibility

- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- Color contrast compliance

## 📱 Responsive Breakpoints

```css
/* Mobile first approach */
@media (max-width: 768px) {
  /* Mobile */
}
@media (min-width: 769px) {
  /* Tablet */
}
@media (min-width: 1024px) {
  /* Desktop */
}
```

## 🔧 Configuration

### Vite Configuration

- React plugin with Fast Refresh
- Development server proxy (if needed)
- Build optimizations

### ESLint Rules

- React recommended rules
- Hooks rules enabled
- No unused variables
- Import/export consistency

## 🐛 Troubleshooting

### Common Issues

**Development server won't start:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Build errors:**

- Check for TypeScript errors
- Verify all imports are correct
- Run `npm run lint` to check code quality

**Hot reload not working:**

- Check if Fast Refresh is enabled
- Verify component naming (must start with capital letter)
- Check browser console for errors

## 📄 File Organization

```
src/
├── components/     # Reusable components
├── pages/         # Route components
├── context/       # React Context providers
├── hooks/         # Custom hooks
├── services/      # API services
├── utils/         # Utility functions
├── data/          # Mock data
├── assets/        # Static assets
├── styles/        # CSS files
├── App.jsx        # Main app component
└── main.jsx       # Entry point
```

## 🔮 Future Improvements

- [ ] Add TypeScript for better type safety
- [ ] Implement unit testing with Vitest
- [ ] Add Storybook for component documentation
- [ ] Optimize bundle size with code splitting
- [ ] Add Progressive Web App features
- [ ] Implement error boundaries
- [ ] Add performance monitoring

---

For more details, see the main project README.
