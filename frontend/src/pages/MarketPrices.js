import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { marketAPI } from '../services/api';
import {
    FiTrendingUp, FiTrendingDown, FiMinus,
    FiRefreshCw, FiPackage,
    FiAlertCircle, FiCheckCircle, FiClock,
    FiArrowUp, FiArrowDown, FiZap
} from 'react-icons/fi';
import './MarketPrices.css';

// ── helper ──────────────────────────────────────────────────────────────────

const TrendIcon = ({ trend }) => {
    if (trend === 'bullish') return <FiTrendingUp className="trend-icon bullish" />;
    if (trend === 'bearish') return <FiTrendingDown className="trend-icon bearish" />;
    return <FiMinus className="trend-icon stable" />;
};

const formatPrice = (v) =>
    v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '–';

const formatDate = (iso) => {
    if (!iso) return '–';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

// ── component ────────────────────────────────────────────────────────────────

const MarketPrices = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [filter, setFilter] = useState('all'); // all | sell | keep
    const [sortBy, setSortBy] = useState('profit'); // profit | name | price
    const [summaryStats, setSummaryStats] = useState(null);

    // ── fetch ────────────────────────────────────────────────────────────────

    const fetchPrices = useCallback(async (forceRefresh = false) => {
        try {
            setError(null);
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await marketAPI.getPrices(forceRefresh);
            const data = res.data;
            setPrices(data.prices || []);
            setLastRefreshed(data.last_refreshed);

            // Compute summary
            const allPrices = data.prices || [];
            const sellCount = allPrices.filter(p => p.recommendation === 'SELL').length;
            const keepCount = allPrices.filter(p => p.recommendation === 'KEEP').length;
            const avgMargin = allPrices.length
                ? allPrices.reduce((s, p) => s + (p.profit_margin || 0), 0) / allPrices.length
                : 0;
            const topProfit = allPrices.reduce((best, p) =>
                (p.profit_margin || 0) > (best.profit_margin || 0) ? p : best, {});

            setSummaryStats({ sellCount, keepCount, avgMargin, topProfit, total: allPrices.length });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch market prices');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchPrices(); }, [fetchPrices]);

    // ── auto-refresh every 10 min ────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => fetchPrices(false), 10 * 60 * 1000);
        return () => clearInterval(id);
    }, [fetchPrices]);

    // ── filtered + sorted list ───────────────────────────────────────────────
    const displayed = [...prices]
        .filter(p => {
            if (filter === 'sell') return p.recommendation === 'SELL';
            if (filter === 'keep') return p.recommendation === 'KEEP';
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'profit') return (b.profit_margin || 0) - (a.profit_margin || 0);
            if (sortBy === 'name') return a.item_name.localeCompare(b.item_name);
            if (sortBy === 'price') return b.current_market_price - a.current_market_price;
            return 0;
        });

    // ── render ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="mp-loading">
                    <div className="mp-spinner-ring" />
                    <p>Fetching live market prices…</p>
                    <span className="mp-loading-sub">Connecting to market intelligence engine</span>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="mp-container">

                {/* ── Page header ── */}
                <div className="mp-header">
                    <div className="mp-header-left">
                        <div className="mp-header-icon">
                            <FiZap size={24} />
                        </div>
                        <div>
                            <h1>Live Market Prices</h1>
                            <p>Real-time scrap commodity prices &amp; AI-powered sell/keep recommendations</p>
                        </div>
                    </div>
                    <div className="mp-header-right">
                        {lastRefreshed && (
                            <span className="mp-last-updated">
                                <FiClock size={14} />
                                Updated: {formatDate(lastRefreshed)}
                            </span>
                        )}
                        <button
                            id="btn-refresh-prices"
                            className={`mp-btn-refresh ${refreshing ? 'spinning' : ''}`}
                            onClick={() => fetchPrices(true)}
                            disabled={refreshing}
                        >
                            <FiRefreshCw size={16} />
                            {refreshing ? 'Refreshing…' : 'Refresh Prices'}
                        </button>
                    </div>
                </div>

                {/* ── Error banner ── */}
                {error && (
                    <div className="mp-error-banner">
                        <FiAlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* ── Summary cards ── */}
                {summaryStats && (
                    <div className="mp-summary-grid">
                        <div className="mp-summary-card accent-blue">
                            <div className="mp-summary-icon"><FiPackage size={22} /></div>
                            <div>
                                <span className="mp-summary-value">{summaryStats.total}</span>
                                <span className="mp-summary-label">Items Tracked</span>
                            </div>
                        </div>
                        <div className="mp-summary-card accent-green">
                            <div className="mp-summary-icon"><FiArrowUp size={22} /></div>
                            <div>
                                <span className="mp-summary-value">{summaryStats.sellCount}</span>
                                <span className="mp-summary-label">Sell Signals</span>
                            </div>
                        </div>
                        <div className="mp-summary-card accent-amber">
                            <div className="mp-summary-icon"><FiArrowDown size={22} /></div>
                            <div>
                                <span className="mp-summary-value">{summaryStats.keepCount}</span>
                                <span className="mp-summary-label">Hold Signals</span>
                            </div>
                        </div>
                        <div className="mp-summary-card accent-purple">
                            <div className="mp-summary-icon"><FiTrendingUp size={22} /></div>
                            <div>
                                <span className="mp-summary-value">{summaryStats.avgMargin.toFixed(1)}%</span>
                                <span className="mp-summary-label">Avg Profit Margin</span>
                            </div>
                        </div>
                        {summaryStats.topProfit?.item_name && (
                            <div className="mp-summary-card accent-teal">
                                <div className="mp-summary-icon"><FiCheckCircle size={22} /></div>
                                <div>
                                    <span className="mp-summary-value">
                                        {summaryStats.topProfit.item_name.replace(' Scrap', '')}
                                    </span>
                                    <span className="mp-summary-label">
                                        Best Margin · {(summaryStats.topProfit.profit_margin || 0).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Controls ── */}
                <div className="mp-controls">
                    <div className="mp-filter-tabs">
                        {[
                            { key: 'all', label: '⬡ All Items' },
                            { key: 'sell', label: '⬆ SELL Now' },
                            { key: 'keep', label: '⬇ KEEP Stock' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                id={`filter-${tab.key}`}
                                className={`mp-tab ${filter === tab.key ? 'active' : ''}`}
                                onClick={() => setFilter(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="mp-sort-group">
                        <label>Sort by</label>
                        <select
                            id="sort-market-prices"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="profit">Profit Margin</option>
                            <option value="name">Name</option>
                            <option value="price">Market Price</option>
                        </select>
                    </div>
                </div>

                {/* ── Table ── */}
                {displayed.length === 0 ? (
                    <div className="mp-empty">
                        <FiPackage size={52} className="mp-empty-icon" />
                        <p>No in-stock items found</p>
                        <span>Add inventory items with stock status "in_stock" to see market prices.</span>
                    </div>
                ) : (
                    <div className="mp-table-wrapper">
                        <table className="mp-table" id="market-prices-table">
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Qty</th>
                                    <th>Purchase Price</th>
                                    <th>Today's Price</th>
                                    <th>Profit Margin</th>
                                    <th>Market Trend</th>
                                    <th>Recommendation</th>
                                    <th>Source / Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map((item, idx) => {
                                    const isSell = item.recommendation === 'SELL';
                                    const marginPos = (item.profit_margin || 0) >= 0;
                                    return (
                                        <tr
                                            key={idx}
                                            className={`mp-row ${isSell ? 'row-sell' : 'row-keep'}`}
                                        >
                                            {/* Material */}
                                            <td>
                                                <span className="mp-item-name">{item.item_name}</span>
                                            </td>

                                            {/* Qty */}
                                            <td className="mp-qty">
                                                {item.quantity} <small>{item.unit || 'kg'}</small>
                                            </td>

                                            {/* Purchase Price */}
                                            <td className="mp-purchase-price">
                                                {formatPrice(item.purchase_price)}
                                                <small>/kg</small>
                                            </td>

                                            {/* Market Price */}
                                            <td>
                                                <span className="mp-market-price">
                                                    {formatPrice(item.current_market_price)}
                                                </span>
                                                <small>/kg</small>
                                            </td>

                                            {/* Profit Margin */}
                                            <td>
                                                <div className={`mp-margin-pill ${marginPos ? 'positive' : 'negative'}`}>
                                                    {marginPos ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
                                                    {(item.profit_margin || 0).toFixed(2)}%
                                                </div>
                                                <div className="mp-margin-bar-wrapper">
                                                    <div
                                                        className={`mp-margin-bar ${marginPos ? 'bar-pos' : 'bar-neg'}`}
                                                        style={{
                                                            width: `${Math.min(Math.abs(item.profit_margin || 0), 100)}%`
                                                        }}
                                                    />
                                                </div>
                                            </td>

                                            {/* Trend */}
                                            <td>
                                                <div className={`mp-trend-badge trend-${item.trend || 'stable'}`}>
                                                    <TrendIcon trend={item.trend} />
                                                    <span>{(item.trend || 'stable').charAt(0).toUpperCase() + (item.trend || 'stable').slice(1)}</span>
                                                </div>
                                            </td>

                                            {/* Recommendation */}
                                            <td>
                                                <div
                                                    className={`mp-rec-badge ${isSell ? 'rec-sell' : 'rec-keep'}`}
                                                    title={item.reason}
                                                >
                                                    {isSell
                                                        ? <><FiArrowUp size={13} /> SELL</>
                                                        : <><FiArrowDown size={13} /> KEEP</>
                                                    }
                                                </div>
                                                <p className="mp-rec-reason">{item.reason}</p>
                                            </td>

                                            {/* Source / Updated */}
                                            <td className="mp-source-cell">
                                                <div className="mp-source-name">{item.source}</div>
                                                <div className="mp-updated-time">
                                                    <FiClock size={11} />
                                                    {formatDate(item.last_updated)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Footer note ── */}
                <div className="mp-footer-note">
                    <FiAlertCircle size={14} />
                    Prices are fetched from live commodity market sources and updated every 6 hours automatically.
                    The sell/keep recommendation is based on real-time profit margin analysis and market trend signals.
                    This is for informational purposes only — always verify with your local scrap dealer.
                </div>
            </div>
        </>
    );
};

export default MarketPrices;
