"""
Script para actualizar los nombres de los reclutadores en la base de datos
"""
import sqlite3
from pathlib import Path

def update_recruiters():
    """Actualiza los nombres de los reclutadores con los nombres correctos"""
    db_path = Path(__file__).parent / "kelly_app.db"
    
    if not db_path.exists():
        print("❌ Base de datos no encontrada")
        return False
    
    # Mapeo de nombres antiguos a nuevos (por si hay variaciones)
    recruiters = [
        {"name": "Nicolette Rose", "email": "nicolette.rose@kellyeducation.com", "initials": "NR"},
        {"name": "Rodrigo Bermudez", "email": "rodrigo.bermudez@kellyeducation.com", "initials": "RB"},
        {"name": "Miccael Val", "email": "miccael.val@kellyeducation.com", "initials": "MV"},
        {"name": "Demetrius Lee", "email": "demetrius.lee@kellyeducation.com", "initials": "DL"},
        {"name": "Jorge Silva", "email": "jorge.silva@kellyeducation.com", "initials": "JS"},
    ]
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Verificar cuántos reclutadores existen
        cursor.execute("SELECT COUNT(*) FROM recruiters")
        existing_count = cursor.fetchone()[0]
        
        print(f"📊 Reclutadores existentes: {existing_count}")
        
        if existing_count == 0:
            # Crear los 5 reclutadores
            print("📝 Creando 5 reclutadores...")
            for i, recruiter in enumerate(recruiters, 1):
                cursor.execute("""
                    INSERT INTO recruiters (name, email, is_active, status, created_at)
                    VALUES (?, ?, 1, 'available', datetime('now'))
                """, (recruiter["name"], recruiter["email"]))
                print(f"   ✅ Creado: {recruiter['name']} ({recruiter['initials']})")
        else:
            # Actualizar o crear reclutadores
            print("📝 Actualizando reclutadores...")
            
            # Obtener reclutadores existentes
            cursor.execute("SELECT id, name, email FROM recruiters ORDER BY id")
            existing = cursor.fetchall()
            
            # Actualizar los primeros 5 o crear nuevos
            for i, recruiter in enumerate(recruiters):
                if i < len(existing):
                    # Actualizar existente
                    recruiter_id, old_name, old_email = existing[i]
                    cursor.execute("""
                        UPDATE recruiters 
                        SET name = ?, email = ?, is_active = 1, status = 'available'
                        WHERE id = ?
                    """, (recruiter["name"], recruiter["email"], recruiter_id))
                    print(f"   ✅ Actualizado ID {recruiter_id}: {old_name} → {recruiter['name']} ({recruiter['initials']})")
                else:
                    # Crear nuevo
                    cursor.execute("""
                        INSERT INTO recruiters (name, email, is_active, status, created_at)
                        VALUES (?, ?, 1, 'available', datetime('now'))
                    """, (recruiter["name"], recruiter["email"]))
                    print(f"   ✅ Creado: {recruiter['name']} ({recruiter['initials']})")
            
            # Si hay más de 5, desactivar los extras
            if len(existing) > 5:
                extra_ids = [r[0] for r in existing[5:]]
                cursor.execute(f"""
                    UPDATE recruiters 
                    SET is_active = 0 
                    WHERE id IN ({','.join('?' * len(extra_ids))})
                """, extra_ids)
                print(f"   ⚠️  Desactivados {len(extra_ids)} reclutadores adicionales")
        
        conn.commit()
        
        # Mostrar resultado final
        cursor.execute("SELECT id, name, email, status, is_active FROM recruiters ORDER BY id")
        final_recruiters = cursor.fetchall()
        
        print("\n📋 Reclutadores finales:")
        for recruiter_id, name, email, status, is_active in final_recruiters:
            active_status = "✅ Activo" if is_active else "❌ Inactivo"
            print(f"   • ID {recruiter_id}: {name} ({email}) - {status} - {active_status}")
        
        conn.close()
        print("\n✅ Reclutadores actualizados exitosamente")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Error al actualizar reclutadores: {e}")
        return False

if __name__ == "__main__":
    update_recruiters()

