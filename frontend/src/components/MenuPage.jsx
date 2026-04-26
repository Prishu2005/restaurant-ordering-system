import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { socket } from '../socket';
import QRCode from "react-qr-code";

const backendURL = "https://restaurant-backend-6lre.onrender.com";

const MenuPage = () => {
    const { restaurantId } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cart, setCart] = useState([]);
    const [tableNumber, setTableNumber] = useState("");
    const [placedOrders, setPlacedOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [orderSuccess, setOrderSuccess] = useState(false);

    const menuURL = window.location.href;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tableNum = params.get('table');
        if (tableNum) {
            setTableNumber(tableNum);
            socket.connect();
            socket.emit('join_table_room', tableNum);
            const onOrderStatusUpdate = (updatedOrder) => {
                setPlacedOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            };
            socket.on('order_status_updated', onOrderStatusUpdate);
            return () => { socket.off('order_status_updated', onOrderStatusUpdate); socket.disconnect(); };
        }
    }, []);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`${backendURL}/api/menu?restaurantId=${restaurantId}`);
                setMenuItems(res.data);
            } catch { setError("Failed to load menu."); }
            finally { setLoading(false); }
        };
        if (restaurantId) fetchMenu();
    }, [restaurantId]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            return [...prev, { ...item, quantity: 1, notes: "" }];
        });
    };

    const removeFromCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing.quantity === 1) return prev.filter(c => c.id !== item.id);
            return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c);
        });
    };

    const calculateTotal = () => cart.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2);

    const handlePlaceOrder = async () => {
        if (cart.length === 0 || !tableNumber) return;
        const orderItems = cart.map(i => ({ menuItemId: i.id, name: i.name, price: i.price, quantity: i.quantity, notes: i.notes }));
        try {
            const res = await axios.post(`${backendURL}/api/orders`, { restaurantId, items: orderItems, tableNumber });
            setPlacedOrders(prev => [...prev, res.data]);
            setCart([]);
            setOrderSuccess(true);
            setTimeout(() => setOrderSuccess(false), 3000);
        } catch { alert("There was an error placing your order."); }
    };

    const handleAddNote = (itemId) => {
        const note = prompt("Special instructions for this item:");
        if (note !== null) setCart(prev => prev.map(i => i.id === itemId ? { ...i, notes: note } : i));
    };

    const handleCallWaiter = () => {
        if (tableNumber) {
            socket.emit('call_waiter', { tableNumber, restaurantId });
            alert(`Waiter called to Table ${tableNumber} 🛎️`);
        }
    };

    const filteredItems = menuItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const groupedMenu = filteredItems.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const activeOrders = placedOrders.filter(o => o.status !== 'served');

    return (
        <div className="page">
            {/* Header */}
            <div className="page-header">
                <span style={{ fontSize: '2rem' }}>📋</span>
                <div>
                    <h1>Menu {tableNumber && <span style={{ color: 'var(--accent)' }}>· Table {tableNumber}</span>}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: 4 }}>
                        {menuItems.length} items available
                    </p>
                </div>
            </div>

            <div className="content">
                {/* QR Code */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div className="qr-box">
                        <QRCode value={menuURL} size={120} />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Scan to share this menu</p>
                    </div>
                </div>

                {/* Order success toast */}
                {orderSuccess && (
                    <div className="fade-in" style={{ background: 'linear-gradient(135deg, #27ae60, #1e8449)', color: 'white', padding: '14px 20px', borderRadius: 'var(--radius)', marginBottom: 20, textAlign: 'center', fontWeight: 600 }}>
                        ✅ Order placed successfully!
                    </div>
                )}

                {/* Active Orders */}
                {activeOrders.length > 0 && (
                    <div className="active-orders-box fade-in">
                        <h3 style={{ marginBottom: 12, color: 'var(--success)' }}>✅ Your Active Orders</h3>
                        {activeOrders.map(order => (
                            <div key={order.id} style={{ borderBottom: '1px solid #c3e6cb', paddingBottom: 10, marginBottom: 10 }}>
                                <span className={`status-badge status-${order.status}`}>{order.status}</span>
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
                                    {order.items.map((item, idx) => (
                                        <li key={idx} style={{ fontSize: '0.875rem', padding: '2px 0' }}>
                                            {item.name} × {item.quantity}
                                            {item.notes && <span style={{ color: '#3498db', fontStyle: 'italic', marginLeft: 8 }}>({item.notes})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cart */}
                {cart.length > 0 && (
                    <div className="cart-box fade-in">
                        <h3 style={{ marginBottom: 16, color: '#2980b9' }}>🛒 Your Order</h3>
                        {cart.map(item => (
                            <div key={item.id} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button className="btn btn-danger btn-sm" style={{ padding: '4px 10px' }} onClick={() => removeFromCart(item)}>−</button>
                                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                                        <button className="btn btn-primary btn-sm" style={{ padding: '4px 10px' }} onClick={() => addToCart(item)}>+</button>
                                        <span style={{ fontWeight: 600, color: 'var(--primary)', minWidth: 60, textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleAddNote(item.id)} style={{ background: 'none', border: 'none', color: '#3498db', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: '4px 0' }}>
                                    {item.notes ? `📝 ${item.notes}` : '+ Add note'}
                                </button>
                            </div>
                        ))}
                        <hr className="divider" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary)' }}>₹{calculateTotal()}</span>
                        </div>
                        <button onClick={handlePlaceOrder} className="btn btn-success" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
                            🧾 Add to Bill
                        </button>
                        {!tableNumber && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 8, textAlign: 'center' }}>⚠️ No table number — scan the QR code at your table</p>}
                    </div>
                )}

                {/* Search */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for a dish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Menu */}
                {loading ? <div className="loading">Loading menu...</div>
                    : error ? <div className="error-msg">{error}</div>
                    : Object.keys(groupedMenu).sort().map(category => (
                        <div key={category} className="fade-in">
                            <div className="category-header">{category}</div>
                            {groupedMenu[category].map((item) => (
                                <div key={item.id} className="menu-item-card">
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{item.name}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 6px' }}>{item.description}</p>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>₹{item.price}</span>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>
                                        + Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))
                }
            </div>

            {/* Call Waiter */}
            <button className="waiter-btn" onClick={handleCallWaiter} title="Call Waiter">🛎️</button>
        </div>
    );
};

export default MenuPage;
