import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";

const UserLayout = () => (
  <div className="flex">
    <UserSidebar />
    <main className="ml-64 p-6 w-full">
      <Outlet />
    </main>
  </div>
);

export default UserLayout;
