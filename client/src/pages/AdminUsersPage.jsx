import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  removeUser,
  changeUserRole,
} from "../features/user/userSlice";
import {
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaUserCircle,
  FaEnvelope,
  FaUserTag,
  FaMapMarkerAlt,
  FaLink,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users = [], status, error, totalPages = 1 } = useSelector((state) => state.user);

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState([]);
  const [roleEdits, setRoleEdits] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      getAllUsers({
        search: searchQuery,
        role: roleFilter || undefined,
        page: currentPage,
        limit: 10,
      })
    );
  }, [dispatch, searchQuery, roleFilter, currentPage]);

  const toggleExpand = (id) => {
    setExpandedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await dispatch(removeUser(id)).unwrap();
      toast.success("User deleted successfully.");
    } catch (err) {
      toast.error(`Failed to delete user: ${err.message || err}`);
    }
  };

  const handleRoleChangeLocal = (id, newRole) => {
    setRoleEdits((prev) => ({ ...prev, [id]: newRole }));
  };

  const handleRoleSave = async (id) => {
    const newRole = roleEdits[id];
    if (!newRole) return;
    try {
      await dispatch(changeUserRole({ id, role: newRole })).unwrap();
      toast.success("User role updated.");
      setRoleEdits((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      toast.error(`Failed to update role: ${err.message || err}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center text-indigo-600 dark:text-indigo-400">
        User Management
      </h1>

      {/* Search and Filter */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchQuery(input);
          setCurrentPage(1);
        }}
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-10"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search users by name, email, or username"
          className="flex-grow px-4 py-3 rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-500
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-md"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full lg:w-56 px-4 py-3 rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-500
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <button
          type="submit"
          className="w-full lg:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
                     text-white font-semibold shadow-lg transition"
        >
          Search
        </button>
      </form>

      {/* Status and Error */}
      {status.fetchUsers === "loading" && (
        <p className="text-center text-indigo-500 font-medium animate-pulse">Loading users...</p>
      )}
      {error.fetchUsers && (
        <p className="text-center text-red-500 font-semibold">{error.fetchUsers}</p>
      )}

      {/* Users List */}
      <div className="grid gap-8">
        {users.length === 0 && status.fetchUsers !== "loading" ? (
          <p className="text-center text-indigo-400 font-medium">No users found.</p>
        ) : (
          users.map((user) => {
            const isExpanded = expandedUserIds.includes(user._id);
            const pendingRole = roleEdits[user._id] ?? user.role ?? "user";

            return (
              <div
                key={user._id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">{user.fullName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{user.username} &middot; {user.email}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center gap-4 text-gray-600 dark:text-gray-300">
                    <button onClick={() => toggleExpand(user._id)}>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="hover:text-red-600">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-3"><FaUserCircle /><span><strong>Name:</strong> {user.fullName}</span></div>
                    <div className="flex items-center space-x-3"><FaUserTag /><span><strong>Username:</strong> {user.username}</span></div>
                    <div className="flex items-center space-x-3"><FaEnvelope /><span><strong>Email:</strong> {user.email}</span></div>
                    <div className="flex items-center space-x-3"><FaMapMarkerAlt /><span><strong>Location:</strong> {user.location || "N/A"}</span></div>
                    <div className="flex items-center space-x-3"><FaUserTag /><span><strong>Role:</strong> {user.role}</span></div>
                    <div className="flex items-center space-x-3"><FaLink /><span><strong>Website:</strong> {user.website ? <a href={user.website} className="underline" target="_blank" rel="noreferrer">Portfolio</a> : "N/A"}</span></div>
                    <div className="flex items-center space-x-3 col-span-full"><FaInfoCircle /><span><strong>Bio:</strong> {user.bio || "N/A"}</span></div>

                    <div className="col-span-full mt-4">
                      <label className="block mb-2 font-semibold">Change Role</label>
                      <div className="flex items-center gap-3">
                        <select
                          value={pendingRole}
                          onChange={(e) => handleRoleChangeLocal(user._id, e.target.value)}
                          className="rounded-xl px-4 py-2 border border-indigo-300 bg-white dark:bg-gray-800 dark:text-indigo-100"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        {pendingRole !== user.role && (
                          <button
                            onClick={() => handleRoleSave(user._id)}
                            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center items-center space-x-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-6 py-3 rounded-full bg-indigo-100 text-indigo-700 font-semibold
                     hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="font-semibold text-indigo-600 dark:text-indigo-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="px-6 py-3 rounded-full bg-indigo-100 text-indigo-700 font-semibold
                     hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminUsersPage;
