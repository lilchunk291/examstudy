# FastAPI Backend Migration Guide

This directory contains a FastAPI backend designed to work with the StudyStream AI frontend.

## Local Setup Instructions

### 1. Prerequisites
- Python 3.9 or higher
- `pip` (Python package manager)

### 2. Installation
Navigate to the backend directory and install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configuration
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
Edit `.env` with your:
- `GEMINI_API_KEY` (from Google AI Studio)
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` (from your Supabase project)

### 4. Running the Server
```bash
python main.py
```
The backend will be available at `http://localhost:8000`.

## Connecting the Frontend
In your React frontend, you can now point your API calls to `http://localhost:8000/api/...` instead of calling the SDKs directly.

### Example Fetch:
```javascript
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: currentMessages, model: 'gemini-pro' })
});
const data = await response.json();
```
