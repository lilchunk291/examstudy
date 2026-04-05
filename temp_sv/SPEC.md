# ScholarMind - Privacy-First AI Academic Scheduler

## Project Overview
- **Project Name**: ScholarMind
- **Type**: Full-stack Web Application (SvelteKit + FastAPI + Supabase)
- **Core Functionality**: Privacy-first AI-powered academic scheduling and learning optimization with client-side encryption, Q-Learning study planner, and institutional scheduling algorithms
- **Target Users**: University students and academic administrators

---

## Architecture

### Tech Stack
- **Frontend**: Svelte + SvelteKit
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Shadcn-Svelte
- **Icons**: Lucide
- **Animations**: Motion One

### Privacy Model
- Student device is source of truth
- All personal data encrypted client-side using AES-256
- Supabase receives only encrypted blobs
- RL agent runs entirely on client device
- No plaintext student data touches server

---

## Database Schema

### Tables (Supabase)

```
sql
-- universities: University configurations
-- university_connections: OAuth/SAML connections
-- academic_events: Encrypted calendar events
-- student_profiles: Public profiles with encryption keys
-- study_sessions: Encrypted session data
-- deep_work_sessions: Deep work tracking
-- encrypted_student_data: Blobs of encrypted data
-- key_escrow: Recovery keys
-- device_authorizations: Paired devices
```

---

## UI/UX Specification

### Design System
- **Inspiration**: Linear + Notion
- **Theme**: Dark mode primary
- **Typography**: Inter font family
- **Icon System**: Lucide icons

### Color Palette (CSS Variables)
```
css
--bg-primary: #0a0a0b
--bg-secondary: #141416
--bg-tertiary: #1c1c1f
--bg-elevated: #232328
--border-subtle: #2a2a2f
--border-default: #38383d
--text-primary: #fafafa
--text-secondary: #a1a1aa
--text-muted: #71717a
--accent-primary: #6366f1 (indigo)
--accent-secondary: #8b5cf6 (violet)
--accent-success: #22c55e
--accent-warning: #f59e0b
--accent-danger: #ef4444
--cognitive-low: #22c55e
--cognitive-medium: #f59e0b
--cognitive-high: #ef4444
```

### Layout Structure
- **Dashboard**: Customizable drag-drop widget grid
- **Navigation**: Sidebar with collapsible sections
- **Responsive**: Mobile-first, breakpoints at 640px, 768px, 1024px

### Components
- Skeleton loaders for all data fetches
- Optimistic UI updates
- Page transitions with Motion One
- Toast notifications
- Modal dialogs
- Form inputs with validation states

---

## Functionality Specification

### 1. Authentication
- University SSO (SAML, OAuth Microsoft/Google, CAS, OIDC)
- Email/password signup
- Multi-device pairing with 10-minute window
- Key escrow account recovery

### 2. Dashboard Widgets
- Cognitive load meter
- Active study plan
- Today's schedule
- Upcoming exam dates
- Learner type display
- Theme selector
- Drag-drop widget layout

### 3. Study Scheduling (Q-Learning Agent)
- AI-generated study plans
- State-aware decision making
- Adapts to: exam proximity, subject weakness, cognitive load
- Multi-Armed Bandit for content preference learning

### 4. Study Sessions
- Topic-based tracking
- Retention scoring
- Anxiety level tracking
- Session reflection

### 5. Deep Work Sessions
- Minimum 45-minute blocks
- No overlap enforcement
- Intensity/comprehension scoring
- Cognitive fatigue tracking
- Distraction-free mode

### 6. University Integration
- LMS sync (Canvas, Moodle, Blackboard)
- Academic calendar sync
- Encrypted event upload

### 7. Reflections
- Post-session mood scoring
- Private notes (IndexedDB only)

### 8. Offline Support
- IndexedDB local source of truth
- Full offline functionality
- Sync queue with retry logic

### 9. Encryption
- AES-256 client-side
- Private key in localStorage (never transmitted)
- Public key in Supabase
- Key escrow for recovery
- GDPR data deletion

### 10. Admin Panel (HTMX + Jinja2)
- University management
- RL agent monitoring
- Sync status dashboard
- Anonymized analytics
- Encryption health monitoring

### 11. Institutional Scheduler
- Graph Coloring for exam mapping
- Genetic Algorithm for schedule evolution
- Firefly Algorithm for optimization
- Bi-Partite Graph for room matching

---

## File Structure

```
scholarmind/
├── frontend/                    # SvelteKit App
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/     # UI Components
│   │   │   ├── stores/         # Svelte stores
│   │   │   ├── utils/          # Helpers (encryption, sync)
│   │   │   ├── agents/         # Q-Learning agent
│   │   │   └── db/             # IndexedDB operations
│   │   ├── routes/             # SvelteKit routes
│   │   └── app.html
│   ├── static/
│   ├── tailwind.config.js
│   ├── svelte.config.js
│   └── package.json
│
├── backend/                     # FastAPI App
│   ├── app/
│   │   ├── api/                # API routes
│   │   ├── core/               # Config, security
│   │   ├── models/             # Pydantic models
│   │   ├── services/           # Business logic
│   │   ├── algorithms/         # GA, Firefly, Graph Coloring
│   │   └── main.py
│   ├── templates/              # Admin Jinja2 templates
│   ├── requirements.txt
│   └── Dockerfile
│
└── supabase/
    ├── migrations/
    └── seed.sql
```

---

## Acceptance Criteria

### Authentication
- [ ] SSO login flow works for Microsoft/Google OAuth
- [ ] Device pairing generates and displays 6-digit code
- [ ] Key escrow recovery functional

### Dashboard
- [ ] All widgets render with skeleton loaders
- [ ] Drag-drop layout saves and restores
- [ ] Theme switching applies immediately

### Study Planning
- [ ] Q-Learning agent generates study schedule
- [ ] Schedule adapts to exam dates
- [ ] Content preferences learned over time

### Privacy
- [ ] All data encrypted before upload
- [ ] Private key never leaves device
- [ ] Offline mode fully functional

### Admin Panel
- [ ] Protected by admin token
- [ ] Shows RL agent metrics
- [ ] Displays sync status

### Performance
- [ ] Pre-trained RL model loaded at startup
- [ ] Heavy algorithms never run during live requests
- [ ] Smooth page transitions

---

## Security Requirements
- CORS configured for localhost:5173
- Async supabase-py calls in threadpool
- Admin routes protected by separate token
- Student routes protected by Supabase JWT
- RLS enforced at database level
