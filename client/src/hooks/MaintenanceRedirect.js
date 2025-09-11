import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function useMaintenanceRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get("/api/maintenance");
        const enabled = res.data?.enabled;

        const isAlwaysAllowed =
          location.pathname === "/" ||
          location.pathname.startsWith("/catalog") ||
          location.pathname === "/maintenance";

        if (enabled && !isAlwaysAllowed && !location.pathname.startsWith("/admin")) {
          navigate("/maintenance", { replace: true });
        }
      } catch (err) {
        console.error("Maintenance check failed:", err);
      }
    };

    check();
  }, [navigate, location.pathname]);
}
