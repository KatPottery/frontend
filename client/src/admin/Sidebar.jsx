import './css/Sidebar.css';
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar() {
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);

  useEffect(() => {
    axios.get("/api/maintenance").then(res => {
      setMaintenanceEnabled(res.data.enabled);
    });
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Katherine</h2>

      <div className="sidebar-content">
        <ul className="sidebar-nav">
          <li className={isActive("/admin") && !isActive("/admin/products") && !isActive("/admin/upload") ? "active" : ""}>
            <Link to="/admin">Dashboard</Link>
          </li>
          <li className={isActive("/admin/reports") ? "active" : ""}>
            <Link to="/admin/reports">Reports</Link>
          </li>
          <li className={isActive("/admin/products") ? "active" : ""}>
            <Link to="/admin/products">Manage Shop</Link>
          </li>
          <li className={isActive("/admin/catalog") ? "active" : ""}>
            <Link to="/admin/catalog">Manage Catalog</Link>
          </li>
        </ul>

        <button
          className="sidebar-button"
          onClick={() => setShowConfirm(true)}
        >
          {maintenanceEnabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
        </button>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p>
              Are you sure you want to{" "}
              {maintenanceEnabled ? "disable" : "enable"} maintenance mode?
            </p>
            <button onClick={async () => {
              try {
                const newStatus = !maintenanceEnabled;
                await axios.put("/api/maintenance", { enabled: newStatus });
                setMaintenanceEnabled(newStatus);
                alert(`Maintenance mode ${newStatus ? "enabled" : "disabled"} successfully.`);
              } catch (err) {
                alert("Failed to update maintenance mode.");
                console.error(err);
              } finally {
                setShowConfirm(false);
              }
            }}>
              Yes, {maintenanceEnabled ? "Disable" : "Enable"}
            </button>
            <button onClick={() => setShowConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
