import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlgorithmBySlug } from "../features/algorithm/algorithmSlice";
import Loader from "../components/Loader";
import VotingSection from "../components/code/VotingSection";
import ContributeSection from "../components/code/ContributeSection";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AlgorithmPreview from "./AlgorithmPreview";

const AlgorithmDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { algorithm, loading, error } = useSelector((state) => state.algorithm);

  useEffect(() => {
    if (slug) {
      dispatch(fetchAlgorithmBySlug(slug));
    }
  }, [slug, dispatch]);

  if (loading) return <Loader />;
  if (error)
    return (
      <p className="text-red-500">{error.message || "Something went wrong."}</p>
    );
  if (!algorithm)
    return <p className="text-center mt-10">No algorithm found.</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Forward"
        >
          <ArrowRight size={20} />
        </button>
      </div>
      <AlgorithmPreview algorithm={algorithm} />
      <VotingSection algorithm={algorithm} user={user} />
      <ContributeSection />
    </div>
  );
};

export default AlgorithmDetail;
