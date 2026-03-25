import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import { marketAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
    FiPackage, FiDollarSign, FiTrendingUp,
    FiArrowRight, FiZap, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentItems, setRecentItems] = useState([]);
    const [marketPreview, setMarketPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, itemsResponse] = await Promise.all([
                inventoryAPI.getStats(),
                inventoryAPI.getAll({ page: 1, limit: 5, sort_by: 'date_added', sort_order: 'desc' })
            ]);

            setStats(statsResponse.data);
            setRecentItems(itemsResponse.data.items);

            // Quietly fetch top market signals (non-blocking)
            try {
                const mktRes = await marketAPI.getPrices(false);
                const top3 = (mktRes.data.prices || []).slice(0, 4);
                setMarketPreview(top3);
            } catch (_) {
                // Market data is optional on dashboard
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1>Welcome, {user?.username}!</h1>
                        <p>Here's your inventory overview</p>
                    </div>
                    {isAdmin() && (
                        <button className="btn-primary" onClick={() => navigate('/admin')}>
                            Go to Admin Panel
                        </button>
                    )}
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <FiPackage size={28} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats?.total_items || 0}</h3>
                            <p>Total Items</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <FiDollarSign size={28} />
                        </div>
                        <div className="stat-info">
                            <h3>₹{Number(stats?.total_value || 0).toFixed(2)}</h3>
                            <p>Total Value</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <FiTrendingUp size={28} />
                        </div>
                        <div className="stat-info">
                            <h3>{(stats?.total_quantity || 0).toFixed(1)}</h3>
                            <p>Total Quantity</p>
                        </div>
                    </div>
                </div>

                {/* ── Market Price Preview ────────────────── */}
                {marketPreview.length > 0 && (
                    <div className="market-preview-section">
                        <div className="section-header">
                            <h2><FiZap size={18} style={{ marginRight: 8, color: '#6366f1' }} />Market Signals</h2>
                            <button className="btn-link" onClick={() => navigate('/market-prices')}>
                                View All Prices <FiArrowRight />
                            </button>
                        </div>
                        <div className="market-preview-grid">
                            {marketPreview.map((item, idx) => {
                                const isSell = item.recommendation === 'SELL';
                                const marginPos = (item.profit_margin || 0) >= 0;
                                return (
                                    <div key={idx} className={`market-preview-card ${isSell ? 'mpc-sell' : 'mpc-keep'}`}>
                                        <div className="mpc-top">
                                            <span className="mpc-name">{item.item_name}</span>
                                            <span className={`mpc-badge ${isSell ? 'badge-sell' : 'badge-keep'}`}>
                                                {isSell ? <><FiArrowUp size={11} /> SELL</> : <><FiArrowDown size={11} /> KEEP</>}
                                            </span>
                                        </div>
                                        <div className="mpc-price">₹{Number(item.current_market_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<small>/kg</small></div>
                                        <div className={`mpc-margin ${marginPos ? 'margin-up' : 'margin-down'}`}>
                                            {marginPos ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
                                            {(item.profit_margin || 0).toFixed(1)}% margin
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="recent-items-section">
                    <div className="section-header">
                        <h2>Recent Items</h2>
                        <button className="btn-link" onClick={() => navigate('/inventory')}>
                            View All <FiArrowRight />
                        </button>
                    </div>

                    {recentItems.length === 0 ? (
                        <div className="empty-state">
                            <FiPackage size={48} />
                            <p>No items in inventory yet</p>
                            {isAdmin() && <button className="btn-primary" onClick={() => navigate('/admin')}>Add First Item</button>}
                        </div>
                    ) : (
                        <div className="items-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentItems.map((item) => (
                                        <tr key={item._id}>
                                            <td className="item-name">{item.name}</td>
                                            <td><span className="category-badge">{item.category}</span></td>
                                            <td>{item.quantity} {item.unit}</td>
                                            <td>₹{Number(item.unit_price || 0).toFixed(2)}</td>
                                            <td className="value-cell">₹{Number(item.total_value || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {stats?.categories && stats.categories.length > 0 && (
                    <div className="categories-section">
                        <h2>Category Breakdown</h2>
                        <div className="categories-grid">
                            {stats.categories.map((cat, index) => (
                                <div key={index} className="category-card">
                                    <h4>{cat._id}</h4>
                                    <div className="category-stats">
                                        <span className="category-count">{cat.count} items</span>
                                        <span className="category-value">₹{cat.total_value.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;
