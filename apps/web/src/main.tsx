import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import App from "./App";

import Login from "./pages/Login";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import Orders from "./pages/Orders";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          { index: true, element: <Patients /> },
          { path: "patients", element: <Patients /> },
          { path: "patients/new", element: <NewPatient /> },
          { path: "orders", element: <Orders /> }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
