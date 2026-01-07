"""
Script para verificar y corregir el usuario admin
Este script verifica si el usuario existe, prueba la contraseña y lo recrea si es necesario
"""
from app.database import SessionLocal
from app.models.user import User

def verificar_y_fix_admin():
    db = SessionLocal()
    try:
        admin_email = "cculturausallc@gmail.com"
        admin_password = "S@mti4go13"
        
        print("=" * 60)
        print("🔍 VERIFICANDO USUARIO ADMIN")
        print("=" * 60)
        
        # Buscar usuario existente
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"✅ Usuario encontrado: {admin_email}")
            print(f"   ID: {existing_admin.id}")
            print(f"   Nombre: {existing_admin.full_name}")
            print(f"   Rol: {existing_admin.role}")
            print(f"   Activo: {existing_admin.is_active}")
            print(f"   Hash guardado: {existing_admin.password_hash[:50]}...")
            
            # Probar la contraseña
            print("\n🔐 Probando contraseña...")
            try:
                password_correct = existing_admin.verify_password(admin_password)
                if password_correct:
                    print("✅ Contraseña CORRECTA")
                    print("   El usuario debería poder hacer login.")
                else:
                    print("❌ Contraseña INCORRECTA")
                    print("   Regenerando hash de contraseña...")
                    existing_admin.password_hash = User.hash_password(admin_password)
                    existing_admin.is_active = True
                    existing_admin.role = "admin"
                    db.commit()
                    print("✅ Contraseña actualizada correctamente")
            except Exception as e:
                print(f"❌ Error al verificar contraseña: {e}")
                print("   Regenerando usuario completo...")
                db.delete(existing_admin)
                db.commit()
                existing_admin = None
        
        if not existing_admin:
            print(f"\n➕ Creando nuevo usuario admin...")
            try:
                password_hash = User.hash_password(admin_password)
                print(f"   Hash generado: {password_hash[:50]}...")
                
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
                
                # Verificar que se puede verificar la contraseña
                print("\n🔐 Verificando que la contraseña funciona...")
                if admin.verify_password(admin_password):
                    print("✅ Usuario creado y contraseña verificada correctamente")
                else:
                    print("❌ ERROR: La contraseña no se puede verificar después de crear")
                    raise Exception("Password verification failed after creation")
                
                print(f"\n✅ Usuario admin creado exitosamente:")
                print(f"   Email: {admin_email}")
                print(f"   Password: {admin_password}")
                print(f"   ID: {admin.id}")
                
            except Exception as e:
                print(f"❌ Error al crear usuario: {e}")
                db.rollback()
                raise
        
        print("\n" + "=" * 60)
        print("✅ VERIFICACIÓN COMPLETA")
        print("=" * 60)
        print(f"\n📝 Credenciales para login:")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"\n🚀 Ahora puedes intentar hacer login de nuevo.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    verificar_y_fix_admin()

