from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import enum
import bcrypt
from app.database import Base

# Use bcrypt directly instead of passlib to avoid initialization issues

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    FRONTDESK = "frontdesk"
    RECRUITER = "recruiter"
    TALENT = "talent"
    MANAGEMENT = "management"
    USER = "user"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # admin, frontdesk, recruiter, talent, management, user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt. Bcrypt has a 72 byte limit, so we truncate if necessary."""
        if not password:
            raise ValueError("Password cannot be empty")
        
        # Convert to bytes and truncate to 72 bytes if needed
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        # Hash using bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        # Return as string (decode from bytes)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str) -> bool:
        """Verify a password using bcrypt. Bcrypt has a 72 byte limit, so we truncate if necessary."""
        if not password:
            return False
        try:
            # Truncate password to 72 bytes if needed (same as hash_password)
            password_bytes = password.encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]
            
            # Get stored hash as bytes
            stored_hash = self.password_hash.encode('utf-8')
            
            # Verify using bcrypt
            return bcrypt.checkpw(password_bytes, stored_hash)
        except Exception as e:
            # If verification fails due to any error, return False
            return False


