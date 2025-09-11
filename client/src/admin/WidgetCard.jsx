import {
  BarChart, LineChart, PieChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Bar, Line, Pie, Cell, ResponsiveContainer
} from "recharts";
import "./css/WidgetCard.css";

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip" style={{ background: "#fff", padding: "8px", border: "1px solid #ccc" }}>
        <p><strong>{label}</strong></p>
        {payload.map((entry, idx) => {
          if (entry.name === "_id") return null;
          return (
            <p key={idx} style={{ color: entry.color || "#333" }}>
              {entry.name}: {entry.value}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
}

function RenderCellValue({ value }) {
  const isImageUrl = (val) =>
    typeof val === "string" &&
    val.startsWith("http") &&
    val.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0].url) {
    return (
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {value.map((img, i) =>
          isImageUrl(img.url) ? (
            <a
              key={i}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                width: "40px",
                height: "40px",
                overflow: "hidden",
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            >
              <img
                src={img.url}
                alt={`img-${i}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </a>
          ) : null
        )}
      </div>
    );
  }

  if (isImageUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          width: "40px",
          height: "40px",
          overflow: "hidden",
          borderRadius: "4px",
          border: "1px solid #ccc"
        }}
      >
        <img
          src={value}
          alt="preview"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </a>
    );
  }

  return typeof value === "object" && value !== null ? (
    <pre style={{ fontSize: "0.8rem" }}>{JSON.stringify(value, null, 2)}</pre>
  ) : (
    <span>{String(value)}</span>
  );
}

export default function WidgetCard({ widget, onEdit }) {
  const { title, description, value, displayType = "table" } = widget;
  const data = Array.isArray(value) ? value : [];

  const xKey = data[0]?.title
    ? "title"
    : data[0]?.name
    ? "name"
    : Object.keys(data[0] || {}).find(k => k !== "_id") || "";

  const yKey = Object.keys(data[0] || {}).find(k => k !== xKey && k !== "_id") || "";

  const chartHeight = displayType === "pie" ? 250 : 300;

  const formatTick = (value) => {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
    return value;
  };

  return (
    <div className={`widget-card ${displayType === "table" ? "table-widget" : ""}`}>
      <div className="widget-card-header">
        <h3>{title}</h3>
        {onEdit && (
          <button className="widget-edit-button" onClick={() => onEdit(widget)}>
            Edit
          </button>
        )}
      </div>

      {description && <p className="widget-description">{description}</p>}

      {displayType === "table" && data.length > 0 && (
        <div className="widget-table-wrapper">
          <table className="widget-table">
            <thead>
              <tr>
                {Object.keys(data[0]).filter(k => k !== "_id").map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(data[0])
                    .filter((k) => k !== "_id")
                    .map((key) => (
                      <td key={key}>
                        <RenderCellValue value={row[key]} />
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {displayType === "bar" && data.length > 0 && (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={{ value: xKey, position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: yKey, angle: -90, position: "insideLeft" }} tickFormatter={formatTick} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey={yKey} fill="#1d1d1dff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {displayType === "line" && data.length > 0 && (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={{ value: xKey, position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: yKey, angle: -90, position: "insideLeft" }} tickFormatter={formatTick} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey={yKey} stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {displayType === "pie" && data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={Object.keys(data[0])[1]}
              nameKey={Object.keys(data[0])[0]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a28ee6"][index % 5]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      {data.length === 0 && (
        <p className="widget-empty">No data available for this widget.</p>
      )}
    </div>
  );
}
