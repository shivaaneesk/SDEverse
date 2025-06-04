import { NavLink } from "react-router-dom";
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
  PieChart,
  ChevronRight,
  MessageSquare,
  UserPlus,
  Lock,
  FileCheck,
  BarChart,
  UserCog,
  Workflow,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/theme/themeSlice";
import { logout } from "../features/auth/authSlice";
import { useState, useEffect } from "react";
import SDEverse from "../assets/sdeverse.png";

const Sidebar = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.mode === "dark");
  const { token, user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      const isNowDesktop = window.innerWidth > 768;
      setIsDesktop(isNowDesktop);
      if (isNowDesktop) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => setIsSidebarOpen((prev) => !prev);
  const handleOverlayClick = () => setIsSidebarOpen(false);
  const handleLinkClick = () => !isDesktop && setIsSidebarOpen(false);
  const handleLogout = () => {
    dispatch(logout());
    setIsSidebarOpen(false);
  };

  const colorSchemes = {
    home: {
      bg: "bg-blue-50/80 dark:bg-blue-900/30",
      hover: "hover:bg-blue-100 dark:hover:bg-blue-900/40",
      active: "bg-gradient-to-r from-blue-500 to-indigo-600",
      border: "border-l-blue-500",
    },
    admin: {
      bg: "bg-pink-50/80 dark:bg-pink-900/30",
      hover: "hover:bg-pink-100 dark:hover:bg-pink-900/40",
      active: "bg-gradient-to-r from-pink-500 to-rose-600",
      border: "border-l-pink-500",
    },
    algorithms: {
      bg: "bg-purple-50/80 dark:bg-purple-900/30",
      hover: "hover:bg-purple-100 dark:hover:bg-purple-900/40",
      active: "bg-gradient-to-r from-purple-500 to-violet-600",
      border: "border-l-purple-500",
    },
    proposals: {
      bg: "bg-green-50/80 dark:bg-green-900/30",
      hover: "hover:bg-green-100 dark:hover:bg-green-900/40",
      active: "bg-gradient-to-r from-green-500 to-emerald-600",
      border: "border-l-green-500",
    },
    analytics: {
      bg: "bg-cyan-50/80 dark:bg-cyan-900/30",
      hover: "hover:bg-cyan-100 dark:hover:bg-cyan-900/40",
      active: "bg-gradient-to-r from-cyan-500 to-sky-600",
      border: "border-l-cyan-500",
    },
    feedback: {
      bg: "bg-indigo-50/80 dark:bg-indigo-900/30",
      hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900/40",
      active: "bg-gradient-to-r from-indigo-500 to-blue-600",
      border: "border-l-indigo-500",
    },
    submit: {
      bg: "bg-teal-50/80 dark:bg-teal-900/30",
      hover: "hover:bg-teal-100 dark:hover:bg-teal-900/40",
      active: "bg-gradient-to-r from-teal-500 to-green-600",
      border: "border-l-teal-500",
    },
  };

  const getNavItemClass = (section, isActive) => {
    const scheme = colorSchemes[section] || colorSchemes.home;
    return `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
      isActive
        ? `${scheme.active} text-white shadow-lg`
        : `text-gray-700 dark:text-gray-300 ${scheme.bg} ${scheme.hover} ${scheme.border} border-l-4`
    }`;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleSidebarToggle}
        className="fixed z-40 p-3 ml-4 mt-4 rounded-full bg-white dark:bg-gray-800 shadow-lg md:hidden transition-all hover:scale-105 backdrop-blur-sm"
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? (
          <X className="text-indigo-600 dark:text-indigo-300" size={24} />
        ) : (
          <Menu className="text-indigo-600 dark:text-indigo-300" size={24} />
        )}
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-800 shadow-xl z-40 transform transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:shadow-none`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col h-full p-5">
          {/* Header */}
          <div className="pb-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                <img
                  src={SDEverse}
                  alt="SDEverse Logo"
                  className="w-8 h-8"
                />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                SDEverse
              </h2>
            </div>
            <button
              onClick={handleSidebarToggle}
              className="md:hidden p-2 rounded-lg bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600 backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 space-y-2 overflow-y-auto mobile-scroll">
            <NavLink
              to="/"
              end
              className={({ isActive }) => getNavItemClass("home", isActive)}
              onClick={handleLinkClick}
            >
              <Home size={20} className="min-w-[20px]" />
              <span className="truncate">Home</span>
              <ChevronRight className="ml-auto opacity-70" size={16} />
            </NavLink>
             <NavLink
                  to="/algorithms"
                  className={({ isActive }) => getNavItemClass("algorithms", isActive)}
                  onClick={handleLinkClick}
                >
                  <Workflow size={20} className="min-w-[20px]" />
                  <span className="truncate">Algorithms</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
            {/* Admin Section */}
            {token && user?.role === "admin" && (
              <>
                <div className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Admin Panel
                </div>
                <NavLink
                  to="/admin/manage-users"
                  className={({ isActive }) => getNavItemClass("admin", isActive)}
                  onClick={handleLinkClick}
                >
                  <UserCog size={20} className="min-w-[20px]" />
                  <span className="truncate">Manage Users</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
                <NavLink
                  to="/admin/manage-algorithms"
                  className={({ isActive }) => getNavItemClass("algorithms", isActive)}
                  onClick={handleLinkClick}
                >
                  <ClipboardList size={20} className="min-w-[20px]" />
                  <span className="truncate">Manage Algorithms</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
                <NavLink
                  to="/admin/proposals/review"
                  className={({ isActive }) => getNavItemClass("proposals", isActive)}
                  onClick={handleLinkClick}
                >
                  <FileCheck size={20} className="min-w-[20px]" />
                  <span className="truncate">Review Proposals</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
                <NavLink
                  to="/admin/analytics"
                  className={({ isActive }) => getNavItemClass("analytics", isActive)}
                  onClick={handleLinkClick}
                >
                  <BarChart size={20} className="min-w-[20px]" />
                  <span className="truncate">Analytics Dashboard</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
              </>
            )}

            {/* User Section */}
            {token && user?.role !== "admin" && (
              <>
                <div className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  My Workspace
                </div>
                <NavLink
                  to="/proposals"
                  end
                  className={({ isActive }) => getNavItemClass("proposals", isActive)}
                  onClick={handleLinkClick}
                >
                  <ClipboardList size={20} className="min-w-[20px]" />
                  <span className="truncate">My Proposals</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
                <NavLink
                  to="/proposals/new"
                  className={({ isActive }) => getNavItemClass("submit", isActive)}
                  onClick={handleLinkClick}
                >
                  <FilePlus size={20} className="min-w-[20px]" />
                  <span className="truncate">Submit Proposal</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
                <NavLink
                  to="/feedback"
                  className={({ isActive }) => getNavItemClass("feedback", isActive)}
                  onClick={handleLinkClick}
                >
                  <MessageSquare size={20} className="min-w-[20px]" />
                  <span className="truncate">Feedback</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
              </>
            )}

            {/* Guest Section */}
            {!token && (
              <>
                <div className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Account
                </div>
                <NavLink
                  to="/login"
                  className={({ isActive }) => getNavItemClass("home", isActive)}
                  onClick={handleLinkClick}
                >
                  <Lock size={20} className="min-w-[20px]" />
                  <span className="truncate">Login</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => getNavItemClass("home", isActive)}
                  onClick={handleLinkClick}
                >
                  <UserPlus size={20} className="min-w-[20px]" />
                  <span className="truncate">Register</span>
                  <ChevronRight className="ml-auto opacity-70" size={16} />
                </NavLink>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
            >
              {darkMode ? (
                <Sun className="text-amber-500" size={20} />
              ) : (
                <Moon className="text-indigo-500" size={20} />
              )}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors backdrop-blur-sm"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
