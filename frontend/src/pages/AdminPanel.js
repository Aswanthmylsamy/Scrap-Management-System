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
            const payload = {
                ...formData,
                quantity: Number(formData.quantity),
                unit_price: Number(formData.unit_price)
            };

            if (editingItem) {
                await inventoryAPI.update(editingItem._id, payload);
                alert('Item updated successfully!');
            } else {
                await inventoryAPI.create(payload);
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
        if (window.confirm('Are you sure?')) {
            await inventoryAPI.delete(id);
            fetchItems();
        }
    };

    const handleUserRoleChange = async (userId, role) => {
        await adminAPI.updateUser(userId, { role });
        fetchUsers();
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Delete user?')) {
            await adminAPI.deleteUser(userId);
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
                                        <td>{item.quantity} {item.unit}</td>
                                        <td>₹{Number(item.unit_price || 0).toFixed(2)}</td>
                                        <td>₹{Number(item.total_value || 0).toFixed(2)}</td>

                                        <td>
                                            <button onClick={() => handleEdit(item)}>
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* USERS */}
                {activeTab === 'users' && (
                    <div className="tab-content">
                        <h2>User Management</h2>

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
                                                value={user.role}
                                                onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>

                                        <td>
                                            <button onClick={() => handleDeleteUser(user._id)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* MODAL */}
                {showModal && (
                    <div className="modal-overlay" onClick={resetForm}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                            <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>

                            <form onSubmit={handleSubmit} className="modal-form">

                                <input name="name" placeholder="Item Name" value={formData.name} onChange={handleInputChange} required />
                                <input name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} required />
                                <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleInputChange} required />
                                <input name="unit" placeholder="Unit" value={formData.unit} onChange={handleInputChange} required />
                                <input type="number" name="unit_price" placeholder="Unit Price" value={formData.unit_price} onChange={handleInputChange} required />

                                {/* ✅ Description */}
                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />

                                {/* ✅ Buttons */}
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

