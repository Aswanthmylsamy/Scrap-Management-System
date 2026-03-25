from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from bson import ObjectId
import bcrypt
from config import Config, db
from models import User
from middleware.auth_middleware import jwt_required_custom

# Create blueprint
auth_bp = Blueprint('auth', __name__)

# MongoDB collections
users_collection = db.users

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'Email already registered'}), 400
        
        if users_collection.find_one({'username': data['username']}):
            return jsonify({'error': 'Username already taken'}), 400
        
        # Hash password
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Create user (default role is 'user')
        user_doc = User.create(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash.decode('utf-8'),
            role='user'
        )
        
        result = users_collection.insert_one(user_doc)
        
        # Create access token
        additional_claims = {'role': user_doc['role']}
        access_token = create_access_token(
            identity=str(result.inserted_id),
            additional_claims=additional_claims
        )
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': {
                'id': str(result.inserted_id),
                'username': data['username'],
                'email': data['email'],
                'role': user_doc['role']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Registration failed', 'message': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': data['email']})
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create access token
        additional_claims = {'role': user['role']}
        access_token = create_access_token(
            identity=str(user['_id']),
            additional_claims=additional_claims
        )
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'message': str(e)}), 500


@auth_bp.route('/profile', methods=['GET'])
@jwt_required_custom
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(current_user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': User.serialize(user)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get profile', 'message': str(e)}), 500
