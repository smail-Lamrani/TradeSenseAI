"""
Script pour créer un utilisateur admin
Exécuter avec: python create_admin.py
"""

from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Vérifier si l'admin existe déjà
    admin_email = "admin@tradesense.com"
    existing = User.query.filter_by(email=admin_email).first()
    
    if existing:
        # Mettre à jour l'utilisateur existant en admin
        existing.is_admin = True
        db.session.commit()
        print(f"✅ Utilisateur {admin_email} mis à jour en admin!")
    else:
        # Créer nouvel admin
        admin = User(
            email=admin_email,
            password_hash=generate_password_hash("admin123"),
            username="SuperAdmin",
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        print(f"✅ Admin créé avec succès!")
        print(f"   Email: {admin_email}")
        print(f"   Mot de passe: admin123")
    
    # Afficher tous les admins
    admins = User.query.filter_by(is_admin=True).all()
    print(f"\n📋 Liste des admins ({len(admins)}):")
    for a in admins:
        print(f"   - {a.email} ({a.username})")
