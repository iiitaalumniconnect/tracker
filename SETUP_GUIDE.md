# Alumni Career Tracker - Setup Guide

Complete step-by-step instructions to set up the Alumni Career Tracker project on any system.

---

## Prerequisites

Before starting, ensure you have these installed:

### 1. **Python 3.10+**
- Download from: https://www.python.org/downloads/
- During installation, **check "Add Python to PATH"**
- Verify: Open Command Prompt and run:
  ```
  python --version
  ```

### 2. **Node.js 18+**
- Download from: https://nodejs.org/
- Choose **LTS version**
- Verify: Open Command Prompt and run:
  ```
  node --version
  npm --version
  ```

### 3. **PostgreSQL 12+**
- Download from: https://www.postgresql.org/download/
- During installation, note the password you set (you'll need it)
- Install as service (recommended)
- Default port: 5432 (we use 5433, which can be configured)
- Verify: PostgreSQL should be running in Services



## Setup Steps

### Step 1: Clone or Extract Project
If using Git:
```bash
git clone <repository-url>
cd alumni-tracker
```

Or extract the zip file and open the folder.

---

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Virtual Environment
```bash
python -m venv venv
```

#### 2.3 Activate Virtual Environment
**On Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
.\venv\Scripts\activate
```


```

You should see `(venv)` at the start of your terminal line.

#### 2.4 Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 2.5 Configure Environment Variables
Create a `.env` file in the `backend` directory with these settings:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5433/alumni_tracker
SECRET_KEY=your-secret-key-here-change-this
DEBUG=True
```

**Replace:**
- `your_password` with your PostgreSQL password
- `your-secret-key-here-change-this` with a random string

#### 2.6 Initialize Database
First time setup only:
```bash
python seed_db.py
```

This creates tables and an admin account for login.

#### 2.7 Start Backend Server
```bash
python -m uvicorn app.main:app --reload
```

✓ Backend API available at: `http://localhost:8000`
✓ API Documentation at: `http://localhost:8000/docs`

Keep this terminal open while developing!

---

### Step 3: Frontend Setup

#### 3.1 Open New Terminal (Keep Backend Running)
Open a **new command prompt/terminal** window in the project root.

#### 3.2 Navigate to Frontend Directory
```bash
cd frontend
```

#### 3.3 Install Node Dependencies
```bash
npm install
```

This may take 2-5 minutes. Wait for it to complete.

#### 3.4 Start Frontend Development Server
```bash
npm run dev
```

✓ Frontend available at: `http://localhost:5173`

Keep this terminal open while developing!

---

### Step 4: Access the Application

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the Alumni Career Tracker login page
4. Login with credentials created during `seed_db.py` (or use default: admin/admin)

---

## Quick Start (Automated)

After initial setup, use the provided batch file to start everything:

**On Windows:**
- Double-click `launch.bat` in the project root
- It will:
  - Start the Backend server
  - Start the Frontend server
  - Automatically open the browser

---

## Troubleshooting

### "Port 5173 already in use"
```bash
# Kill the process using that port or use a different port
npm run dev -- --port 5174
```

### "Port 8000 already in use"
```bash
# Use a different port
python -m uvicorn app.main:app --reload --port 8001
```

### "PostgreSQL connection failed"
- Verify PostgreSQL is running (Services on Windows)
- Check `.env` database URL is correct
- Verify password is correct

### "Module not found" errors
Ensure you activated virtual environment:
```bash
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Windows (CMD):
.\venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate
```

### "npm: command not found"
- Node.js not installed or not in PATH
- Restart your terminal after installing Node.js

### "python: command not found"
- Python not installed or not in PATH
- Restart your terminal after installing Python

---

## Project Structure

```
alumni-tracker/
├── backend/                 # FastAPI Backend
│   ├── app/
│   ├── venv/               # Virtual environment
│   ├── requirements.txt     # Python dependencies
│   ├── .env                # Environment variables
│   └── seed_db.py          # Database initialization
│
├── frontend/               # React/Vite Frontend
│   ├── src/
│   ├── node_modules/       # Node packages
│   ├── package.json        # Node dependencies
│   └── .env                # Frontend env variables
│
├── launch.bat              # Quick start batch file (Windows)
├── README.md               # Project overview
└── SETUP_GUIDE.md          # This file
```

---

## Common Commands

### Backend Development
```bash
cd backend
.\venv\Scripts\activate          # Activate venv
python -m uvicorn app.main:app --reload  # Start server
```

### Frontend Development
```bash
cd frontend
npm run dev                       # Start dev server
npm run build                     # Build for production
```

### Database Management
```bash
cd backend
.\venv\Scripts\activate
python seed_db.py               # Reset database
```

---

## Environment Variables Explained

### Backend `.env`
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Used for encrypting passwords and tokens
- `DEBUG`: Enable/disable debug mode

### Frontend `.env` (Optional)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

---

## Production Deployment

For deploying to production:
1. Set `DEBUG=False` in backend `.env`
2. Use production database
3. Change `SECRET_KEY` to a secure random value
4. Run `npm run build` for frontend
5. Use a production server (e.g., Gunicorn for FastAPI)
6. Set up SSL/HTTPS
7. Configure CORS properly

See deployment documentation for detailed steps.

---

## Support & Help

- **Backend Issues**: Check `http://localhost:8000/docs` for API documentation
- **Database Issues**: Verify PostgreSQL is running and credentials are correct
- **Frontend Issues**: Check browser console (F12) for errors
- **General Issues**: Review logs in the terminal windows

---

## Additional Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- React Docs: https://react.dev/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Vite Docs: https://vitejs.dev/

---

**Last Updated:** 2026-06-09

**Setup Time:** ~15-30 minutes (depending on internet speed)

**Questions?** Contact the development team.
