import { useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { selectCurrentUser } from "../features/auth/authSlice";
import DataStructureInfo from "../components/code/DataStructureInfo";
import DataStructureMetadata from "../components/code/DataStructureMetadata";
import DataStructureOperations from "../components/code/DataStructureOperations";

const DataStructurePreview = ({ dataStructure }) => {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    console.log("DataStructure updated:", dataStructure);
  }, [dataStructure]);

  if (!dataStructure) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center text-gray-600 dark:text-gray-400 text-lg py-12 px-4"
      >
        Loading data structure preview...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 space-y-6">
        <DataStructureInfo dataStructure={dataStructure} isAdmin={isAdmin} />
        <DataStructureMetadata dataStructure={dataStructure} isAdmin={isAdmin} />
        <DataStructureOperations dataStructure={dataStructure} isAdmin={isAdmin} />
      </div>
    </motion.div>
  );
};

export default DataStructurePreview;