import { createContext, useState } from "react";

export const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <LayoutContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
        isSidebarCollapsed,
        toggleSidebarCollapse
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
