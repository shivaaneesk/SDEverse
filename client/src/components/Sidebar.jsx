import { Link } from "react-router-dom";
import {
  Home,
  Users,
  ClipboardList,
  FilePlus,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Settings,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/theme/themeSlice";
import { logout } from "../features/auth/authSlice";
import { useState } from "react";

const Sidebar = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.mode === "dark");
  const { token, user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => setIsSidebarOpen((prev) => !prev);
  const handleOverlayClick = () => setIsSidebarOpen(false);
  const handleLinkClick = () => setIsSidebarOpen(false);
  const handleLogout = () => {
    dispatch(logout());
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={handleSidebarToggle}
          className="p-2 rounded bg-white dark:bg-gray-800 shadow"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:block`}
        aria-label="Sidebar Navigation"
      >
        <div className="p-6 flex flex-col gap-6 h-full relative">
          <button
            className="md:hidden absolute top-4 right-4 p-2 rounded bg-gray-200 dark:bg-gray-700"
            onClick={handleSidebarToggle}
            aria-label="Close Sidebar"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-blue-600 dark:text-white">
            SDEverse
          </h2>

          {/* Navigation */}
          <nav className="flex flex-col gap-4 text-gray-700 dark:text-gray-200">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-2 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-white transition-colors"
            >
              <Home size={20} /> Home
            </Link>

            {/* Admin Links */}
            {token && user?.role === "admin" && (
              <>
                <Link
                  to={`/profile/${user.username}`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-yellow-100 dark:hover:bg-yellow-700 hover:text-yellow-700 dark:hover:text-white transition-colors"
                >
                  <User size={20} /> Profile
                </Link>
                <Link
                  to="/admin/manage-users"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-pink-100 dark:hover:bg-pink-700 hover:text-pink-700 dark:hover:text-white transition-colors"
                >
                  <Users size={20} /> Manage Users
                </Link>
                <Link
                  to="/admin/manage-algorithms"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-purple-100 dark:hover:bg-purple-700 hover:text-purple-700 dark:hover:text-white transition-colors"
                >
                  <ClipboardList size={20} /> Manage Algorithms
                </Link>
                <Link
                  to="/admin/proposals/review"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-green-100 dark:hover:bg-green-700 hover:text-green-700 dark:hover:text-white transition-colors"
                >
                  <ClipboardList size={20} /> Review Proposals
                </Link>
              </>
            )}

            {/* User Links */}
            {token && user?.role !== "admin" && (
              <>
                <Link
                  to={`/profile/${user.username}`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-yellow-100 dark:hover:bg-yellow-700 hover:text-yellow-700 dark:hover:text-white transition-colors"
                >
                  <User size={20} /> Profile
                </Link>
                <Link
                  to="/proposals"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-green-100 dark:hover:bg-green-700 hover:text-green-700 dark:hover:text-white transition-colors"
                >
                  <ClipboardList size={20} /> My Proposals
                </Link>
                <Link
                  to="/proposals/new"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-purple-100 dark:hover:bg-purple-700 hover:text-purple-700 dark:hover:text-white transition-colors"
                >
                  <FilePlus size={20} /> Submit Proposal
                </Link>
              </>
            )}

            {/* Guest Links */}
            {!token && (
              <>
                <Link
                  to="/login"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-white transition-colors"
                >
                  <Users size={20} /> Login
                </Link>
                <Link
                  to="/register"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-white transition-colors"
                >
                  <Users size={20} /> Register
                </Link>
              </>
            )}
          </nav>

          {/* Footer: Theme Toggle & Logout */}
          <div className="mt-auto space-y-4 pt-6 border-t border-gray-300 dark:border-gray-700">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex items-center gap-2 text-sm"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm"
              >
                <LogOut size={20} /> Logout
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
