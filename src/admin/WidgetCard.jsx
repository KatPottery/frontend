import {
  BarChart, LineChart, PieChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Bar, Line, Pie, Cell, ResponsiveContainer
} from "recharts";
import "./css/WidgetCard.css";

function CustomTooltip({ active, payload, label }) {
  const rows = Array.isArray(payload) ? payload : [];
  if (active && rows.length) {
    return (
      <div className="custom-tooltip" style={{ background: "#fff", padding: "8px", border: "1px solid #ccc" }}>
        <p><strong>{label}</strong></p>
        {rows.map((entry, idx) => {
          if (entry?.name === "_id") return null;
          return (
            <p key={idx} style={{ color: entry?.color || "#333" }}>
              {entry?.name}: {entry?.value}
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
    (val.startsWith("http") || val.startsWith("/")) &&
    val.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i);

  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0]?.url) {
    return (
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {value.map((img, i) =>
          isImageUrl(img?.url) ? (
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
    <span>{String(value ?? "")}</span>
  );
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export default function WidgetCard({ widget, onEdit }) {
  const { title, description, value, displayType = "table" } = widget || {};
  const dataRaw = Array.isArray(value) ? value : [];

  // only keep rows that are objects (recharts + table assume object rows)
  const data = dataRaw.filter(isPlainObject);

  const first = data[0] || null;

  const keys = first ? Object.keys(first).filter((k) => k !== "_id") : [];
  const xKey =
    (first?.title && "title") ||
    (first?.name && "name") ||
    keys[0] ||
    "";

  const yKey = keys.find((k) => k !== xKey) || "";

  const chartHeight = displayType === "pie" ? 250 : 300;

  const formatTick = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v ?? "");
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n;
  };

  // pie needs at least 2 keys
  const pieNameKey = keys[0] || "";
  const pieDataKey = keys[1] || "";

  const canRenderTable = displayType === "table" && data.length > 0 && keys.length > 0;
  const canRenderXY = (displayType === "bar" || displayType === "line") && data.length > 0 && xKey && yKey;
  const canRenderPie = displayType === "pie" && data.length > 0 && pieNameKey && pieDataKey;

  return (
    <div className={`widget-card ${displayType === "table" ? "table-widget" : ""}`}>
      <div className="widget-card-header">
        <h3>{title || "Widget"}</h3>
        {onEdit && (
          <button className="widget-edit-button" onClick={() => onEdit(widget)}>
            Edit
          </button>
        )}
      </div>

      {description && <p className="widget-description">{description}</p>}

      {canRenderTable && (
        <div className="widget-table-wrapper">
          <table className="widget-table">
            <thead>
              <tr>
                {keys.map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {keys.map((key) => (
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

      {displayType === "bar" && canRenderXY && (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis tickFormatter={formatTick} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey={yKey} fill="#1d1d1dff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {displayType === "line" && canRenderXY && (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis tickFormatter={formatTick} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey={yKey} stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {displayType === "pie" && canRenderPie && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={pieDataKey}
              nameKey={pieNameKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((_, index) => (
                <Cell key={index} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a28ee6"][index % 5]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* fallback messages */}
      {data.length === 0 && <p className="widget-empty">No data available for this widget.</p>}

      {data.length > 0 && displayType === "pie" && !canRenderPie && (
        <p className="widget-empty">Pie chart needs at least 2 fields in each row.</p>
      )}

      {data.length > 0 && (displayType === "bar" || displayType === "line") && !canRenderXY && (
        <p className="widget-empty">Chart needs at least 2 fields in each row.</p>
      )}
    </div>
  );
}
