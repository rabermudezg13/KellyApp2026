"""
User service for initializing default users
"""
from sqlalchemy.orm import Session
from app.models.user import User

def initialize_default_admin(db: Session):
    """
    Initialize default admin user if it doesn't exist
    Also updates password if user exists (to ensure correct password)
    """
    admin_email = "cculturausallc@gmail.com"
    admin_password = "S@nti4go13"
    
    try:
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if not existing_admin:
            # Create new admin user
            try:
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
                print(f"✅ Default admin user created: {admin_email}")
            except Exception as e:
                print(f"⚠️  Could not create admin user: {e}")
                db.rollback()
        else:
            # Update password to ensure it's correct
            try:
                # Always update password to ensure it's correct
                existing_admin.password_hash = User.hash_password(admin_password)
                existing_admin.is_active = True
                existing_admin.role = "admin"
                db.commit()
                print(f"✅ Admin user updated: {admin_email}")
            except Exception as e:
                print(f"⚠️  Could not update admin user: {e}")
                db.rollback()
    except Exception as e:
        print(f"⚠️  Error initializing admin user (non-critical): {e}")
        db.rollback()
        # Don't raise - let the server start anyway

