import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  getAllMyNotesAsync,
  selectAllMyNotes,
  selectAllNotesStatus,
  selectNotesCurrentPage,
  selectNotesTotalPages,
} from '../features/note/noteSlice';
import Loader from './Loader';
import Pagination from '../pages/Pagination';
import { NotebookText } from 'lucide-react';

const NOTES_PER_PAGE = 9;

const AllNotesList = () => {
  const dispatch = useDispatch();
  const notes = useSelector(selectAllMyNotes);
  const status = useSelector(selectAllNotesStatus);
  const currentPage = useSelector(selectNotesCurrentPage);
  const totalPages = useSelector(selectNotesTotalPages);
  const themeMode = useSelector((state) => state.theme.mode);
  const [requestedPage, setRequestedPage] = useState(1);

  useEffect(() => {
    dispatch(getAllMyNotesAsync({ page: requestedPage, limit: NOTES_PER_PAGE }));
  }, [dispatch, requestedPage]);

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage) {
      setRequestedPage(newPage);
    }
  };

  if (status === 'loading' && notes.length === 0) {
    return ( <div className="flex justify-center items-center py-8"><Loader /></div> );
  }
  if (status === 'failed') {
    return <p className={`text-center py-10 ${themeMode === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Failed to load notes.</p>;
  }
  if (notes.length === 0 && status === 'succeeded') {
    return (
      <div className="text-center py-10 border-t border-gray-200 dark:border-gray-700 mt-8">
         <NotebookText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">You haven't saved any notes yet.</p>
        <Link to="/algorithms" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
          Explore Algorithms and Start Noting!
        </Link>
      </div>
    );
  }
  if (status !== 'succeeded') return null;

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-400 dark:to-cyan-500">
        All My Notes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[150px]"
          >
            <div>
              {note.algorithm ? (
                <Link to={`/algorithms/${note.algorithm.slug}`} className="hover:underline block mb-2">
                  <h3 className="text-md font-semibold text-indigo-700 dark:text-indigo-400 truncate" title={note.algorithm.title}>
                    {note.algorithm.title || 'Algorithm Note'}
                  </h3>
                </Link>
              ) : (
                <h3 className="text-md font-semibold text-gray-500 dark:text-gray-400 mb-2 truncate">
                  Note (Algorithm details missing)
                </h3>
              )}
              <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap text-sm overflow-hidden line-clamp-3">
                {note.content || <span className="italic text-gray-500 dark:text-gray-400">(Empty Note)</span>}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              Last updated: {new Date(note.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
export default AllNotesList;