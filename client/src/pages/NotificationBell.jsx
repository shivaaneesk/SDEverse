import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
  markReadLocally,
} from "../features/notification/notificationSlice";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading } = useSelector((state) => state.notification);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    dispatch(fetchNotifications());

    const intervalId = setInterval(() => {
      dispatch(fetchNotifications());
    }, 10000); // every 10 seconds

    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClickNotification = (id, link) => {
    dispatch(markReadLocally(id));
    dispatch(markAsRead(id));
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-lg text-gray-800 dark:text-gray-200">
            Notifications
          </div>
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No new notifications.
            </div>
          ) : (
            <ul>
              {notifications.map((note) => (
                <li
                  key={note._id}
                  className={`cursor-pointer px-4 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 border-b dark:border-gray-700 ${
                    note.read
                      ? "text-gray-500"
                      : "font-semibold text-indigo-700"
                  }`}
                  onClick={() => handleClickNotification(note._id, note.link)}
                >
                  <div className="text-sm">{note.message}</div>
                  {note.preview && (
                    <div className="text-xs mt-1 text-gray-600 dark:text-gray-400 line-clamp-2">
                      {note.preview}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
