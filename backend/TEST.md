# Guide de Test de l'Application

## 1. Tester le Backend (API)

### Lancer le serveur backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Le serveur sera accessible sur `http://localhost:8000`

### Tester avec Swagger UI (Interface graphique)
1. Ouvre ton navigateur
2. Va sur `http://localhost:8000/docs`
3. Tu verras toutes les API disponibles avec une interface interactive

### Tester avec des requêtes HTTP

#### 1. Se connecter (obtenir un token)
```bash
POST http://localhost:8000/auth/token
Content-Type: application/x-www-form-urlencoded

username=admin
password=admin123
```

Réponse attendue :
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### 2. Créer un ticket (nécessite un token)
```bash
POST http://localhost:8000/tickets/
Authorization: Bearer {ton_token}
Content-Type: application/json

{
  "title": "Problème imprimante",
  "description": "L'imprimante ne fonctionne plus",
  "type": "materiel",
  "priority": "haute"
}
```

#### 3. Voir mes tickets
```bash
GET http://localhost:8000/tickets/me
Authorization: Bearer {ton_token}
```

#### 4. Voir tous les tickets (admin/secrétaire)
```bash
GET http://localhost:8000/tickets/
Authorization: Bearer {ton_token}
```

---

## 2. Tester le Frontend

### Lancer le serveur frontend
```powershell
cd frontend/ticket-frontend
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173` (ou un autre port)

### Tester la connexion
1. Ouvre `http://localhost:5173`
2. Tu verras la page de connexion
3. Connecte-toi avec :
   - Username : `admin`
   - Password : `admin123`

### Tester les différentes pages
- Page de connexion : `/`
- Dashboard utilisateur : `/dashboard/user`
- Dashboard secrétaire : `/dashboard/secretary`
- Dashboard technicien : `/dashboard/technician`
- Dashboard DSI : `/dashboard/dsi`

---

## 3. Tester avec Postman ou cURL

### Exemple avec cURL (Windows PowerShell)
```powershell
# 1. Se connecter
$response = Invoke-RestMethod -Uri "http://localhost:8000/auth/token" `
  -Method Post `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "username=admin&password=admin123"

$token = $response.access_token

# 2. Créer un ticket
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$body = @{
  title = "Test ticket"
  description = "Description du test"
  type = "materiel"
  priority = "moyenne"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/tickets/" `
  -Method Post `
  -Headers $headers `
  -Body $body

# 3. Voir mes tickets
Invoke-RestMethod -Uri "http://localhost:8000/tickets/me" `
  -Method Get `
  -Headers $headers
```

---

## 4. Vérifier la base de données PostgreSQL

### Se connecter à PostgreSQL
```bash
psql -U postgres -d tickets_db
```

### Requêtes de vérification
```sql
-- Voir tous les rôles
SELECT * FROM roles;

-- Voir tous les utilisateurs
SELECT username, email, full_name, status FROM users;

-- Voir les tickets
SELECT id, title, status, priority FROM tickets;

-- Voir les tickets avec leurs créateurs
SELECT t.title, u.username as createur, r.name as role
FROM tickets t
JOIN users u ON t.creator_id = u.id
JOIN roles r ON u.role_id = r.id;
```

---

## 5. Checklist de test

### Backend
- [ ] Le serveur démarre sans erreur
- [ ] Swagger UI accessible sur `/docs`
- [ ] Connexion fonctionne (`/auth/token`)
- [ ] Création de ticket fonctionne
- [ ] Liste des tickets fonctionne
- [ ] Les permissions RBAC fonctionnent

### Frontend
- [ ] Le serveur démarre sans erreur
- [ ] La page de connexion s'affiche
- [ ] La connexion fonctionne
- [ ] Les tableaux de bord s'affichent
- [ ] La création de ticket fonctionne
- [ ] La liste des tickets s'affiche

### Base de données
- [ ] Les tables sont créées
- [ ] Les rôles sont présents
- [ ] L'utilisateur admin existe
- [ ] Les tickets sont sauvegardés

---

## 6. Problèmes courants

### Erreur de connexion PostgreSQL
- Vérifie que PostgreSQL est démarré
- Vérifie les variables dans `.env`
- Vérifie que la base `tickets_db` existe

### Erreur "React is not defined"
- Redémarre le serveur frontend
- Vérifie que tous les imports React sont présents

### Erreur 401 (Non autorisé)
- Vérifie que le token est valide
- Vérifie que le token est bien envoyé dans le header `Authorization: Bearer {token}`

### Erreur 403 (Permission refusée)
- Vérifie que l'utilisateur a le bon rôle
- Vérifie les permissions dans `security.py`

