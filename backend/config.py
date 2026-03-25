import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

load_dotenv()

class Config:
    """Application configuration"""
    MONGODB_URI = os.getenv('MONGODB_URI')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-please-change')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour in seconds

# Centralized MongoDB connection with TLS support for Atlas
client = MongoClient(Config.MONGODB_URI, tlsCAFile=certifi.where())
db = client.get_database('scrap_inventory')

