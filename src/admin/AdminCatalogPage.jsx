import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminCatalogPage() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const res = await axios.get('/api/images');
    setImages(res.data);
  };

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append('image', file);
    await axios.post('/api/upload', formData);
    fetchImages();
    setFile(null);
  };

  const toggleCarousel = async (id, current) => {
    await axios.patch(`/api/images/${id}`, { showInCarousel: !current });
    fetchImages();
  };

  const deleteImage = async (id) => {
    await axios.delete(`/api/images/${id}`);
    fetchImages();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Catalog</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={uploadImage}>Upload</button>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 30 }}>
        {images.map(img => (
          <div key={img._id} style={{ border: '1px solid #ccc', padding: 10 }}>
            <img src={img.url} alt="" style={{ width: 200, height: 150, objectFit: 'cover' }} />
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={img.showInCarousel}
                  onChange={() => toggleCarousel(img._id, img.showInCarousel)}
                />
                Show in Carousel
              </label>
              <button onClick={() => deleteImage(img._id)} style={{ marginLeft: 10, color: 'red' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
