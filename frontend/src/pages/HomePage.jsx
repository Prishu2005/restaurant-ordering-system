//pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = "https://restaurant-backend-6lre.onrender.com";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${backendURL}/api/restaurants`)
      .then((res) => { setRestaurants(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <span style={{ fontSize: '2rem' }}>🍽️</span>
        <div>
          <h1>Welcome</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: 4 }}>Select a restaurant to view the menu</p>
        </div>
      </div>

      <div className="content">
        {loading ? (
          <div className="loading">Loading restaurants...</div>
        ) : restaurants.length === 0 ? (
          <div className="loading">No restaurants available yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {restaurants.map((r) => (
              <a key={r.id} href={`/restaurant/${r.id}`} style={{ textDecoration: 'none' }}>
                <div className="card fade-in" style={{ cursor: 'pointer', borderTop: '4px solid var(--primary)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏪</div>
                  <h3 style={{ marginBottom: 6, color: 'var(--dark)' }}>{r.name}</h3>
                  {r.location && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>📍 {r.location}</p>}
                  <span className="btn btn-primary btn-sm">View Menu →</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
