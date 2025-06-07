import { useEffect } from "react";
import AlgorithmInfo from "../components/code/AlgorithmInfo";
import AlgorithmMetadata from "../components/code/AlgorithmMetadata";
import CodeDisplay from "../components/code/CodeDisplay";

const AlgorithmPreview = ({ algorithm }) => {
  useEffect(() => {
  }, [algorithm]);

  if (!algorithm) return <div className="text-center text-gray-500 dark:text-gray-400 py-10">Loading algorithm preview...</div>;

  return (
    <div className="space-y-6">
      <AlgorithmInfo algorithm={algorithm} />
      <AlgorithmMetadata algorithm={algorithm} />
      <CodeDisplay algorithm={algorithm} />
    </div>
  );
};

export default AlgorithmPreview;