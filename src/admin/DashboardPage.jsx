import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './css/DashboardPage.css';
import StatCard from "./StatCard";
import WidgetCard from "./WidgetCard";
import WidgetModal from "./WidgetModal";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const [customCards, setCustomCards] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  useEffect(() => {
  axios.get("/api/admin/widgets").then(async res => {
    const widgets = res.data;

    const widgetsWithLiveData = await Promise.all(
      widgets.map(async (widget) => {
        try {
          const response = await axios.post("/api/admin/raw-query", widget.query);
          return {
            ...widget,
            value: Array.isArray(response.data.data) ? response.data.data : []
          };
        } catch (e) {
          console.error("Failed to run query for widget:", widget.title, e);
          return { ...widget, value: [] };
        }
      })
    );

    setCustomCards(widgetsWithLiveData);
  });
}, []);

  useEffect(() => {
    axios.get("/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to fetch stats", err));
  }, []);

  const handleWidgetAdd = (widget) => {
    setCustomCards(prev => [...prev, widget]);
  };

  const handleWidgetUpdate = (updated) => {
    setCustomCards(prev =>
      prev.map(w => w._id === editingWidget._id ? { ...w, ...updated } : w)
    );
    setEditingWidget(null);
  };

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="dashboard-wrapper">
      <section>
        <h1 className="dashboard-heading">Admin Dashboard</h1>
        <div className="stat-grid">
          <StatCard
            label="Page Views (Monthly)"
            value={stats.pageViews.toLocaleString()}
            onClick={() => navigate("/admin/pageviews")}
          />
          <StatCard
            label="Income (Monthly)"
            value={`$${(stats.totalIncome).toFixed(2)}`}
            onClick={() => navigate("/admin/income")}
          />
          <StatCard
            label="Subscribers"
            value={stats.subscribers.toLocaleString()}
            onClick={() => navigate("/admin/subscribers")}
          />
          <StatCard
            label="Active Carts (Monthly)"
            value={stats.carts.toLocaleString()}
            onClick={() => navigate("/admin/carts")}
          />
        </div>
      </section>

      <div className="dashboard-widget-form">
        <button onClick={() => setModalOpen(true)}>➕ Add Widget</button>
      </div>

      <section className="card-section">
        {customCards.map(widget => (
          <WidgetCard key={widget._id} widget={widget} onEdit={() => setEditingWidget(widget)} />
        ))}
      </section>

      {/* Add Modal */}
      <WidgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddWidget={handleWidgetAdd}
      />

      {/* Edit Modal */}
      <WidgetModal
        isOpen={!!editingWidget}
        onClose={() => setEditingWidget(null)}
        onUpdateWidget={handleWidgetUpdate}
        initialData={editingWidget}
        editMode={true}
      />
    </div>
  );
}
