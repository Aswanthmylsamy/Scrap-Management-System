from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from bson import ObjectId
from config import db

# Mongo collection
users_collection = db.users


def jwt_required_custom(fn):
    """Custom JWT required decorator with better error handling"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'error': 'Invalid or expired token',
                'message': str(e)
            }), 401
    return wrapper


def admin_required(fn):
    """Decorator to require admin role (checked from DB, not JWT)"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()

            # Get user ID from token
            user_id = get_jwt_identity()

            # Fetch latest user from DB
            user = users_collection.find_one({"_id": ObjectId(user_id)})

            if not user:
                return jsonify({'error': 'User not found'}), 404

            # Check role from DB
            if user.get('role') != 'admin':
                return jsonify({'error': 'Admin access required'}), 403

            return fn(*args, **kwargs)

        except Exception as e:
            return jsonify({
                'error': 'Authentication failed',
                'message': str(e)
            }), 401

    return wrapper