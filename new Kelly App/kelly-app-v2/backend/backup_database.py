"""
Script para hacer backup de la base de datos antes de cambios importantes
"""
import sqlite3
import shutil
from pathlib import Path
from datetime import datetime

def backup_database():
    """Crea un backup de la base de datos"""
    db_path = Path(__file__).parent / "kelly_app.db"
    
    if not db_path.exists():
        print("❌ Base de datos no encontrada")
        return False
    
    # Crear directorio de backups si no existe
    backup_dir = Path(__file__).parent / "backups"
    backup_dir.mkdir(exist_ok=True)
    
    # Nombre del backup con timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"kelly_app_backup_{timestamp}.db"
    
    try:
        # Copiar la base de datos
        shutil.copy2(db_path, backup_path)
        print(f"✅ Backup creado: {backup_path}")
        
        # También mantener el último backup como "latest"
        latest_backup = backup_dir / "kelly_app_latest.db"
        shutil.copy2(db_path, latest_backup)
        print(f"✅ Último backup guardado como: {latest_backup}")
        
        return True
    except Exception as e:
        print(f"❌ Error al crear backup: {e}")
        return False

if __name__ == "__main__":
    backup_database()

