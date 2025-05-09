import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {}, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Welcome to SDEverse 🚀
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          Your one-stop hub to master DSA, ace SDE interviews, and contribute to
          a growing community of coders.
        </p>

        <Link to="/algorithms" className="flex justify-center">
          <Button className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 px-6 py-3">
            <Sparkles className="w-5 h-5" />
            Explore Algorithms
          </Button>
        </Link>
      </div>

      {/* Features Section */}
      <section className="mt-20 bg-white dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-12">
            What We Offer
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Master DSA",
                description:
                  "Learn data structures and algorithms with in-depth explanations, coding examples, and challenges.",
              },
              {
                title: "Ace SDE Interviews",
                description:
                  "Prepare for interviews with structured resources, practice questions, and mock interviews.",
              },
              {
                title: "Contribute to the Community",
                description:
                  "Share your knowledge by adding algorithms and solutions to help others grow.",
              },
            ].map(({ title, description }) => (
              <div
                key={title}
                className="p-6 bg-indigo-100 dark:bg-indigo-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
                  {title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mt-20 bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
            About SDEverse
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            SDEverse is built to help students and professionals excel in their
            coding journey. Whether you're preparing for interviews, learning
            new concepts, or contributing to open source, we support you. Expect
            new algorithms, challenges, and coding resources added regularly.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-20 text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
          Join the SDEverse Community
        </h2>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Ready to start your coding journey? Join us today and become part of
          an ever-growing community of developers and problem solvers!
        </p>
        <Link to="/register">
          <Button className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg transform transition-transform duration-300 hover:bg-indigo-700 hover:scale-105">
            Sign Up Now
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
