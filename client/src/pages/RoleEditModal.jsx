import { useEffect, useState } from "react";

function RoleEditModal({ isOpen, onClose, onConfirm, user }) {
  const [newRole, setNewRole] = useState("user");

  useEffect(() => {
    if (user) {
      setNewRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isAdmin = newRole === "admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl text-white">
        <h2 className="text-2xl font-semibold mb-4">Change User Role</h2>
        <p className="mb-6 text-gray-300">
          Change role for <strong className="text-white">{user.fullName}</strong>
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-400 font-medium">User</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isAdmin}
              onChange={() => setNewRole(isAdmin ? "user" : "admin")}
            />
            <div className="w-14 h-8 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-indigo-600 transition-all duration-200"></div>
            <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all duration-200 peer-checked:translate-x-6"></span>
          </label>
          <span className="text-gray-400 font-medium">Admin</span>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(newRole)}
            disabled={newRole === user.role}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              newRole === user.role
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleEditModal;