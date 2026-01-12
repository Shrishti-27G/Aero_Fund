import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";


import Home from "./pages/Home.jsx";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./components/stations/Dashboard.jsx";
import ProtectedRoute from "./components/authComponent/ProtectedRoute.jsx";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,   
    children: [
      
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      }

    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      visibleToasts={4}
      toastOptions={{
        className: `
      backdrop-blur-xl
      bg-white/10
      border border-white/20
      text-slate-100
      shadow-lg shadow-black/30
      rounded-2xl
    `,
        descriptionClassName: "text-slate-300 text-xs",
      }}
    />
  </Provider>
);
