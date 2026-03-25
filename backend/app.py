from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from config import Config
import os

# Import blueprints
from routes.auth import auth_bp
from routes.inventory import inventory_bp
from routes.admin import admin_bp
from routes.market import market_bp, refresh_all_prices

# Create Flask app
app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)

# ✅ SINGLE CLEAN CORS CONFIG (NO CONFLICTS)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# JWT setup
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(market_bp, url_prefix='/api/market')

# Scheduler
def start_scheduler():
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.interval import IntervalTrigger

        scheduler = BackgroundScheduler(daemon=True)
        scheduler.add_job(
            func=refresh_all_prices,
            trigger=IntervalTrigger(hours=6),
            id='refresh_market_prices',
            replace_existing=True,
            max_instances=1,
        )
        scheduler.start()
        print("✓ Market price scheduler started")
    except Exception as e:
        print(f"⚠ Scheduler error: {e}")

# Root endpoint
@app.route('/')
def index():
    return jsonify({
        'message': 'Scrap Inventory Management API',
        'version': '2.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'inventory': '/api/inventory',
            'admin': '/api/admin',
            'market': '/api/market',
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is missing'}), 401

# Run app
if __name__ == '__main__':
    print("=" * 50)
    print("Scrap Inventory API Running on Render")
    print("=" * 50)

    start_scheduler()

    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)