import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getNoteAsync,
  setNoteAsync,
  setCurrentNoteContent,
  selectCurrentNoteContent, 
  selectNoteStatus,
  selectNoteSaveStatus,
  clearCurrentNote, 
} from '../features/note/noteSlice';
import { Loader2, Save } from 'lucide-react';

const NotesSection = ({ algorithmId }) => {
  const dispatch = useDispatch();

  const noteContent = useSelector(selectCurrentNoteContent);
  const noteStatus = useSelector(selectNoteStatus);
  const saveStatus = useSelector(selectNoteSaveStatus);
  const userInfo = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (userInfo && algorithmId) {
      dispatch(getNoteAsync(algorithmId));
    }
    return () => {
        dispatch(clearCurrentNote());
    }
  }, [userInfo, algorithmId, dispatch]);

  const handleSave = () => {
    dispatch(setNoteAsync({ algorithmId, content: noteContent }));
  };

  const handleTextChange = (e) => {
    dispatch(setCurrentNoteContent(e.target.value)); 
  };

  if (!userInfo) {
    return (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
            Please log in to save personal notes.
        </div>
    );
  }

  const isLoading = noteStatus === 'loading';
  const isSaving = saveStatus === 'loading';

  return (
    <div className="mt-0 flex flex-col h-full">
      {isLoading ? (
        <div className="flex items-center justify-center flex-grow">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
        </div>
      ) : (
        <>
          <textarea
            value={noteContent}
            onChange={handleTextChange}
            placeholder="Type your notes here... they are only visible to you."
            className="w-full flex-grow min-h-[10rem] p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 mb-3"
            aria-label="Personal notes for this algorithm"
          />
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading} 
            className="mt-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition duration-200 shadow-md flex-shrink-0" // Prevent button shrinking
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </>
      )}
    </div>
  );
};

export default NotesSection;