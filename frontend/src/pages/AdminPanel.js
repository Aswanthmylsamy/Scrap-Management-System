
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
        if (activeTab === 'inventory') fetchItems();
        else fetchUsers();
    }, [activeTab]);

    const fetchItems = async () => {
        const res = await inventoryAPI.getAll({ page: 1, limit: 100 });
        setItems(res.data.items);
    };

    const fetchUsers = async () => {
        const res = await adminAPI.getAllUsers();
        setUsers(res.data.users);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            quantity: Number(formData.quantity),
            unit_price: Number(formData.unit_price)
        };

        if (editingItem) {
            await inventoryAPI.update(editingItem._id, payload);
        } else {
            await inventoryAPI.create(payload);
        }

        resetForm();
        fetchItems();
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
        if (window.confirm('Delete item?')) {
            await inventoryAPI.delete(id);
            fetchItems();
        }
    };

    const handleUserRoleChange = async (id, role) => {
        await adminAPI.updateUser(id, { role });
        fetchUsers();
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Delete user?')) {
            await adminAPI.deleteUser(id);
            fetchUsers();
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

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <FiPackage /> Inventory
                    </button>

                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUsers /> Users
                    </button>
                </div>

                {/* INVENTORY */}
                {activeTab === 'inventory' && (
                    <div className="tab-content">

                        <div className="content-header">
                            <h2>Inventory Items</h2>
                            <button className="btn-primary" onClick={() => setShowModal(true)}>
                                <FiPlus /> Add Item
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
                                        <th>Total</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {items.map(item => (
                                        <tr key={item._id}>
                                            <td>{item.name}</td>
                                            <td>{item.category}</td>
                                            <td className="quantity-cell">{item.quantity} {item.unit}</td>
                                            <td>₹{Number(item.unit_price || 0).toFixed(2)}</td>
                                            <td>₹{Number(item.total_value || 0).toFixed(2)}</td>

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

                {/* USERS */}
                {activeTab === 'users' && (
                    <div className="tab-content">

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
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.username || user.name || "N/A"}</td>
                                            <td>{user.email || "N/A"}</td>

                                            <td>
                                                <select
                                                    className="role-select"
                                                    value={user.role}
                                                    onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
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

                {/* MODAL */}
                {showModal && (
                    <div className="modal-overlay" onClick={resetForm}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                            <div className="modal-header">
                                <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                                <button className="close-btn" onClick={resetForm}>×</button>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            name="name"
                                            placeholder="Enter item name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                        >
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
                                        <label>Quantity</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            placeholder="Enter quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Unit</label>
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Unit</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="tons">Tons</option>
                                            <option value="pieces">Pieces</option>
                                            <option value="lbs">Pounds (lbs)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Unit Price</label>
                                    <input
                                        type="number"
                                        name="unit_price"
                                        placeholder="Enter price per unit"
                                        value={formData.unit_price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Enter description (optional)"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>

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

