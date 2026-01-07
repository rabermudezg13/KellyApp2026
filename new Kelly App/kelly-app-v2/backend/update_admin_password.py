"""
Script to update admin password
Run this if the admin user already exists with the old password
"""
from app.database import SessionLocal
from app.models.user import User

def update_admin_password():
    db = SessionLocal()
    try:
        admin_email = "cculturausallc@gmail.com"
        new_password = "S@mti4go13"
        
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if admin:
            admin.password_hash = User.hash_password(new_password)
            db.commit()
            print(f"✅ Admin password updated successfully for: {admin_email}")
        else:
            print(f"❌ Admin user not found: {admin_email}")
    except Exception as e:
        print(f"❌ Error updating password: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_admin_password()


