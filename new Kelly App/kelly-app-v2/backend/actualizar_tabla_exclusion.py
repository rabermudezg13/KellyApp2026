"""
Script para actualizar la tabla exclusion_list con las nuevas columnas
"""
from app.database import SessionLocal, engine
from sqlalchemy import text
from app.models.exclusion_list import ExclusionList
from app.database import Base

def actualizar_tabla_exclusion():
    """Agregar las nuevas columnas a la tabla exclusion_list si no existen"""
    db = SessionLocal()
    try:
        # Verificar si las columnas existen
        inspector = engine.dialect.get_columns(engine, "exclusion_list")
        columnas_existentes = [col['name'] for col in inspector]
        
        print("Columnas existentes:", columnas_existentes)
        
        # Agregar columnas si no existen
        if 'code' not in columnas_existentes:
            print("Agregando columna 'code'...")
            db.execute(text("ALTER TABLE exclusion_list ADD COLUMN code VARCHAR(50)"))
            db.commit()
            print("✅ Columna 'code' agregada")
        
        if 'dob' not in columnas_existentes:
            print("Agregando columna 'dob'...")
            db.execute(text("ALTER TABLE exclusion_list ADD COLUMN dob DATE"))
            db.commit()
            print("✅ Columna 'dob' agregada")
        
        if 'ssn' not in columnas_existentes:
            print("Agregando columna 'ssn'...")
            db.execute(text("ALTER TABLE exclusion_list ADD COLUMN ssn VARCHAR(20)"))
            db.commit()
            print("✅ Columna 'ssn' agregada")
        
        print("\n✅ Tabla exclusion_list actualizada correctamente")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        # Si hay error, intentar recrear la tabla
        print("\n🔄 Intentando recrear la tabla...")
        try:
            db.execute(text("DROP TABLE IF EXISTS exclusion_list"))
            db.commit()
            Base.metadata.create_all(bind=engine, tables=[ExclusionList.__table__])
            print("✅ Tabla exclusion_list recreada correctamente")
        except Exception as e2:
            print(f"❌ Error al recrear tabla: {e2}")
            raise
    finally:
        db.close()

if __name__ == "__main__":
    actualizar_tabla_exclusion()

