import { Outlet } from "react-router-dom";
import useMaintenanceRedirect from "../hooks/MaintenanceRedirect";
import UserTopBar from "../components/UserTopBar";
import Footer from "../components/Footer"; 

export default function PublicLayout() {
  useMaintenanceRedirect();
  return (
    <>
      <UserTopBar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
