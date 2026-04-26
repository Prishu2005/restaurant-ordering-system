import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../socket';
import SalesDashboard from '../components/SalesDashboard';

const backendURL = "https://restaurant-backend-6lre.onrender.com";

const ReceptionDashboard = () => {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, averageOrderValue: 0 });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ordersRes, statsRes] = await Promise.all([
          axios.get(`${backendURL}/api/orders/${restaurantId}?view=active`),
          axios.get(`${backendURL}/api/orders/stats/${restaurantId}`)
        ]);
        setOrders(ordersRes.data);
        setStats(statsRes.data);
      } catch { setError('Failed to fetch initial data.'); }
      finally { setLoading(false); }
    };

    fetchInitialData();
    socket.connect();

    socket.on('new_order', (newOrder) => setOrders(prev => [newOrder, ...prev]));
    socket.on('order_status_updated', (updated) => {
      setOrders(prev => updated.status === 'served'
        ? prev.filter(o => o.id !== updated.id)
        : prev.map(o => o.id === updated.id ? updated : o)
      );
    });
    socket.on('stats_updated', (newStats) => setStats(newStats));

    return () => {
      socket.off('new_order');
      socket.off('order_status_updated');
      socket.off('stats_updated');
      socket.disconnect();
    };
  }, [restaurantId]);

  async function updateOrderStatus(orderId, newStatus) {
    try {
      await axios.patch(`${backendURL}/api/orders/${orderId}`, { status: newStatus });
    } catch { alert("Could not update order status."); }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="content"><div className="error-msg">{error}</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <span style={{ fontSize: '2rem' }}>🛎️</span>
        <div>
          <h1>Reception Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: 4 }}>Live order management</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, background: '#2ecc71', borderRadius: '50%', display: 'inline-block' }} className="pulse"></span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>Live</span>
        </div>
      </div>

      <div className="content">
        <SalesDashboard stats={stats} />

        <h2 style={{ marginBottom: 20 }}>Active Orders</h2>

        {orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <p>No active orders right now</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {orders.map(order => (
              <div key={order.id} className={`order-card fade-in ${order.status === 'preparing' ? 'preparing' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🪑 Table {order.tableNumber}</h3>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
                  {order.items.map((item, idx) => (
                    <li key={idx} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>× {item.quantity}</span>
                      {item.notes && <p style={{ color: '#3498db', fontStyle: 'italic', fontSize: '0.8rem', margin: '2px 0 0' }}>📝 {item.notes}</p>}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 8 }}>
                  {order.status === 'pending' && (
                    <button className="btn btn-warning btn-sm" style={{ flex: 1 }} onClick={() => updateOrderStatus(order.id, 'preparing')}>
                      👨‍🍳 Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => updateOrderStatus(order.id, 'served')}>
                      ✅ Served
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionDashboard;
