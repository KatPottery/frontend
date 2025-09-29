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

  const isPottery = (p) => (p?.category || p?.tag) === "pottery";
  const isPrint = (p) => !!p?.isPrint;

  useEffect(() => {
    axios
      .get(`/api/products/id/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error("Failed to load product", err);
        alert("Product not found or could not be loaded.");
      });
  }, [id]);

  const setField = (name, value) =>
    setProduct((prev) => ({ ...prev, [name]: value }));

  const setPotteryField = (name, value) =>
    setProduct((prev) => ({
      ...prev,
      pottery: { ...(prev.pottery || {}), [name]: value },
    }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // booleans
    if (type === "checkbox") {
      // nested pottery checkbox
      if (name === "pottery.dishwasherSafe") {
        return setPotteryField("dishwasherSafe", !!checked);
      }
      return setField(name, !!checked);
    }

    if (name === "pottery.weight") {
      const num = value === "" ? "" : Math.max(0, Number(value));
      return setPotteryField("weight", num);
    }

    if (["price", "yearMade", "stock", "width", "height"].includes(name)) {
      const num = value === "" ? "" : Math.max(0, Number(value));
      return setField(name, num);
    }

    if (name === "sold") {
      const next = value === "true";
      if (isPrint(product) && next === true) return;
      return setField("sold", next);
    }

    if (name === "category" || name === "tag") {
      const tag = value;
      setProduct((prev) => {
        const next = {
          ...prev,
          category: tag,
          tag,
        };
        if (tag !== "pottery") {
          next.pottery = undefined;
        } else {
          next.pottery = prev.pottery || { weight: 0, dishwasherSafe: false };
        }
        return next;
      });
      return;
    }

    if (name === "isPrint") {
      const next = value === "true";
      setProduct((prev) => ({
        ...prev,
        isPrint: next,
        sold: next ? false : prev.sold,
        stock: next ? Math.max(1, Number(prev.stock || 1)) : 0,
      }));
      return;
    }

    setField(name, value);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(product.images || []);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setProduct((prev) => ({ ...prev, images: reordered }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    const outbound = {
      title: product.title,
      description: product.description ?? "",
      materials: product.materials ?? "",
      yearMade:
        product.yearMade === "" || product.yearMade == null
          ? undefined
          : Number(product.yearMade),
      price:
        product.price === "" || product.price == null
          ? 0
          : Number(product.price),

      category: product.category || product.tag || "",
      tag: product.category || product.tag || "",

      width:
        product.width === "" || product.width == null
          ? 0
          : Number(product.width),
      height:
        product.height === "" || product.height == null
          ? 0
          : Number(product.height),

      isPrint: !!product.isPrint,
      stock: product.isPrint ? Math.max(1, Number(product.stock || 1)) : 0,
      sold: product.isPrint ? false : !!product.sold,

      images: product.images,
      slug: product.slug,
      pottery: isPottery(product)
        ? {
            weight:
              product.pottery?.weight === "" ||
              product.pottery?.weight == null
                ? 0
                : Number(product.pottery?.weight),
            dishwasherSafe: !!product.pottery?.dishwasherSafe,
          }
        : undefined,
    };

    try {
      await axios.patch(`/api/products/${id}`, outbound);
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
                type="number"
                value={product.yearMade ?? ""}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            <div className="form-row">
              <label htmlFor="price">Price:</label>
              <input
                id="price"
                name="price"
                type="number"
                value={product.price ?? ""}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            <div className="form-row">
              <label htmlFor="category">Category (Tag):</label>
              <select
                id="category"
                name="category"
                value={product.category || product.tag || ""}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="painting">Painting</option>
                <option value="drawing">Drawing</option>
                <option value="pottery">Pottery</option>
                <option value="print">Print</option>
              </select>
            </div>

            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>
                Width (mm)
                <input
                  name="width"
                  type="number"
                  value={product.width ?? ""}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </label>
              <label>
                Height (mm)
                <input
                  name="height"
                  type="number"
                  value={product.height ?? ""}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </label>
            </div>

            <div className="form-row">
              <label htmlFor="isPrint">Is Print:</label>
              <select
                id="isPrint"
                name="isPrint"
                value={String(!!product.isPrint)}
                onChange={(e) =>
                  handleChange({
                    target: { name: "isPrint", value: e.target.value },
                  })
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {isPrint(product) && (
              <div className="form-row">
                <label htmlFor="stock">Stock:</label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min={1}
                  value={product.stock ?? 1}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            )}

            <div className="form-row">
              <label htmlFor="sold">Sold:</label>
              <select
                id="sold"
                name="sold"
                value={String(!!product.sold)}
                onChange={handleChange}
                disabled={isPrint(product)}
                title={isPrint(product) ? "Prints cannot be marked sold. Use stock instead." : undefined}
              >
                <option value="false">Available</option>
                <option value="true">Sold</option>
              </select>
              {isPrint(product) && (
                <small style={{ marginLeft: 8, opacity: 0.8 }}>
                  Prints use stock. This is disabled.
                </small>
              )}
            </div>

            {isPottery(product) && (
              <>
                <h4>Pottery Details</h4>
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label>
                    Weight (g)
                    <input
                      name="pottery.weight"
                      type="number"
                      value={product.pottery?.weight ?? ""}
                      onChange={handleChange}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      name="pottery.dishwasherSafe"
                      type="checkbox"
                      checked={!!product.pottery?.dishwasherSafe}
                      onChange={handleChange}
                    />
                    Dishwasher Safe
                  </label>
                </div>
              </>
            )}

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
                      <Draggable key={img.url + index} draggableId={img.url + index} index={index}>
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
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
