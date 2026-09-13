# SolarGuard AI - Run Instructions

This guide provides the exact steps required to run the SolarGuard AI platform on your local machine.

## Prerequisites
1. **Python 3.10+**
2. **Node.js (v18+)**
3. **MongoDB Community Server** (Optional but recommended for full functionality)

---

## Step 1: Start MongoDB (Optional)
If you have MongoDB installed,start the MongoDB service. 
By default, the backend expects MongoDB to be running at `mongodb://localhost:27017`.

> **Note**: If you do not have MongoDB running, the application will still launch! We have built  in a **Graceful Fallback Mode** that will automatically serve mock data to the Dashboard and History panels so you can still test the UI.

---

## Step 2: Start the FastAPI Backend
Open a new terminal window, navigate to the `backend` folder, and start the Uvicorn server:

```powershell
cd d:\AI_ML_Project\Solar_Panel_Detect\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> **Note**: The backend might take 10-15 seconds to fully initialize because it is loading the TensorFlow Deep Learning models into memory. Wait until you see `Application startup complete` in the terminal before opening the frontend.

---

## Step 3: Start the React Frontend
Open another terminal window, navigate to the `frontend` folder, and start the Vite development server:

```powershell
cd d:\AI_ML_Project\Solar_Panel_Detect\frontend
npm run dev
```

You can now open your browser and navigate to **http://localhost:5173** to view the application!
