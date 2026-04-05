# ScholarMind - Privacy-First AI Academic Scheduler

A privacy-first AI-powered academic scheduling and learning optimization web application built with SvelteKit, FastAPI, and Supabase.

## Features

- **AI-Powered Study Planning**: Q-Learning agent that adapts to your study patterns
- **Privacy-First Architecture**: AES-256 client-side encryption, data never leaves your device in plaintext
- **Offline-First**: Works seamlessly offline with IndexedDB, syncs when connected
- **Deep Work Tracking**: Track deep work sessions with cognitive fatigue monitoring
- **University Integration**: LMS sync for Canvas, Moodle, Blackboard
- **Institutional Scheduling**: Advanced algorithms for exam scheduling (Graph Coloring, Genetic Algorithm, Firefly, Bi-Partite Matching)

## Tech Stack

### Frontend
- **SvelteKit** - Full-stack web framework
- **Tailwind CSS** - Utility-first CSS
- **Supabase JS** - Client for backend
- **IDB** - IndexedDB wrapper
- **Lucide** - Icons

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - Database and authentication
- **Python** - Server-side logic

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your Supabase credentials

# Start development server
npm run dev
```

### Backend Setup

```
bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Update .env with your Supabase credentials

# Start development server
uvicorn app.main:app --reload
```

## Project Structure

```
scholarmind/
├── frontend/                 # SvelteKit application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/  # UI components
│   │   │   ├── stores/      # Svelte stores
│   │   │   ├── utils/       # Utilities (encryption, supabase)
│   │   │   └── db/          # IndexedDB operations
│   │   └── routes/          # SvelteKit routes
│   └── ...
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Configuration & security
│   │   ├── models/          # Pydantic models
│   │   └── algorithms/      # Scheduling algorithms
│   └── ...
│
├── SPEC.md                   # Detailed specification
└── README.md
```

## Privacy Architecture

1. **Local Source of Truth**: All data is stored in IndexedDB on the user's device
2. **Client-Side Encryption**: Data is encrypted with AES-256 before any upload
3. **Supabase as Backup**: Server only stores encrypted blobs it cannot read
4. **RL Agent On-Device**: Q-Learning runs entirely in the browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/device/pair` - Initiate device pairing

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update profile
- `GET /api/students/dashboard` - Get dashboard data

### Study
- `GET /api/study/sessions` - Get study sessions
- `POST /api/study/sessions` - Create study session
- `GET /api/study/deep-work` - Get deep work sessions
- `POST /api/study/deep-work` - Start deep work session

### University
- `GET /api/university/connections` - Get LMS connections
- `POST /api/university/sync` - Sync with LMS

### Admin
- `GET /api/admin/stats` - Get RL agent statistics
- `POST /api/admin/schedule` - Trigger scheduling algorithm

## License

MIT
