import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  isRouteErrorResponse,
  RouterProvider,
  useRouteError,
} from "react-router";
import "./index.css";
import { Root } from "./root.tsx";
import { BottoSheet, indexAction } from "./index.tsx";
import { LocationAction, LocationPage } from "./pages/location/location.tsx";
import { ShopPage } from "./pages/shop/shop.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <BottoSheet />,
        action: indexAction,
      },
      {
        path: "/location",
        element: <LocationPage />,
        action: LocationAction,
      },
      {
        path: "/shop",
        element: <ShopPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router}></RouterProvider>,
);

export function ErrorBoundary() {
  const error = useRouteError();
  console.error({ error });
  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-20">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="p-20">
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
