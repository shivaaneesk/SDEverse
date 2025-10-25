// client/src/pages/MyNotesPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import {
  getAllMyNotesAsync,
  selectAllMyNotes,
  selectAllNotesStatus,
} from '../features/note/noteSlice';
import Loader from '../components/Loader'; // Assuming you have a Loader
import { ArrowLeft } from 'lucide-react'; // Icon for back button

const MyNotesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const notes = useSelector(selectAllMyNotes);
  const status = useSelector(selectAllNotesStatus);
  const themeMode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    // Fetch notes when the component mounts
    dispatch(getAllMyNotesAsync());
  }, [dispatch]);

  if (status === 'loading') {
    return (
        <div className={`flex items-center justify-center min-h-screen ${themeMode === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
            <Loader />
        </div>
    );
  }

  if (status === 'failed') {
      return <p className={`text-center py-10 ${themeMode === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Failed to load notes.</p>;
  }


  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${themeMode === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)} // Go back to the previous page (Profile)
        className="inline-flex items-center gap-2 mb-6 text-sm text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        My Notes
      </h1>

      {notes.length === 0 && status === 'succeeded' ? (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400 text-lg">You haven't saved any notes yet.</p>
          <Link to="/algorithms" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
              Explore Algorithms
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {note.algorithm ? (
                  <Link to={`/algorithms/${note.algorithm.slug}`} className="hover:underline block mb-2">
                    <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 truncate">
                      {note.algorithm.title || 'Algorithm Note'}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-400 mb-2 truncate">
                    Note (Algorithm details missing)
                  </h2>
                )}
                {/* Display a preview of the note content */}
                <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap text-sm overflow-hidden line-clamp-4"> {/* Use line-clamp for preview */}
                  {note.content || <span className="italic text-gray-500 dark:text-gray-400">(Empty Note)</span>}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                Last updated: {new Date(note.updatedAt).toLocaleDateString()} {/* Simplified date */}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotesPage;