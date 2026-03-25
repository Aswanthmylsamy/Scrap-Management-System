from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from bson import ObjectId
from config import Config, db
from models import ScrapItem
from middleware.auth_middleware import jwt_required_custom, admin_required

# Create blueprint
inventory_bp = Blueprint('inventory', __name__)

# MongoDB collections
inventory_collection = db.scrap_inventory


@inventory_bp.route('', methods=['GET'])
@jwt_required_custom
def get_all_items():
    """Get all inventory items with pagination and search"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        sort_by = request.args.get('sort_by', 'date_added')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}}
            ]
        if category:
            query['category'] = category
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Sort order
        sort_direction = -1 if sort_order == 'desc' else 1
        
        # Get total count
        total = inventory_collection.count_documents(query)
        
        # Get items
        items = list(inventory_collection.find(query)
                    .sort(sort_by, sort_direction)
                    .skip(skip)
                    .limit(limit))
        
        # Serialize items
        serialized_items = [ScrapItem.serialize(item) for item in items]
        
        return jsonify({
            'items': serialized_items,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch items', 'message': str(e)}), 500


@inventory_bp.route('/<item_id>', methods=['GET'])
@jwt_required_custom
def get_item(item_id):
    """Get a specific inventory item"""
    try:
        item = inventory_collection.find_one({'_id': ObjectId(item_id)})
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        return jsonify({'item': ScrapItem.serialize(item)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch item', 'message': str(e)}), 500


@inventory_bp.route('', methods=['POST'])
@admin_required
def add_item():
    """Add a new inventory item (admin only)"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        # Validate required fields
        required_fields = ['name', 'category', 'quantity', 'unit', 'unit_price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create item
        item_doc = ScrapItem.create(
            name=data['name'],
            category=data['category'],
            quantity=data['quantity'],
            unit=data['unit'],
            unit_price=data['unit_price'],
            description=data.get('description', ''),
            updated_by=current_user_id
        )
        
        result = inventory_collection.insert_one(item_doc)
        item_doc['_id'] = result.inserted_id
        
        return jsonify({
            'message': 'Item added successfully',
            'item': ScrapItem.serialize(item_doc)
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to add item', 'message': str(e)}), 500


@inventory_bp.route('/<item_id>', methods=['PUT'])
@admin_required
def update_item(item_id):
    """Update an inventory item (admin only)"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        # Build update document
        update_fields = {}
        allowed_fields = ['name', 'category', 'quantity', 'unit', 'unit_price', 'description']
        
        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]
        
        # Recalculate total_value if quantity or unit_price changed
        item = inventory_collection.find_one({'_id': ObjectId(item_id)})
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        quantity = float(data.get('quantity', item['quantity']))
        unit_price = float(data.get('unit_price', item['unit_price']))
        update_fields['total_value'] = quantity * unit_price
        update_fields['last_updated'] = ScrapItem.update()['last_updated']
        update_fields['updated_by'] = ObjectId(current_user_id)
        
        # Update item
        result = inventory_collection.update_one(
            {'_id': ObjectId(item_id)},
            {'$set': update_fields}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400
        
        # Get updated item
        updated_item = inventory_collection.find_one({'_id': ObjectId(item_id)})
        
        return jsonify({
            'message': 'Item updated successfully',
            'item': ScrapItem.serialize(updated_item)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update item', 'message': str(e)}), 500


@inventory_bp.route('/<item_id>', methods=['DELETE'])
@admin_required
def delete_item(item_id):
    """Delete an inventory item (admin only)"""
    try:
        result = inventory_collection.delete_one({'_id': ObjectId(item_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Item not found'}), 404
        
        return jsonify({'message': 'Item deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to delete item', 'message': str(e)}), 500


@inventory_bp.route('/stats', methods=['GET'])
@jwt_required_custom
def get_stats():
    """Get inventory statistics"""
    try:
        # Total items
        total_items = inventory_collection.count_documents({})
        
        # Total value
        pipeline = [
            {
                '$group': {
                    '_id': None,
                    'total_value': {'$sum': '$total_value'},
                    'total_quantity': {'$sum': '$quantity'}
                }
            }
        ]
        
        stats = list(inventory_collection.aggregate(pipeline))
        total_value = stats[0]['total_value'] if stats else 0
        total_quantity = stats[0]['total_quantity'] if stats else 0
        
        # Category breakdown
        category_pipeline = [
            {
                '$group': {
                    '_id': '$category',
                    'count': {'$sum': 1},
                    'total_value': {'$sum': '$total_value'}
                }
            }
        ]
        
        categories = list(inventory_collection.aggregate(category_pipeline))
        
        return jsonify({
            'total_items': total_items,
            'total_value': total_value,
            'total_quantity': total_quantity,
            'categories': categories
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch statistics', 'message': str(e)}), 500
