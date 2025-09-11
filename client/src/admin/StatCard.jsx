import './css/StatCard.css';

export default function StatCard({ label, value, change, onClick }) {
  const changeClass = change?.startsWith("-") ? "down" : "up";

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value}</h2>
      {change && <p className={`stat-change ${changeClass}`}>{change}</p>}
    </div>
  );
}

