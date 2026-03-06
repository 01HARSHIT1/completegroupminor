import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./app/App.tsx";
import { DigitalTwinPage } from "./app/pages/DigitalTwinPage.tsx";
import "./styles/index.css";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/digital-twin", element: <DigitalTwinPage /> },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
  