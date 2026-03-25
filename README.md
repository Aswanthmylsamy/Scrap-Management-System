# Scrap Inventory Management System

A professional, full-stack web application for managing scrap inventory with secure authentication, admin panel, and material value tracking.

## 🚀 Features

- **🔐 Secure Authentication**: JWT-based login/signup system with bcrypt password hashing
- **👥 Role-Based Access**: Admin and regular user roles with different permissions
- **📦 Inventory Management**: Full CRUD operations for scrap materials (Admin only)
- **💰 Value Tracking**: Automatic calculation of material values
- **📊 Dashboard**: Real-time statistics and recent items overview
- **🔍 Search & Filter**: Advanced search and category filtering
- **📱 Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **👨‍💼 Admin Panel**: User management and inventory control

## 🛠️ Tech Stack

### Backend
- **Python Flask** - Lightweight web framework
- **MongoDB** - NoSQL database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- MongoDB (local or MongoDB Atlas)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
cd d:\SAT_proj
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit .env file with your settings:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET_KEY: A secure secret key
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Database Setup

Make sure MongoDB is running:
- **Local MongoDB**: Start MongoDB service
- **MongoDB Atlas**: Update MONGODB_URI in backend/.env with your Atlas connection string

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
python app.py
```
Backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## 📖 Usage Guide

### First Time Setup

1. **Create Admin Account**
   - Register a new account via signup page
   - Manually update the user's role to 'admin' in MongoDB:
     ```javascript
     db.users.updateOne(
       { email: "admin@example.com" },
       { $set: { role: "admin" } }
     )
     ```

2. **Login as Admin**
   - Use admin credentials to access the admin panel

3. **Add Inventory Items**
   - Navigate to Admin Panel
   - Click "Add New Item"
   - Fill in item details (name, category, quantity, unit, price)
   - Total value is calculated automatically

### User Roles

**Admin:**
- Full access to inventory management (Create, Read, Update, Delete)
- User management capabilities
- Access to admin panel

**Regular User:**
- View-only access to inventory
- Can search and filter items
- Cannot modify inventory or access admin panel

## 🎨 Features Overview

### Authentication Pages
- Modern, responsive login and signup forms
- Form validation and error handling
- Secure password hashing

### Dashboard
- Total items count
- Total inventory value
- Inventory statistics
- Recent items list
- Category breakdown

### Inventory Page
- Searchable inventory list
- Category filtering
- Pagination
- Responsive table view

### Admin Panel
- **Inventory Management Tab**
  - Add new scrap items
  - Edit existing items
  - Delete items
  - View all items in table format
  
- **User Management Tab**
  - View all users
  - Change user roles
  - Delete users

## 🔒 Security Features

- JWT token-based authentication
- Bcrypt password hashing
- Protected API routes
- Role-based access control
- CORS configuration
- Token expiration handling

## 📁 Project Structure

```
SAT_proj/
├── backend/
│   ├── routes/
│   │   ├── auth.py          # Authentication routes
│   │   ├── inventory.py     # Inventory CRUD routes
│   │   └── admin.py         # Admin management routes
│   ├── middleware/
│   │   └── auth_middleware.py
│   ├── app.py               # Main Flask application
│   ├── config.py            # Configuration
│   ├── models.py            # Database models
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Inventory.js
│   │   │   └── AdminPanel.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
│
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Inventory
- `GET /api/inventory` - Get all items (with pagination/search)
- `GET /api/inventory/:id` - Get specific item
- `POST /api/inventory` - Add new item (admin only)
- `PUT /api/inventory/:id` - Update item (admin only)
- `DELETE /api/inventory/:id` - Delete item (admin only)
- `GET /api/inventory/stats` - Get inventory statistics

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id` - Update user role (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

## 🐛 Troubleshooting

**Backend won't start:**
- Check if MongoDB is running
- Verify .env file configuration
- Ensure all dependencies are installed

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check CORS settings in backend/app.py
- Ensure API base URL in frontend/src/services/api.js is correct

**Authentication issues:**
- Clear browser localStorage
- Check JWT_SECRET_KEY in backend .env
- Verify token is being sent in request headers

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Created as a scrap inventory management solution with modern web technologies.
