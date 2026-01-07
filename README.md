# 📈 TradeSense AI - Prop Trading Platform

<div align="center">

![TradeSense AI](https://img.shields.io/badge/TradeSense-AI-6366f1?style=for-the-badge&logo=chart-line)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask)

**🌍 La Première Prop Firm Assistée par IA pour l'Afrique**

[✨ Features](#-features) • [🚀 Installation](#-installation) • [📡 API](#-api-endpoints) • [🎮 Usage](#-usage-guide)

</div>

---

## 🎯 About

**TradeSense AI** est une plateforme SaaS de **Prop Trading** où les utilisateurs peuvent :

- 💳 Payer pour participer à des challenges de trading (Starter, Pro, Elite)
- 📊 Trader avec du capital virtuel en utilisant des données de marché en temps réel
- ⚖️ Être évalués selon les "Killer Rules" (limites de pertes & objectifs de profit)
- 🏆 Devenir traders "Funded" en réussissant le challenge

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🏆 **Challenge Engine** | Gestion des balances virtuelles ($5K-$50K), règles strictes (5% perte journalière, 10% perte totale, 10% objectif profit) |
| 💳 **Payments** | Gateway mock (CMI, Crypto), intégration PayPal avec config admin |
| 📊 **Dashboard** | Charts TradingView, prix en temps réel (Yahoo Finance + Bourse de Casablanca), signaux IA |
| 🏅 **Leaderboard** | Top 10 traders, statistiques de la plateforme |
| 👤 **Auth** | Inscription/Connexion avec JWT |
| 🔧 **Admin Panel** | Gestion des utilisateurs, challenges, paiements, config PayPal |

---

## 🚀 Installation

### Prérequis

- Python 3.10+
- Node.js 20+
- npm ou yarn

### 1️⃣ Cloner le Repository

```bash
git clone https://github.com/yourusername/tradesense-ai.git
cd tradesense-ai
```

### 2️⃣ Backend (Flask)

```bash
cd backend

# Environnement virtuel (recommandé)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
copy .env.example .env

# Lancer le serveur
python app.py
```

> ✅ Backend disponible sur: `http://localhost:5000`

### 3️⃣ Frontend (React + Vite)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

> ✅ Frontend disponible sur: `http://localhost:5173`

---

## 📁 Structure du Projet

```
tradesense-ai/
├── backend/
│   ├── app.py              # Point d'entrée Flask
│   ├── config.py           # Configuration
│   ├── models.py           # Modèles SQLAlchemy
│   ├── requirements.txt    # Dépendances Python
│   ├── routes/
│   │   ├── auth.py         # Authentification
│   │   ├── challenge.py    # Gestion des challenges
│   │   ├── trades.py       # Exécution des trades
│   │   ├── payments.py     # Paiements
│   │   ├── market.py       # Données de marché
│   │   ├── leaderboard.py  # Classement
│   │   └── admin.py        # Panel admin
│   └── services/
│       ├── challenge_engine.py  # Logique des Killer Rules
│       ├── market_data.py       # Prix (yfinance + scraping)
│       └── ai_signals.py        # Signaux de trading
│
├── frontend/
│   └── src/
│       ├── App.jsx         # App principale + routing
│       ├── index.css       # Styles globaux (dark theme)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Chart.jsx
│       │   ├── AISignals.jsx
│       │   └── TradePanel.jsx
│       └── pages/
│           ├── LandingPage.jsx
│           ├── Dashboard.jsx
│           ├── Pricing.jsx
│           ├── Leaderboard.jsx
│           ├── Auth.jsx
│           └── AdminPanel.jsx
│
└── database.sql            # Schéma SQL
```

---

## ⚙️ Variables d'Environnement

Créer un fichier `.env` dans le dossier `backend/`:

```env
SECRET_KEY=votre-cle-secrete
FLASK_ENV=development
DATABASE_URL=sqlite:///tradesense.db
JWT_SECRET_KEY=votre-jwt-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Créer un compte |
| `POST` | `/api/auth/login` | Connexion |
| `GET` | `/api/auth/me` | Utilisateur actuel |

### 🏆 Challenges

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/challenges` | Liste des challenges |
| `GET` | `/api/challenges/active` | Challenge actif |
| `GET` | `/api/challenges/plans` | Plans disponibles |

### 💹 Trading

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trades` | Exécuter un trade |
| `GET` | `/api/trades` | Historique des trades |
| `GET` | `/api/trades/positions` | Positions ouvertes |

### 📊 Market Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/market/prices` | Tous les prix |
| `GET` | `/api/market/signals` | Signaux IA |

### 💳 Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/payments/plans` | Plans tarifaires |
| `POST` | `/api/payments/checkout` | Paiement |

### 🏅 Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard` | Top 10 traders |
| `GET` | `/api/leaderboard/stats` | Statistiques |

---

## 🎮 Usage Guide

### Étape 1: Inscription
Allez sur `/auth` et créez un compte.

### Étape 2: Acheter un Challenge
- Naviguez vers `/pricing`
- Sélectionnez un plan (Starter 200DH, Pro 500DH, Elite 1000DH)
- Complétez le paiement (mock)

### Étape 3: Trader
- Accédez au dashboard `/dashboard`
- Consultez les charts et signaux IA
- Exécutez des trades avec le panel de trading

### Étape 4: Réussir le Challenge
- Atteignez 10% de profit pour réussir
- Évitez 5% de perte journalière ou 10% de perte totale
- Consultez votre statut dans le dashboard

---

## 🛠️ Tech Stack

| Couche | Technologie |
|--------|-------------|
| **Backend** | Python, Flask, SQLAlchemy, Flask-JWT-Extended |
| **Frontend** | React 19, Vite, React Router |
| **Database** | SQLite (dev), PostgreSQL (prod) |
| **Charts** | TradingView Lightweight Charts |
| **Market Data** | Yahoo Finance API, Web Scraping |
| **Styling** | Custom CSS, Dark Theme Premium |

---

## 🚢 Déploiement

### Backend → Render.com

```bash
# Build command
pip install -r requirements.txt

# Start command
gunicorn app:app
```

### Frontend → Vercel

1. Importer le projet depuis GitHub
2. Définir le répertoire racine: `frontend`
3. Ajouter variable: `VITE_API_URL=https://votre-backend.onrender.com/api`

---

## 🤝 Contributing

1. Fork le repo
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

---

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**Construit avec ❤️ pour la communauté de trading africaine**

[⬆ Retour en haut](#-tradesense-ai---prop-trading-platform)

</div>