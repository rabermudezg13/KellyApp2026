"""
Kelly Education Front Desk - Backend API
FastAPI application running on port 3026
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.api import info_session, admin, announcements, info_session_config, new_hire_orientation_config, recruiter, auth, visits, exclusion_list, row_template
from app.database import engine, Base, SessionLocal
from app.services.user_service import initialize_default_admin
import sqlite3
from pathlib import Path

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure generated_row field exists in info_sessions table (migration)
try:
    db_path = Path(__file__).parent / "kelly_app.db"
    if db_path.exists():
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(info_sessions)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'generated_row' not in columns:
            print("📝 Agregando campo 'generated_row' a la tabla info_sessions...")
            cursor.execute("ALTER TABLE info_sessions ADD COLUMN generated_row TEXT")
            conn.commit()
            print("✅ Campo 'generated_row' agregado exitosamente")
        conn.close()
except Exception as e:
    print(f"⚠️  Warning: Could not add generated_row field: {e}")
    print("   The field will be added automatically on next database creation.")

# Initialize default admin user (non-blocking)
try:
    db = SessionLocal()
    try:
        initialize_default_admin(db)
    finally:
        db.close()
except Exception as e:
    print(f"⚠️  Warning: Could not initialize admin user: {e}")
    print("   You can create the admin user manually later or fix the database.")

app = FastAPI(
    title="Kelly Education Front Desk API",
    description="Backend API for Kelly Education Miami Dade Front Desk",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3025",
        "http://127.0.0.1:3025",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(info_session.router, prefix="/api/info-session", tags=["Info Session"])
app.include_router(visits.router, prefix="/api/visits", tags=["Visits"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["Announcements"])
app.include_router(info_session_config.router, prefix="/api/info-session-config", tags=["Info Session Config"])
app.include_router(new_hire_orientation_config.router, prefix="/api/new-hire-orientation-config", tags=["New Hire Orientation Config"])
app.include_router(recruiter.router, prefix="/api/recruiter", tags=["Recruiter"])
app.include_router(exclusion_list.router, prefix="/api/exclusion-list", tags=["Exclusion List"])
app.include_router(row_template.router, prefix="/api/row-template", tags=["Row Template"])

@app.get("/")
async def root():
    return {"message": "Kelly Education Front Desk API v2.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3026, reload=True)

