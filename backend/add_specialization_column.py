"""
Script pour ajouter la colonne specialization à la table users
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = (
    f"postgresql://{os.getenv('POSTGRES_USER', 'tickets_user')}:"
    f"{os.getenv('POSTGRES_PASSWORD', 'password')}@"
    f"{os.getenv('POSTGRES_HOST', 'localhost')}:"
    f"{os.getenv('POSTGRES_PORT', '5432')}/"
    f"{os.getenv('POSTGRES_DB', 'tickets_db')}"
)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def add_specialization_column():
    db = Session()
    try:
        print("Ajout de la colonne 'specialization' à la table 'users'...")
        
        # Vérifier si la colonne existe déjà
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='specialization';
        """)
        result = db.execute(check_query).fetchone()
        
        if result:
            print("OK - La colonne 'specialization' existe déjà dans 'users'")
        else:
            # Ajouter la colonne
            db.execute(text("ALTER TABLE users ADD COLUMN specialization VARCHAR(50);"))
            db.commit()
            print("OK - Colonne 'specialization' ajoutée avec succès")
        
        print("\nMigration terminée avec succès !")

    except Exception as e:
        db.rollback()
        print(f"ERREUR lors de la migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_specialization_column()

