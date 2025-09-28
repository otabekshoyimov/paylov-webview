import { Outlet } from "react-router";

export function Root() {
  return (
    <div className="p-8">
      {/* <h1 className="bg-green-300">root</h1> */}
      <Outlet />
    </div>
  );
}
