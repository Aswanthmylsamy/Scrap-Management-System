from pymongo import MongoClient
from config import Config
import sys

try:
    print(f"Connecting to MongoDB Atlas...")
    print(f"URI: {Config.MONGODB_URI[:40]}...")
    client = MongoClient(Config.MONGODB_URI, serverSelectionTimeoutMS=5000)
    
    # Trigger connection
    server_info = client.server_info()
    print(f"✅ MongoDB Atlas is CONNECTED")
    print(f"   Server version: {server_info.get('version', 'unknown')}")
    
    # List databases
    db_names = client.list_database_names()
    print(f"   Databases: {db_names}")
    
    # Check scrap_inventory database
    db = client.get_database('scrap_inventory')
    collections = db.list_collection_names()
    print(f"   Collections in 'scrap_inventory': {collections}")
    
except Exception as e:
    print(f"❌ MongoDB Atlas error: {e}")
    sys.exit(1)
