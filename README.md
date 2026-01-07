# 📈 TradeSense AI - Prop Trading Platform

<div align="center">

![TradeSense AI](https://img.shields.io/badge/TradeSense-AI-6366f1?style=for-the-badge&logo=chart-line)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask)

**La Première Prop Firm Assistée par IA pour l'Afrique**

[Demo](#-demo) • [Installation](#-installation) • [Features](#-features) • [API](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

## 🎯 About

TradeSense AI is a **Prop Trading SaaS platform** where users can:
- Pay to enter trading challenges (Starter, Pro, Elite tiers)
- Trade with virtual capital using real-time market data
- Get evaluated against "Killer Rules" (loss limits & profit targets)
- Become "Funded" traders upon passing the challenge

---

## ✨ Features

### 🏆 Challenge Engine
- Virtual balance management ($5K - $50K)
- **Killer Rules**: 5% daily loss, 10% total loss, 10% profit target
- Automatic status updates (Active → Passed/Failed)

### 💳 Payment System
- Mock payment gateway (CMI, Crypto simulation)
- PayPal integration with admin configuration
- 3-tier pricing (200 DH, 500 DH, 1000 DH)

### 📊 Real-time Dashboard
- TradingView Lightweight Charts
- Live prices from Yahoo Finance (US stocks, Crypto)
- Morocco market data (Casablanca Stock Exchange)
- AI-powered trading signals (Buy/Sell/Hold)

### 🏅 Leaderboard
- Top 10 traders ranking
- Platform statistics (pass rate, total challenges)

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 20+
- npm or yarn

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/tradesense-ai.git
cd tradesense-ai
```

### 2️⃣ Setup Backend
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your settings

# Run the server
python app.py
```

The backend will start at: `http://localhost:5000`

### 3️⃣ Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will start at: `http://localhost:5173`

---

## 📁 Project Structure

```
tradesense-ai/
├── 📂 backend/
│   ├── app.py              # Flask entry point
│   ├── config.py           # Configuration classes
│   ├── models.py           # SQLAlchemy models
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment template
│   ├── 📂 routes/
│   │   ├── auth.py         # Authentication
│   │   ├── challenge.py    # Challenge management
│   │   ├── trades.py       # Trade execution
│   │   ├── payments.py     # Payment processing
│   │   ├── market.py       # Market data
│   │   ├── leaderboard.py  # Rankings
│   │   └── admin.py        # Admin panel
│   └── 📂 services/
│       ├── challenge_engine.py  # Killer rules logic
│       ├── market_data.py       # Price feeds
│       └── ai_signals.py        # Trading signals
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── App.jsx         # Main app + routing
│   │   ├── index.css       # Global styles
│   │   ├── 📂 components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Chart.jsx
│   │   │   ├── AISignals.jsx
│   │   │   └── TradePanel.jsx
│   │   └── 📂 pages/
│   │       ├── LandingPage.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Pricing.jsx
│   │       ├── Leaderboard.jsx
│   │       ├── Auth.jsx
│   │       └── AdminPanel.jsx
│   └── package.json
│
└── database.sql            # SQL schema
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Flask
SECRET_KEY=your-super-secret-key-change-this
FLASK_ENV=development

# Database
DATABASE_URL=sqlite:///tradesense.db

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-change-this

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Market Data
MARKET_UPDATE_INTERVAL=30

# PayPal (optional - configure via Admin Panel)
PAYPAL_MODE=sandbox
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login & get token |
| GET | `/api/auth/me` | Get current user |

### Challenges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/challenges` | List user challenges |
| GET | `/api/challenges/active` | Get active challenge |
| GET | `/api/challenges/plans` | List available plans |

### Trading
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trades` | Execute a trade |
| GET | `/api/trades` | List trade history |
| GET | `/api/trades/positions` | Get open positions |

### Market Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market/prices` | Get all prices |
| GET | `/api/market/signals` | Get AI signals |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/plans` | List pricing plans |
| POST | `/api/payments/checkout` | Process payment |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Top 10 traders |
| GET | `/api/leaderboard/stats` | Platform stats |

---

## 🎮 Usage Guide

### 1. Register/Login
Go to `/auth` and create an account or login.

### 2. Purchase a Challenge
- Navigate to `/pricing`
- Select a plan (Starter, Pro, or Elite)
- Complete the mock payment

### 3. Start Trading
- Access your dashboard at `/dashboard`
- View charts and AI signals
- Execute trades using the trading panel

### 4. Pass the Challenge
- Reach 10% profit to pass
- Avoid 5% daily loss or 10% total loss
- Check your status in the dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python, Flask, SQLAlchemy |
| **Frontend** | React 19, Vite, React Router |
| **Database** | SQLite (dev), PostgreSQL (prod) |
| **Charts** | TradingView Lightweight Charts |
| **Market Data** | Yahoo Finance API, Web Scraping |
| **Auth** | JWT (Flask-JWT-Extended) |
| **Styling** | Custom CSS, Dark Theme |

---

## 🚢 Deployment

### Backend (Render.com)
1. Create a new Web Service
2. Connect your GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn app:app`
5. Add environment variables

### Frontend (Vercel)
1. Import project from GitHub
2. Set root directory to `frontend`
3. Add `VITE_API_URL` env variable pointing to your backend

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built with ❤️ for the African trading community.

---

<div align="center">

**[⬆ Back to Top](#-tradesense-ai---prop-trading-platform)**

</div>
#   T r a d e S e n s e A I  
 