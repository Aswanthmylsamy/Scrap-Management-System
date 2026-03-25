import React, { useState, useEffect, useCallback } from 'react';
import { inventoryAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiSearch, FiFilter } from 'react-icons/fi';
import './Inventory.css';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

    // ✅ FIX: useCallback to avoid ESLint + infinite loop
    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await inventoryAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search,
                category,
                sort_by: 'date_added',
                sort_order: 'desc'
            });

            setItems(response.data.items);
            setPagination(prev => ({ ...prev, ...response.data.pagination }));
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, category]);

    // ✅ FIX: only depend on fetchItems
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <>
            <Navbar />
            <div className="inventory-container">
                <div className="inventory-header">
                    <h1>Inventory Management</h1>
                    <p>Browse and search all scrap items</p>
                </div>

                <div className="filters-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-wrapper">
                            <FiSearch size={20} />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-secondary">Search</button>
                    </form>

                    <div className="filter-group">
                        <FiFilter size={18} />
                        <select value={category} onChange={(e) => {
                            setCategory(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}>
                            <option value="">All Categories</option>
                            <option value="Metal">Metal</option>
                            <option value="Plastic">Plastic</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Paper">Paper</option>
                            <option value="Glass">Glass</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading items...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <p>No items found</p>
                    </div>
                ) : (
                    <>
                        <div className="inventory-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Unit</th>
                                        <th>Unit Price</th>
                                        <th>Total Value</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item._id}>
                                            <td className="item-name">{item.name}</td>
                                            <td><span className="category-badge">{item.category}</span></td>
                                            <td className="quantity-cell">{item.quantity}</td>
                                            <td>{item.unit}</td>
                                            <td>₹{item.unit_price.toFixed(2)}</td>
                                            <td className="value-cell">₹{item.total_value.toFixed(2)}</td>
                                            <td className="description-cell">{item.description || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Inventory;