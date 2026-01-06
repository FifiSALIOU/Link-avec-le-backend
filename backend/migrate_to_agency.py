"""
Script de migration : remplace 'department' par 'agency' dans la base de données
"""
from sqlalchemy import text
from app.database import engine, SessionLocal
from app import models

def migrate_database():
    """Migre la base de données de 'department' à 'agency'"""
    db = SessionLocal()
    try:
        print("Début de la migration...")
        
        # Vérifier si la colonne 'department' existe dans la table users
        with engine.connect() as conn:
            # Vérifier les colonnes existantes
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name IN ('department', 'agency')
            """))
            columns = [row[0] for row in result]
            
            if 'department' in columns and 'agency' not in columns:
                print("Migration de 'department' vers 'agency' dans la table 'users'...")
                conn.execute(text("ALTER TABLE users RENAME COLUMN department TO agency"))
                conn.commit()
                print("OK - Colonne 'department' renommee en 'agency' dans 'users'")
            elif 'agency' in columns:
                print("OK - La colonne 'agency' existe deja dans 'users'")
            else:
                print("ATTENTION - Aucune colonne 'department' ou 'agency' trouvee dans 'users'")
            
            # Vérifier les colonnes existantes dans tickets
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'tickets' AND column_name IN ('user_department', 'user_agency')
            """))
            columns = [row[0] for row in result]
            
            if 'user_department' in columns and 'user_agency' not in columns:
                print("Migration de 'user_department' vers 'user_agency' dans la table 'tickets'...")
                conn.execute(text("ALTER TABLE tickets RENAME COLUMN user_department TO user_agency"))
                conn.commit()
                print("OK - Colonne 'user_department' renommee en 'user_agency' dans 'tickets'")
            elif 'user_agency' in columns:
                print("OK - La colonne 'user_agency' existe deja dans 'tickets'")
            else:
                print("⚠ Aucune colonne 'user_department' ou 'user_agency' trouvée dans 'tickets'")
        
        print("\nMigration terminée avec succès !")
        
    except Exception as e:
        print(f"ERREUR lors de la migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_database()

