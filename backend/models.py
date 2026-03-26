from datetime import datetime
from bson import ObjectId

# =========================
# USER MODEL
# =========================
class User:
    """User model for MongoDB"""

    @staticmethod
    def create(username, email, password_hash, role='user'):
        """Create a new user document"""
        return {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'role': role,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

    @staticmethod
    def serialize(user):
        """Convert User document to JSON"""
        if user:
            return {
                "_id": str(user.get("_id")),
                "username": user.get("username") or user.get("name"),
                "email": user.get("email") or user.get("email_id"),
                "role": user.get("role", "user"),
                "created_at": user.get("created_at"),
                "updated_at": user.get("updated_at")
            }
        return None


# =========================
# SCRAP ITEM MODEL
# =========================
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

        for key, value in kwargs.items():
            if value is not None:
                update_doc[key] = value

        if quantity is not None:
            update_doc['quantity'] = float(quantity)
        if unit_price is not None:
            update_doc['unit_price'] = float(unit_price)

        return update_doc

    @staticmethod
    def serialize(item):
        """Convert ScrapItem document to JSON"""
        if item:
            return {
                "_id": str(item.get("_id")),
                "name": item.get("name"),
                "category": item.get("category"),
                "quantity": float(item.get("quantity", 0)),
                "unit": item.get("unit"),
                "unit_price": float(item.get("unit_price", 0)),
                "total_value": float(item.get("total_value", 0)),
                "description": item.get("description"),
                "date_added": item.get("date_added"),
                "last_updated": item.get("last_updated"),
                "updated_by": str(item.get("updated_by")) if item.get("updated_by") else None
            }
        return None

