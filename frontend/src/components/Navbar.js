import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiPackage, FiLogOut, FiUser, FiShield, FiTrendingUp } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-logo">
                    <FiPackage size={28} />
                    <span>ScrapManager</span>
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/dashboard"
                        className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/inventory"
                        className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}
                    >
                        Inventory
                    </Link>

                    <Link
                        to="/market-prices"
                        className={`nav-link nav-link-market ${isActive('/market-prices') ? 'active' : ''}`}
                    >
                        <FiTrendingUp size={15} />
                        Live Market
                    </Link>

                    {isAdmin() && (
                        <Link
                            to="/admin"
                            className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                        >
                            <FiShield size={16} />
                            Admin Panel
                        </Link>
                    )}
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <FiUser size={18} />
                        <span>{user?.username}</span>
                        {isAdmin() && <span className="admin-badge">Admin</span>}
                    </div>
                    <button onClick={logout} className="logout-btn">
                        <FiLogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
