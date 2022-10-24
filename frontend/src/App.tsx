import React, { ChangeEvent, useCallback, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Shop } from "./Shop";
import { PixelChooser } from "./PixelChooser";
import { Onboarding } from "./Onboarding";

const router = createBrowserRouter([
  {
    path: "/shop/:color",
    element: <Shop />,
  },
  {
    path: "/colorpicker",
    element: <PixelChooser />,
  },
  {
    path: "/",
    element: <Onboarding />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace={true} />,
  },
]);

const App: React.FC<Record<string, never>> = React.memo(function App() {
  return <RouterProvider router={router} />;
});

export default App;
