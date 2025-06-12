from database import engine, SessionLocal
from models import Base, User
from auth import get_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create admin user if it doesn't exist
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash(admin_password),
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print(f"Created admin user with email: {admin_email}")
        else:
            print("Admin user already exists")
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialization complete!") 