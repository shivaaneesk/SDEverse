import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Loader from "./components/Loader";
import Home from "./pages/Home";
import Algorithms from "./pages/Algorithms";
import AlgorithmDetail from "./pages/AlgorithmDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useDispatch } from "react-redux";
import { getMe } from "./features/auth/authSlice";
import AdminAlgorithms from "./pages/AdminAlgorithms";
import AdminRoute from "./components/AdminRoute";
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
    element: <Layout />, // This wraps the children pages
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "algorithms",
        element: <Algorithms />,
      },
      {
        path: "algorithms/:slug",
        element: <AlgorithmDetail />,
      },
      {
        path: "admin/manage-algorithms",
        element: (
          <AdminRoute>
            <AdminAlgorithms />
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
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe(token));
    }
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
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
