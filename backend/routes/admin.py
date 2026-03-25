from flask import Blueprint, request, jsonify
from bson import ObjectId
from config import Config, db
from models import User
from middleware.auth_middleware import admin_required

# Create blueprint
admin_bp = Blueprint('admin', __name__)

# MongoDB collections
users_collection = db.users


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users (admin only)"""
    try:
        users = list(users_collection.find())
        serialized_users = [User.serialize(user) for user in users]
        
        return jsonify({'users': serialized_users}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users', 'message': str(e)}), 500


@admin_bp.route('/users/<user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user role (admin only)"""
    try:
        data = request.get_json()
        
        if 'role' not in data:
            return jsonify({'error': 'Role is required'}), 400
        
        if data['role'] not in ['admin', 'user']:
            return jsonify({'error': 'Invalid role. Must be "admin" or "user"'}), 400
        
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': data['role']}}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'User not found or no changes made'}), 404
        
        updated_user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        return jsonify({
            'message': 'User updated successfully',
            'user': User.serialize(updated_user)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update user', 'message': str(e)}), 500


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user (admin only)"""
    try:
        result = users_collection.delete_one({'_id': ObjectId(user_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to delete user', 'message': str(e)}), 500
