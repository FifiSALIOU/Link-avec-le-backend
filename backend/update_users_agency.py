"""
Script pour mettre à jour les agences des utilisateurs existants
"""
from app.database import SessionLocal
from app import models

def update_users_agency():
    """Met à jour les agences des utilisateurs de test"""
    db = SessionLocal()
    try:
        print("Mise a jour des agences des utilisateurs...")
        
        # Mettre à jour les utilisateurs existants
        users_to_update = {
            "user1": "Agence Paris",
            "tech1": "Agence IT",
            "tech2": "Agence IT",
            "secretary1": "Agence IT",
            "adjoint1": "Agence IT",
            "dsi1": "Agence IT",
            "admin": "Agence IT"
        }
        
        for username, agency in users_to_update.items():
            user = db.query(models.User).filter(models.User.username == username).first()
            if user:
                user.agency = agency
                print(f"OK - {username} -> {agency}")
        
        db.commit()
        print("\nMise a jour terminee avec succes !")
        
    except Exception as e:
        print(f"ERREUR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_users_agency()

