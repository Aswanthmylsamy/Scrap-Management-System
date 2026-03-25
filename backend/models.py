from datetime import datetime
from bson import ObjectId

class User:
    """User model for MongoDB"""
    
    @staticmethod
    def create(username, email, password_hash, role='user'):
        """Create a new user document"""
        return {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'role': role,  # 'admin' or 'user'
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
    
    @staticmethod
    def serialize(user):
        """Convert MongoDB document to JSON-serializable dict"""
        if user:
            user['_id'] = str(user['_id'])
            # Don't send password hash to client
            user.pop('password_hash', None)
            return user
        return None


class ScrapItem:
    """Scrap inventory item model"""
    
    @staticmethod
    def create(name, category, quantity, unit, unit_price, description='', updated_by=None):
        """Create a new scrap item document"""
        quantity = float(quantity)
        unit_price = float(unit_price)
        total_value = quantity * unit_price
        
        return {
            'name': name,
            'category': category,
            'quantity': quantity,
            'unit': unit,
            'unit_price': unit_price,
            'total_value': total_value,
            'description': description,
            'date_added': datetime.utcnow(),
            'last_updated': datetime.utcnow(),
            'updated_by': ObjectId(updated_by) if updated_by else None
        }
    
    @staticmethod
    def update(quantity=None, unit_price=None, **kwargs):
        """Prepare update document"""
        update_doc = {'last_updated': datetime.utcnow()}
        
        # Add all provided fields
        for key, value in kwargs.items():
            if value is not None:
                update_doc[key] = value
        
        # Handle quantity and unit_price updates
        if quantity is not None:
            update_doc['quantity'] = float(quantity)
        if unit_price is not None:
            update_doc['unit_price'] = float(unit_price)
        
        return update_doc
    
    @staticmethod
    def serialize(item):
        """Convert MongoDB document to JSON-serializable dict"""
        if item:
            item['_id'] = str(item['_id'])
            if 'updated_by' in item and item['updated_by']:
                item['updated_by'] = str(item['updated_by'])
            return item
        return None
