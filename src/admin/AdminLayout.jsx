import './css/AdminLayout.css';
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import DashboardPage from "./DashboardPage";

export default function AdminLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="admin-layout">
      {isSidebarVisible && <Sidebar />}
      <main className="admin-main">
        <DashboardPage />
      </main>
    </div>
  );
}