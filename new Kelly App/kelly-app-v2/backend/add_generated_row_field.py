"""
Script para agregar el campo generated_row a la tabla info_sessions
sin perder datos existentes
"""
import sqlite3
import os
from pathlib import Path

def add_generated_row_field():
    """Agrega el campo generated_row a la tabla info_sessions si no existe"""
    db_path = Path(__file__).parent / "kelly_app.db"
    
    if not db_path.exists():
        print("❌ Base de datos no encontrada. Se creará automáticamente al iniciar el servidor.")
        return
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Verificar si el campo ya existe
        cursor.execute("PRAGMA table_info(info_sessions)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'generated_row' in columns:
            print("✅ El campo 'generated_row' ya existe en la tabla info_sessions")
        else:
            print("📝 Agregando campo 'generated_row' a la tabla info_sessions...")
            cursor.execute("ALTER TABLE info_sessions ADD COLUMN generated_row TEXT")
            conn.commit()
            print("✅ Campo 'generated_row' agregado exitosamente")
        
        # Verificar cuántos registros hay
        cursor.execute("SELECT COUNT(*) FROM info_sessions")
        count = cursor.fetchone()[0]
        print(f"📊 Total de registros en info_sessions: {count}")
        
        conn.close()
        print("✅ Proceso completado")
        
    except sqlite3.Error as e:
        print(f"❌ Error al modificar la base de datos: {e}")
        return False
    
    return True

if __name__ == "__main__":
    add_generated_row_field()

