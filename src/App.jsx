import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/AppRoutes";
import { LayoutProvider } from "./context/LayoutContext";
import { AuthProvider } from "./context/AuthContext";
import GlobalAutoRelease from "./components/common/GlobalAutoRelease";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutProvider>
          <GlobalAutoRelease />
          <AppRoutes />
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
