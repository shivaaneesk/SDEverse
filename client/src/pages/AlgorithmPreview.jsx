import { useEffect } from "react";
import AlgorithmInfo from "../components/code/AlgorithmInfo";
import AlgorithmMetadata from "../components/code/AlgorithmMetadata";
import CodeDisplay from "../components/code/CodeDisplay";
const AlgorithmPreview = ({ algorithm }) => {
  useEffect(() => {
    console.log("AlgorithmPreview received new algorithm:", algorithm);
  }, [algorithm]);
  if (!algorithm) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white py-6">
        {algorithm.title}
      </h1>

      <AlgorithmInfo algorithm={algorithm} />
      <AlgorithmMetadata algorithm={algorithm} />
      <CodeDisplay algorithm={algorithm} />
    </div>
  );
};

export default AlgorithmPreview;
