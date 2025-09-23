const API = import.meta.env.VITE_API_BASE ?? "/api";

export async function getProducts() {
  const r = await fetch(`${API}/products`);
  if (!r.ok) throw new Error("Failed to fetch products");
  return r.json();
}

export async function uploadProduct(formData) {
  const r = await fetch(`${API}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Upload failed (${r.status}): ${t}`);
  }
  return r.json();
}
