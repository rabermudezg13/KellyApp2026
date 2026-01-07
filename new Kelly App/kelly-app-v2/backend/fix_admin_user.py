"""
Script to fix admin user if there are password issues
This will delete the existing admin user and create a new one with the correct password
"""
from app.database import SessionLocal
from app.models.user import User

def fix_admin_user():
    db = SessionLocal()
    try:
        admin_email = "cculturausallc@gmail.com"
        admin_password = "S@mti4go13"
        
        # Delete existing admin user if it exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            print(f"🗑️  Deleting existing admin user: {admin_email}")
            db.delete(existing_admin)
            db.commit()
        
        # Create new admin user
        print(f"➕ Creating new admin user: {admin_email}")
        password_hash = User.hash_password(admin_password)
        admin = User(
            email=admin_email,
            password_hash=password_hash,
            full_name="Admin User",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"✅ Admin user created successfully: {admin_email}")
        print(f"   Password: {admin_password}")
        
    except Exception as e:
        print(f"❌ Error fixing admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin_user()

