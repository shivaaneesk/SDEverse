import React from 'react';
import { Bookmark } from 'lucide-react'; 

const Bookmarks = () => {
  const themeMode = useSelector((state) => state.theme.mode); 

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
       <Bookmark size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Bookmarks</h2>
      <p className="text-gray-500 dark:text-gray-400">This feature is coming soon!</p>
    </div>
  );
};
import { useSelector } from 'react-redux';

export default Bookmarks;