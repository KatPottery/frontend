import React, { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar from "./Sidebar";
import "./css/AdminLayout.css";

export default function AdminPage() {
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    materials: "",
    yearMade: "",
    price: "",
    showInCarousel: false,
    tag: "",
    isPrint: false,
    stock: 1,
    width: "",
    height: "",

    pottery: {
      weight: "",
      dishwasherSafe: false,
    },
  });

  const isPrint = form.tag === "print";
  const isPottery = form.tag === "pottery";

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(files);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setFiles(reordered);
  };

  const removeImage = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return alert("Please select at least one image.");
    if (!form.title?.trim()) return alert("Title is required.");
    if (!form.tag) return alert("Please select a tag.");

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("materials", form.materials);
    formData.append("yearMade", String(form.yearMade || ""));
    formData.append("price", String(form.price || 0));
    formData.append("showInCarousel", String(!!form.showInCarousel));
    formData.append("tag", form.tag);

    formData.append("width", String(Number(form.width) || 0));
    formData.append("height", String(Number(form.height) || 0));

    formData.append("isPrint", String(isPrint));
    formData.append("stock", String(isPrint ? (form.stock || 1) : 1));

    if (isPottery) {
      const potteryPayload = {
        weight: Number(form.pottery.weight) || 0,
        dishwasherSafe: !!form.pottery.dishwasherSafe,
      };
      formData.append("pottery", JSON.stringify(potteryPayload));
    }

    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        alert("Product uploaded successfully!");
        setFiles([]);
        setForm({
          title: "",
          description: "",
          materials: "",
          yearMade: "",
          price: "",
          showInCarousel: false,
          tag: "",
          isPrint: false,
          stock: 1,
          width: "",
          height: "",
          pottery: { weight: "", dishwasherSafe: false },
        });
        console.log("Saved:", res.data.product);
      } else {
        alert("Upload completed, but server did not return success.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-main">
        <h2>Create New Product</h2>

        <div style={{ display: "flex", gap: "40px" }}>
          <div style={{ flex: 1 }}>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
            <br /><br />

            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <br /><br />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <br /><br />

            <input
              type="text"
              placeholder="Materials"
              value={form.materials}
              onChange={(e) => setForm({ ...form, materials: e.target.value })}
            />
            <br /><br />

            <input
              type="number"
              placeholder="Year Made"
              value={form.yearMade}
              onChange={(e) => setForm({ ...form, yearMade: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
            />
            <br /><br />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
            />
            <br /><br />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
              <label>
                Width (mm)
                <input
                  type="number"
                  value={form.width}
                  onChange={(e) => setForm({ ...form, width: e.target.value })}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </label>
              <label>
                Height (mm)
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </label>
            </div>
            <br />

            <label>
              <input
                type="checkbox"
                checked={form.showInCarousel}
                onChange={(e) =>
                  setForm({ ...form, showInCarousel: e.target.checked })
                }
              />
              &nbsp; Show in Carousel
            </label>
            <br /><br />

            <label htmlFor="tag">Tag</label>
            <br />
            <select
              id="tag"
              name="tag"
              value={form.tag}
              onChange={(e) => {
                const tag = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  tag,
                  isPrint: tag === "print",
                  stock: tag === "print" ? (prev.stock || 1) : 1,
                  pottery:
                    tag === "pottery"
                      ? prev.pottery
                      : { weight: "", dishwasherSafe: false },
                }));
              }}
              required
            >
              <option value="">Select Tag</option>
              <option value="painting">Painting</option>
              <option value="drawing">Drawing</option>
              <option value="pottery">Pottery</option>
              <option value="print">Print</option>
            </select>
            <br /><br />

            <input
              type="number"
              placeholder="Stock Quantity"
              value={form.stock}
              min={1}
              readOnly={!isPrint}
              style={{
                opacity: isPrint ? 1 : 0.6,
                cursor: isPrint ? "auto" : "not-allowed",
              }}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
            />
            <br /><br />

            {isPottery && (
              <>
                <h4>Pottery Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                  <label>
                    Weight (g)
                    <input
                      type="number"
                      value={form.pottery.weight}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pottery: { ...form.pottery, weight: e.target.value },
                        })
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={!!form.pottery.dishwasherSafe}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pottery: {
                            ...form.pottery,
                            dishwasherSafe: e.target.checked,
                          },
                        })
                      }
                    />
                    Dishwasher Safe
                  </label>
                </div>
                <br />
              </>
            )}

            <button onClick={handleUpload}>Upload Product</button>
          </div>

          <div style={{ flex: 1 }}>
            <h3>Reorder Images</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable
                droppableId="images"
                direction="horizontal"
                renderClone={(provided, snapshot, rubric) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      width: "100px",
                      height: "100px",
                      flex: "0 0 auto",
                      borderRadius: "6px",
                      overflow: "hidden",
                      boxShadow: "0 0 8px rgba(0,0,0,0.2)",
                      transform: provided.draggableProps.style?.transform,
                    }}
                  >
                    <img
                      src={URL.createObjectURL(files[rubric.source.index])}
                      alt={`drag-preview-${rubric.source.index}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
              >
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      padding: "10px",
                      border: "1px dashed #ccc",
                      borderRadius: "6px",
                      maxWidth: "100%",
                      minHeight: "110px",
                      alignItems: "flex-start",
                    }}
                  >
                    {files.map((file, index) => (
                      <Draggable
                        key={file.name + index}
                        draggableId={file.name + index}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              width: "100px",
                              height: "100px",
                              flex: "0 0 auto",
                              position: "relative",
                              borderRadius: "6px",
                              overflow: "hidden",
                              boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                              backgroundColor: "#fff",
                            }}
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`preview-${index}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <button
                              onClick={() => removeImage(index)}
                              style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                background: "rgba(0,0,0,0.6)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                                fontSize: "12px",
                                lineHeight: "20px",
                                padding: 0,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </main>
    </div>
  );
}
