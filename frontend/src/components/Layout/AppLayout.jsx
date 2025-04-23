import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const AppLayout = () => (
  <div>
    <Navbar />
    <Outlet />
  </div>
);

export default AppLayout;
