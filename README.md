# Alumni Career Tracker

A full-stack platform to track alumni career trajectories, built with FastAPI (Backend) and React (Frontend).

## Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** (Running locally on port 5433, or update the URL in `.env`)

---

## 1. Running the Backend (FastAPI)

Open a terminal in the `backend` directory:
```powershell
cd backend
```

Activate the virtual environment:
```powershell
.\venv\Scripts\activate
```

*(If this is your first time or you changed databases, run the seed script to create your admin login account:)*
```powershell
python seed_db.py
```

Start the server:
```powershell
python -m uvicorn app.main:app --reload
```
The backend API will be available at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.

---

## 2. Running the Frontend (React/Vite)

Open a **new, separate** terminal in the `frontend` directory:
```powershell
cd frontend
```

*(If this is your first time, install dependencies:)*
```powershell
npm install
```

Start the development server:
```powershell
npm run dev
```
The frontend UI will be available at `http://localhost:5173`. Open this link in your browser to log in!

**Default Login:**
- **Email:** admin@example.com
- **Password:** secret123
