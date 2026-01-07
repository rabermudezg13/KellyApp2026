"""
Script para verificar y reparar la base de datos
"""
import sqlite3
from pathlib import Path
from datetime import datetime

def verify_database():
    """Verifica el estado de la base de datos y muestra estadísticas"""
    db_path = Path(__file__).parent / "kelly_app.db"
    
    if not db_path.exists():
        print("❌ Base de datos no encontrada")
        return False
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        print("=" * 60)
        print("📊 ESTADO DE LA BASE DE DATOS")
        print("=" * 60)
        
        # Verificar tabla info_sessions
        cursor.execute("SELECT COUNT(*) FROM info_sessions")
        total = cursor.fetchone()[0]
        print(f"\n📋 Total de registros en info_sessions: {total}")
        
        if total > 0:
            # Estadísticas por status
            cursor.execute("""
                SELECT 
                    status,
                    COUNT(*) as count,
                    MIN(created_at) as oldest,
                    MAX(created_at) as newest
                FROM info_sessions
                GROUP BY status
                ORDER BY count DESC
            """)
            
            print("\n📈 Registros por estado:")
            for row in cursor.fetchall():
                status, count, oldest, newest = row
                print(f"   • {status}: {count} registros")
                if oldest:
                    print(f"     - Más antiguo: {oldest}")
                if newest:
                    print(f"     - Más reciente: {newest}")
            
            # Verificar campos importantes
            cursor.execute("PRAGMA table_info(info_sessions)")
            columns = [col[1] for col in cursor.fetchall()]
            
            print("\n🔍 Campos en la tabla:")
            required_fields = ['id', 'first_name', 'last_name', 'email', 'status', 'generated_row']
            for field in required_fields:
                if field in columns:
                    print(f"   ✅ {field}")
                else:
                    print(f"   ❌ {field} - FALTA")
            
            # Mostrar últimos 10 registros
            cursor.execute("""
                SELECT id, first_name, last_name, email, status, created_at
                FROM info_sessions
                ORDER BY created_at DESC
                LIMIT 10
            """)
            
            print("\n📝 Últimos 10 registros:")
            for row in cursor.fetchall():
                id, first_name, last_name, email, status, created_at = row
                print(f"   • ID {id}: {first_name} {last_name} ({email}) - {status} - {created_at}")
        
        # Verificar otras tablas importantes
        tables = ['users', 'recruiters', 'exclusion_list', 'info_session_steps']
        print("\n📚 Otras tablas:")
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"   • {table}: {count} registros")
            except sqlite3.OperationalError:
                print(f"   • {table}: No existe")
        
        conn.close()
        print("\n" + "=" * 60)
        print("✅ Verificación completada")
        print("=" * 60)
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Error al verificar la base de datos: {e}")
        return False

if __name__ == "__main__":
    verify_database()

