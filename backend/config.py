import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

load_dotenv()

class Config:
    """Application configuration"""
    MONGODB_URI = os.getenv('MONGO_URI')  # ✅ FIXED HERE
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-please-change')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000')
    JWT_ACCESS_TOKEN_EXPIRES = 3600

# 🔴 Add safety check
if not Config.MONGODB_URI:
    raise Exception("❌ MONGO_URI is not set in environment variables")

# MongoDB connection
client = MongoClient(Config.MONGODB_URI, tlsCAFile=certifi.where())
db = client.get_database('scrap_inventory')