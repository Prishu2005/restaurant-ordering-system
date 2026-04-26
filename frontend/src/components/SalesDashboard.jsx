import React from 'react';

const SalesDashboard = ({ stats }) => {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 16, fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Today's Summary
      </h2>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div className="stat-card fade-in" style={{ borderTopColor: 'var(--primary)' }}>
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">₹{stats.totalSales.toFixed(2)}</div>
        </div>
        <div className="stat-card fade-in" style={{ borderTopColor: '#3498db' }}>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card fade-in" style={{ borderTopColor: 'var(--success)' }}>
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-value">₹{stats.averageOrderValue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
