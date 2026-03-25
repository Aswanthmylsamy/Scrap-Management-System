import React, { useState, useEffect } from 'react';
import { inventoryAPI, adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiPackage } from 'react-icons/fi';
import './AdminPanel.css';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        quantity: '',
        unit: '',
        unit_price: '',
        description: ''
    });

    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchItems();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchItems = async () => {
        try {
            const response = await inventoryAPI.getAll({ page: 1, limit: 100 });
            setItems(response.data.items);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getAllUsers();
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await inventoryAPI.update(editingItem._id, formData);
                alert('Item updated successfully!');
            } else {
                await inventoryAPI.create(formData);
                alert('Item added successfully!');
            }
            resetForm();
            fetchItems();
        } catch (error) {
            alert('Failed to save item: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price,
            description: item.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await inventoryAPI.delete(id);
                alert('Item deleted successfully!');
                fetchItems();
            } catch (error) {
                alert('Failed to delete item: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const handleUserRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.updateUser(userId, { role: newRole });
            alert('User role updated successfully!');
            fetchUsers();
        } catch (error) {
            alert('Failed to update user: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminAPI.deleteUser(userId);
                alert('User deleted successfully!');
                fetchUsers();
            } catch (error) {
                alert('Failed to delete user: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            quantity: '',
            unit: '',
            unit_price: '',
            description: ''
        });
        setEditingItem(null);
        setShowModal(false);
    };

    return (
        <>
            <Navbar />
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Admin Panel</h1>
                    <p>Manage inventory and users</p>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <FiPackage size={18} />
                        Inventory Management
                    </button>
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUsers size={18} />
                        User Management
                    </button>
                </div>

                {activeTab === 'inventory' && (
                    <div className="tab-content">
                        <div className="content-header">
                            <h2>Inventory Items</h2>
                            <button className="btn-primary" onClick={() => setShowModal(true)}>
                                <FiPlus size={18} />
                                Add New Item
                            </button>
                        </div>

                        <div className="admin-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total Value</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item._id}>
                                            <td className="item-name">{item.name}</td>
                                            <td><span className="category-badge">{item.category}</span></td>
                                            <td>{item.quantity} {item.unit}</td>
                                            <td>₹{item.unit_price.toFixed(2)}</td>
                                            <td className="value-cell">₹{item.total_value.toFixed(2)}</td>
                                            <td className="actions-cell">
                                                <button className="btn-icon edit" onClick={() => handleEdit(item)}>
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(item._id)}>
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="tab-content">
                        <div className="content-header">
                            <h2>User Management</h2>
                        </div>

                        <div className="admin-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="item-name">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                                                    className="role-select"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="actions-cell">
                                                <button className="btn-icon delete" onClick={() => handleDeleteUser(user._id)}>
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {showModal && (
                    <div className="modal-overlay" onClick={resetForm}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                                <button className="close-btn" onClick={resetForm}>&times;</button>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Item Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Copper Wire"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange} required>
                                            <option value="">Select Category</option>
                                            <option value="Metal">Metal</option>
                                            <option value="Plastic">Plastic</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Paper">Paper</option>
                                            <option value="Glass">Glass</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Quantity *</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            required
                                            step="0.01"
                                            placeholder="e.g., 100"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Unit *</label>
                                        <select name="unit" value={formData.unit} onChange={handleInputChange} required>
                                            <option value="">Select Unit</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="tons">Tons</option>
                                            <option value="pieces">Pieces</option>
                                            <option value="lbs">Pounds (lbs)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Unit Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="unit_price"
                                        value={formData.unit_price}
                                        onChange={handleInputChange}
                                        required
                                        step="0.01"
                                        placeholder="e.g., 2.50"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Optional description..."
                                    ></textarea>
                                </div>

                                {formData.quantity && formData.unit_price && (
                                    <div className="total-value-preview">
                                        <strong>Total Value: </strong>
                                        ₹{(Number(formData.quantity || 0) * Number(formData.unit_price || 0)).toFixed(2)}
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={resetForm}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingItem ? 'Update Item' : 'Add Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminPanel;
