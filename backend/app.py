from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    # Create tables
    with app.app_context():
        db.create_all()
        print("✅ Database initialized successfully")
        print(f"🤖 Using Groq API with model: llama-3.3-70b-versatile")
    
    return app

if __name__ == '__main__':
    app = create_app()
    print(" Flask server starting...")
    print(" Backend running on: http://localhost:5000")
    app.run(debug=True, port=5000)

