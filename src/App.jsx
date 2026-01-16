import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/AppRoutes";
import { LayoutProvider } from "./context/LayoutContext";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutProvider>
          <AppRoutes />
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
