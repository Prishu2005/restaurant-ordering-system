import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import QRCode from "react-qr-code";

const backendURL = "https://restaurant-backend-6lre.onrender.com";
const frontendURL = "https://restaurantqrcode.netlify.app";

export default function AdminPanel() {
  const { restaurantId } = useParams();
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendURL}/api/menu?restaurantId=${restaurantId}&showAll=true`);
      setMenu(res.data);
      setError("");
    } catch { setError("Failed to load menu items."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (restaurantId) fetchAdminMenu(); }, [restaurantId]);

  const handleAvailabilityToggle = async (id, currentStatus) => {
    try {
      await axios.patch(`${backendURL}/api/menu/${id}/availability`, { isAvailable: !currentStatus });
      fetchAdminMenu();
    } catch { setError("Failed to update item status."); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${backendURL}/api/menu`, { ...form, restaurantId });
      setForm({ name: "", description: "", price: "", category: "" });
      fetchAdminMenu();
    } catch { setError("Failed to add menu item."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try { await axios.delete(`${backendURL}/api/menu/${id}`); fetchAdminMenu(); }
    catch { setError("Failed to delete menu item."); }
  };

  const groupedMenu = menu.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-header">
        <span style={{ fontSize: '2rem' }}>🍴</span>
        <div>
          <h1>Admin Panel</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: 4 }}>Manage your menu items</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div className="qr-box" style={{ padding: 10 }}>
            <QRCode value={`${frontendURL}/restaurant/${restaurantId}`} size={80} />
          </div>
        </div>
      </div>

      <div className="content">
        {error && <div className="error-msg">{error}</div>}

        {/* Add Item Form */}
        <div className="card fade-in" style={{ marginBottom: 28 }}>
          <h2 style={{ marginBottom: 20, fontSize: '1.2rem' }}>➕ Add New Item</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
              <input className="input" name="name" placeholder="Item Name" value={form.name} onChange={handleChange} required />
              <input className="input" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
              <input className="input" name="price" placeholder="Price (₹)" type="number" value={form.price} onChange={handleChange} required />
              <input className="input" name="category" placeholder="Category" value={form.category} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary">➕ Add Item</button>
          </form>
        </div>

        {/* Menu List */}
        {loading ? <div className="loading">Loading menu...</div> : (
          Object.keys(groupedMenu).sort().map(category => (
            <div key={category} className="fade-in">
              <div className="category-header">{category}</div>
              {groupedMenu[category].map((item) => (
                <div key={item.id} className={`menu-item-card ${!item.isAvailable ? 'unavailable' : ''}`}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: '1rem', margin: 0 }}>{item.name}</h3>
                      <span className={`status-badge ${item.isAvailable ? 'status-served' : 'status-pending'}`}>
                        {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0' }}>{item.description}</p>
                    <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem', margin: 0 }}>₹{item.price}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleAvailabilityToggle(item.id, item.isAvailable)}>
                      {item.isAvailable ? '🔴 Mark Out' : '🟢 Mark In'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
