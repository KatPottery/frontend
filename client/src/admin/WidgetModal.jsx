import { useState, useEffect } from "react";
import Modal from "react-modal";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "./css/WidgetModal.css";

Modal.setAppElement("#root");
function RecursiveDisplay({ data, level }) {
  if (data === null || data === undefined) return <div>null</div>;

  const indent = "  ".repeat(level);

  if (Array.isArray(data)) {
    return (
      <div style={{ marginLeft: level * 16 }}>
        [<br />
        {data.map((item, i) => (
          <div key={i}>
            {indent}
            <RecursiveDisplay data={item} level={level + 1} />
          </div>
        ))}
        {indent}]
      </div>
    );
  }

  if (typeof data === "object") {
    return (
      <div style={{ marginLeft: level * 16 }}>
        {"{"}
        <br />
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            {indent}
            <strong>{key}</strong>:{" "}
            <RecursiveDisplay data={value} level={level + 1} />
          </div>
        ))}
        {indent + "}"}
      </div>
    );
  }
  return <span>{JSON.stringify(data)}</span>;
}


export default function WidgetModal({
  isOpen,
  onClose,
  onAddWidget,
  onUpdateWidget,
  initialData = {},
  editMode = false
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [displayType, setDisplayType] = useState("table");
  const [queryInput, setQueryInput] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setDisplayType(initialData.displayType || "table");

      const initialQuery = initialData.query
        ? JSON.stringify(initialData.query, null, 2)
        : `{
  "collection": "orders",
  "operation": "aggregate",
  "args": [[{ "$match": { "status": "completed" }}]]
}`;

      setQueryInput(initialQuery);
      setAiInput("");
      setUseAI(false);
      setResult(null);
      setError("");
    }
  }, [isOpen]);

  const handleDelete = async () => {
  if (!initialData?._id) return;

  const confirmDelete = window.confirm("Are you sure you want to delete this widget?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`/api/admin/widgets/${initialData._id}`);
    onClose();
  } catch (err) {
    console.error("Failed to delete widget:", err);
  }
};

  const runPreview = async () => {
    try {
      let query;

      if (useAI) {
        const aiRes = await axios.post("/api/admin/ai", { question: aiInput });
        query = aiRes.data;

        if (!query.collection || !query.operation || !Array.isArray(query.args)) {
          throw new Error("AI response is missing required fields.");
        }

        setQueryInput(JSON.stringify(query, null, 2));
      } else {
        query = JSON.parse(queryInput);
      }

      console.log("[SENDING TO RAW QUERY]", query);

      const res = await axios.post("http://localhost:5000/api/admin/raw-query", query);

      const raw = res.data;
      const value = raw.data;
      const normalized = Array.isArray(value) ? value : [value];

      setResult(normalized);
      setError("");
    } catch (err) {
      console.error("[ERROR]", err);
      setError(err.response?.data?.error || err.message);
      setResult(null);
    }
  };


  const confirmSubmit = async () => {
    const query = JSON.parse(queryInput);
    const widget = {
      title,
      description,
      query,
      displayType,
      value: Array.isArray(result) ? result : []
    };

    if (editMode && initialData?._id) {
      await axios.put(`/api/admin/widgets/${initialData._id}`, widget);
      onUpdateWidget({ ...widget, _id: initialData._id });
    } else {
      const res = await axios.post("/api/admin/widgets", widget);
      onAddWidget(res.data);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add Custom Widget"
      className="modal wide-modal"
      overlayClassName="modal-overlay"
      style={{
        content: {
          maxWidth: "1000px",
          margin: "auto",
          maxHeight: "90vh",
          padding: "0",
          display: "flex",
          flexDirection: "column"
        }
      }}
    >
      <div
        style={{
          padding: "2rem",
          overflowY: "auto",
          flex: "1 1 auto"
        }}
      >
        <h2>{editMode ? "Edit Widget" : "Add Custom Widget"}</h2>

        <label>Title<span style={{ color: "red" }}>*</span>:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter widget title"
          required
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />

        <label>Description (optional):</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description for this widget"
          rows={2}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />

        <label>Display Type:</label>
        <select
          value={displayType}
          onChange={(e) => setDisplayType(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        >
          <option value="table">Table</option>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
        </select>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => {
                setUseAI(e.target.checked);
                setResult(null);
                setError("");
              }}
              style={{ marginRight: "0.5rem" }}
            />
            Use AI
          </label>
        </div>

        {useAI ? (
          <>
            <label>Ask in natural language:</label>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder='e.g. "Show all products under $50 sorted by price"'
              rows={4}
              style={{ width: "100%", padding: "0.5rem", marginBottom: "0.25rem" }}
            />
            <p style={{ fontSize: "0.85rem", fontStyle: "italic", color: "#888", marginBottom: "1rem" }}>
              AI mongo query generator
            </p>
          </>
        ) : (
          <>
            <label>Mongo Query (JSON):</label>
            <div style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
              <Editor
                height="250px"
                defaultLanguage="json"
                value={queryInput}
                onChange={setQueryInput}
                options={{
                  minimap: { enabled: false },
                  formatOnType: true,
                  autoClosingBrackets: "always",
                  quickSuggestions: true
                }}
              />
            </div>
          </>
        )}

        <button onClick={runPreview} className="primary-button" style={{ marginBottom: "1rem" }}>
          Preview Result
        </button>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        {result && (
          <div
            style={{
              background: "#f9f9f9",
              padding: "1rem",
              marginTop: "0",
              maxHeight: "300px",
              overflow: "auto",
              border: "1px solid #ccc",
              fontSize: "0.9rem",
              fontFamily: "monospace"
            }}
          >
            {result.map((row, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                {Object.entries(row).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: "0.5rem" }}>
                    <strong>{key}:</strong>{" "}
                    {Array.isArray(value) && value.length > 0 && typeof value[0] === "object" ? (
                      <div style={{ marginLeft: "1rem", marginTop: "0.25rem", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {value.map((obj, i) =>
                          obj.url && typeof obj.url === "string" && obj.url.startsWith("http") ? (
                            <a
                              key={i}
                              href={obj.url}
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
                                src={obj.url}
                                alt={`preview-${i}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </a>
                          ) : (
                            <div key={i} style={{ fontSize: "0.85rem" }}>
                              {JSON.stringify(obj)}
                            </div>
                          )
                        )}
                      </div>
                    ) : typeof value === "string" && value.startsWith("http") && value.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
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
                    ) : typeof value === "object" && value !== null ? (
                      <pre style={{ marginLeft: "1rem" }}>{JSON.stringify(value, null, 2)}</pre>
                    ) : (
                      <span>{String(value)}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}

          </div>
        )}
      </div>

      <div
        style={{
          padding: "1rem 2rem",
          borderTop: "1px solid #ddd",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        }}
      >
        {editMode && (
          <button
            onClick={handleDelete}
            style={{
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        )}

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={confirmSubmit}
            disabled={!result || !title.trim()}
            className="primary-button"
          >
            {editMode ? "Update Widget" : "Add Widget"}
          </button>
          <button onClick={onClose} className="secondary-button">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
