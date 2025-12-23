import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Role hierarchy and allowed routes
const roleConfig = {
  owner: {
    // Owner has access to all pages
    allowedRoutes: "*",
    defaultRoute: "/",
  },
  admin: {
    // Admin (founder) - skip for now, redirect to a placeholder
    allowedRoutes: [],
    defaultRoute: "/",
  },
  staff: {
    // Staff only has access to Active Orders
    allowedRoutes: ["/staff-orders"],
    defaultRoute: "/staff-orders",
  },
};

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role?.toLowerCase() || "staff";

  // If allowedRoles is empty, allow all authenticated users
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // Redirect to user's default route based on their role
  const config = roleConfig[userRole] || roleConfig.staff;

  // Prevent infinite redirect loop - if already at default route, show access denied
  if (location.pathname === config.defaultRoute) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: "16px",
        }}
      >
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return <Navigate to={config.defaultRoute} replace />;
};

// Helper function to check if a role has access to a specific route
export const hasRouteAccess = (role, route) => {
  const userRole = role?.toLowerCase() || "staff";
  const config = roleConfig[userRole];

  if (!config) return false;
  if (config.allowedRoutes === "*") return true;
  return config.allowedRoutes.some((r) => route.startsWith(r));
};

// Get default route for a role
export const getDefaultRoute = (role) => {
  const userRole = role?.toLowerCase() || "staff";
  const config = roleConfig[userRole] || roleConfig.staff;
  return config.defaultRoute;
};

export default RoleProtectedRoute;
