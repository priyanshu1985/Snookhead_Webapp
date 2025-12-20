import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/AppRoutes";
import { LayoutProvider } from "./context/LayoutContext";

const App = () => {
  return (
    <BrowserRouter>
      <LayoutProvider>
        <AppRoutes />
      </LayoutProvider>
    </BrowserRouter>
  );
};

export default App;
