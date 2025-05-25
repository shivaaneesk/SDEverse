import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";

import Layout from "./components/Layout";
import Loader from "./components/Loader";
import Home from "./pages/Home";
import Algorithms from "./pages/Algorithms";
import AlgorithmDetail from "./pages/AlgorithmDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditProposal from "./pages/EditProposal";
import AdminAlgorithms from "./pages/AdminAlgorithms";
import AdminRoute from "./components/AdminRoute";
import CreateProposal from "./pages/CreateProposal";
import MyProposals from "./pages/MyProposals";
import AdminProposalReview from "./pages/AdminProposalReview";
import Profile from "./pages/Profile";
import AdminUsersPage from "./pages/AdminUsersPage";
import { getMe } from "./features/auth/authSlice";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "profile/:username",
        element: <Profile />,
      },
      {
        path: "algorithms",
        element: <Algorithms />,
      },
      {
        path: "algorithms/:slug",
        element: <AlgorithmDetail />,
      },
      // Edit proposal for existing proposals
      {
        path: "proposals/:slug/edit",
        element: <EditProposal />,
      },

      // Create a new proposal for an algorithm (contribute)
      {
        path: "algorithms/:slug/contribute",
        element: <EditProposal />,
      },

      // Create a new proposal from scratch (no slug)
      {
        path: "proposals/new",
        element: <CreateProposal />,
      },
      {
        path: "proposals",
        element: <MyProposals />,
      },
      {
        path: "admin/manage-algorithms",
        element: (
          <AdminRoute>
            <AdminAlgorithms />
          </AdminRoute>
        ),
      },
      {
        path: "admin/proposals/review",
        element: (
          <AdminRoute>
            <AdminProposalReview />
          </AdminRoute>
        ),
      },
      {
        path: "admin/manage-users",
        element: (
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        ),
      },
    ],
  },
]);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await dispatch(getMe(token));
        } catch (error) {
          console.error("User authentication failed:", error);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [dispatch]);

  return isLoading ? (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-950">
      <Loader />
    </div>
  ) : (
    <RouterProvider router={router} />
  );
}

export default App;
