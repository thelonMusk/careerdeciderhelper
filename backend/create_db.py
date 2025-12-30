from app import create_app
from models import db

# Create the Flask app instance using the factory function
app = create_app()

# Run inside the app context so SQLAlchemy knows what app it belongs to
with app.app_context():
    db.create_all()
    print("✅ Database recreated successfully.")
