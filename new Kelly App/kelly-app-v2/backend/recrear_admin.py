"""
Script para eliminar y recrear el usuario admin
"""
from app.database import SessionLocal
from app.models.user import User

def recrear_admin():
    db = SessionLocal()
    try:
        admin_email = "cculturausallc@gmail.com"
        admin_password = "S@nti4go13"  # Nueva contraseña
        
        print("=" * 60)
        print("🗑️  ELIMINANDO USUARIO ADMIN EXISTENTE")
        print("=" * 60)
        
        # Buscar y eliminar usuario existente
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            print(f"✅ Usuario encontrado: {admin_email}")
            print(f"   Eliminando...")
            db.delete(existing_admin)
            db.commit()
            print(f"✅ Usuario eliminado correctamente")
        else:
            print(f"ℹ️  No se encontró usuario existente")
        
        print("\n" + "=" * 60)
        print("➕ CREANDO NUEVO USUARIO ADMIN")
        print("=" * 60)
        
        # Crear nuevo usuario admin
        password_hash = User.hash_password(admin_password)
        print(f"✅ Hash de contraseña generado")
        
        admin = User(
            email=admin_email,
            password_hash=password_hash,
            full_name="Admin User",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        # Verificar que la contraseña funciona
        print(f"\n🔐 Verificando contraseña...")
        if admin.verify_password(admin_password):
            print(f"✅ Contraseña verificada correctamente")
        else:
            print(f"❌ ERROR: La contraseña no se puede verificar")
            raise Exception("Password verification failed")
        
        print("\n" + "=" * 60)
        print("✅ USUARIO ADMIN CREADO EXITOSAMENTE")
        print("=" * 60)
        print(f"\n📝 Credenciales:")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   ID: {admin.id}")
        print(f"   Rol: {admin.role}")
        print(f"   Activo: {admin.is_active}")
        print(f"\n🚀 Ahora puedes hacer login con estas credenciales.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    recrear_admin()

