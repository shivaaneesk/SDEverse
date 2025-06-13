import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Sidebar />
      <div
        className="flex flex-col flex-1 md:ml-64"
        style={{ overflowX: "hidden" }}
      >
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        {isHomePage && (
          <div className="p-4 md:p-6 lg:p-8">
            <Footer />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
