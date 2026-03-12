# Task Manager 🚀

Une application web de gestion de tâches et de projets, construite avec **Next.js** (frontend) et **FastAPI** (backend).

## 🌐 Accès en ligne

👉 **[https://task-manager-frontend-drab-six.vercel.app/login](https://task-manager-frontend-drab-six.vercel.app/login)**

> ⚠️ Le backend est hébergé sur Render (plan gratuit). Si la première requête est lente (~30s), c'est normal — le serveur se réveille.

---

## ✨ Fonctionnalités

- Inscription et connexion sécurisée (JWT)
- Création et gestion de projets
- Création et gestion de tâches par projet
- Interface responsive

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python) |
| Base de données | MongoDB Atlas |
| Déploiement Frontend | Vercel |
| Déploiement Backend | Render |

---

## 🚀 Lancer le projet en local

### Frontend

```bash
git clone https://github.com/ton-repo/task-manager-frontend
cd task-manager-frontend
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

### Variables d'environnement

Crée un fichier `.env.local` à la racine du frontend :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend

```bash
git clone https://github.com/ton-repo/task-manager-backend
cd task-manager-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Crée un fichier `.env` à la racine du backend :

```env
MONGO_URL=ta_chaine_mongodb
DB_NAME=task_manager
SECRET_KEY=ta_cle_secrete
```

---

## 📁 Structure du projet

```
task-manager-frontend/
├── app/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   └── ...
├── components/
├── public/
└── ...
```

---

## 👤 Auteur

Développé par **Papa Mapate Loum**