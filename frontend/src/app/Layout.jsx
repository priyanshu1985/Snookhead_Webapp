import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-vh-100 bg-light">
      <main className="p-3">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
