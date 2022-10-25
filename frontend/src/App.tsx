import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { Logo } from "./Logo";
import { Onboarding } from "./Onboarding";
import { PixelChooser } from "./PixelChooser";
import { Shop } from "./Shop";

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
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex self-center w-1/3 justify-around p-5">
        <Logo />
      </div>
      <RouterProvider router={router} />
    </div>
  );
});

export default App;
