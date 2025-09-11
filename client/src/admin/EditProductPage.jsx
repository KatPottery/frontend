import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar from "./Sidebar";
import "./css/AdminLayout.css";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`/api/products/id/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => {
        console.error("Failed to load product", err);
        alert("Product not found or could not be loaded.");
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "sold" ? value === "true" : value;
    setProduct((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(product.images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setProduct((prev) => ({ ...prev, images: reordered }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/products/${id}`, product);
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to update product", err);
      alert("Update failed.");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h2>Edit Product</h2>
        <div style={{ display: "flex", gap: "40px" }}>
          {/* Left: Edit Form */}
          <form onSubmit={handleSubmit} className="edit-form" style={{ flex: 1 }}>
            <div className="form-row">
              <label htmlFor="title">Title:</label>
              <input
                id="title"
                name="title"
                value={product.title || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={product.description || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="materials">Materials:</label>
              <input
                id="materials"
                name="materials"
                value={product.materials || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="yearMade">Year Made:</label>
              <input
                id="yearMade"
                name="yearMade"
                value={product.yearMade || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="price">Price:</label>
              <input
                id="price"
                name="price"
                type="number"
                value={product.price || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="sold">Sold:</label>
              <select
                id="sold"
                name="sold"
                value={String(product.sold)}
                onChange={handleChange}
              >
                <option value="false">Available</option>
                <option value="true">Sold</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" style={{ marginRight: "10px" }}>Save</button>
              <button type="button" onClick={() => navigate("/admin/products")}>
                Cancel
              </button>
            </div>
          </form>

          <div style={{ flex: 1 }}>
            <h3>Reorder Images</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      display: "flex",
                      overflowX: "auto",
                      padding: "10px",
                      border: "1px dashed #ccc",
                      borderRadius: "6px",
                      gap: "10px",
                      minHeight: "110px",
                      alignItems: "flex-start",
                    }}
                  >
                    {product.images?.map((img, index) => (
                      <Draggable key={img.url} draggableId={img.url} index={index}>
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
                              borderRadius: "6px",
                              overflow: "hidden",
                              boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                              backgroundColor: "#fff",
                            }}
                          >
                            <img
                              src={img.url}
                              alt={`preview-${index}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
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
