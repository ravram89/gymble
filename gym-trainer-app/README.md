# 🏋️‍♂️ Gymble — Personal Trainer Platform

Gymble is a modern platform for personal trainers to manage clients, create structured workouts, run live training sessions, and track progress — all with a clean UI and real database storage.

---

## 🚀 Tech Stack

- **Next.js 15** (App Router)
- **React 18**
- **TailwindCSS**
- **Supabase** (Postgres + Auth + RLS)
- **TypeScript**

---

## ✅ Current Features (48% Complete)

### 🔐 Authentication
- ✅ User signup and login with Supabase
- ✅ Email/password authentication
- ✅ Auth gate protection for trainer routes
- ✅ Quick test login for development
- ✅ Logout functionality

### 📊 Dashboard
- ✅ Trainer dashboard with overview
- ✅ Display recent workouts (real data)
- ✅ Display active clients (real data)
- ✅ Loading states and empty states

### 👥 Client Management
- ✅ View all clients in a table
- ✅ Add new clients (name, email, phone)
- ✅ Client profile pages with full details
- ✅ Edit client information
- ✅ Delete clients with confirmation
- ✅ View assigned workouts per client
- ✅ Real-time client list updates

### 💪 Workouts
- ✅ Create workout templates with exercises
- ✅ Add exercises from library to workouts
- ✅ Set sets, reps, and rest time for each exercise
- ✅ View workout details with all exercises
- ✅ Delete workouts with confirmation
- ✅ Assign workouts to multiple clients
- ✅ View assignment counts on workout cards
- ✅ Workout metadata (focus, duration, difficulty)

### 📚 Exercise Library
- ✅ View all exercises from database
- ✅ Add custom exercises
- ✅ Search exercises by name, muscle group, equipment
- ✅ Filter by muscle group (dynamic from DB)
- ✅ Display exercise count and details

### 📈 Progress Tracking
- ✅ Log completed workout sessions
- ✅ Record sets, reps, and weight for each exercise
- ✅ View workout history per client
- ✅ Session detail page with full performance data
- ✅ Calculate total volume (reps × weight)
- ✅ Track workout completion status
- ✅ Session notes and duration tracking

### 🎨 UI/UX
- ✅ Clean sidebar navigation
- ✅ Responsive layout
- ✅ Loading states
- ✅ Error handling and display
- ✅ Modern TailwindCSS styling
- ✅ Modal dialogs for forms
- ✅ Confirmation dialogs for destructive actions

---

## 📂 Project Structure

```
gym-trainer-app/
│
├── app/
│   ├── (trainer-layout)/
│   │   ├── layout.tsx                          # Main trainer layout with sidebar
│   │   └── trainer/
│   │       ├── dashboard/page.tsx              # Trainer dashboard
│   │       ├── clients/
│   │       │   ├── page.tsx                    # Clients list
│   │       │   └── [id]/page.tsx               # Client profile page
│   │       ├── workouts/
│   │       │   ├── page.tsx                    # Workouts list
│   │       │   ├── new/page.tsx                # Create workout
│   │       │   └── [id]/page.tsx               # Workout detail view
│   │       ├── exercises/page.tsx              # Exercise library
│   │       └── progress/
│   │           ├── page.tsx                    # Progress tracking main
│   │           ├── log/page.tsx                # Log workout session
│   │           └── session/[id]/page.tsx       # Session details
│   ├── components/
│   │   └── AuthGate.tsx                        # Route protection
│   ├── login/page.tsx                          # Login & signup
│   ├── globals.css                             # Global styles
│   └── page.tsx                                # Root redirect
│
├── libs/
│   └── supabaseClient.ts                       # Supabase client setup
│
├── ROADMAP.md                                  # Detailed feature roadmap
├── .env.local                                  # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ Database Schema

### Tables
- `trainers` - Trainer accounts linked to auth users
- `clients` - Client records with contact info
- `exercises` - Exercise library with muscle groups and equipment
- `workouts` - Workout templates with metadata
- `workout_exercises` - Exercises in workouts (sets, reps, rest, order)
- `client_workouts` - Workout assignments to clients
- `workout_sessions` - Logged workout completion sessions
- `session_exercises` - Exercise performance data (sets, reps, weight)

### Notes
⚠️ **RLS (Row Level Security) is currently DISABLED for development**. Before production, enable RLS and create proper policies for each table. See `ROADMAP.md` for details.

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd gym-trainer-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create `.env.local` in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase
Run the following SQL in your Supabase SQL Editor:

```sql
-- Create trainers table
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  muscle_group VARCHAR(100),
  equipment VARCHAR(100),
  difficulty VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID,
  name VARCHAR(255) NOT NULL,
  focus TEXT,
  duration VARCHAR(50),
  difficulty VARCHAR(50),
  notes TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  source_workout_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_exercises table
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps VARCHAR(20) NOT NULL DEFAULT '10',
  rest_seconds INTEGER DEFAULT 60,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create client_workouts table
CREATE TABLE client_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  workout_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_sessions table
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  workout_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session_exercises table
CREATE TABLE session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  workout_exercise_id UUID,
  set_number INTEGER NOT NULL,
  reps_completed INTEGER,
  weight_kg DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for development (ENABLE for production!)
ALTER TABLE trainers DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises DISABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise ON workout_exercises(exercise_id);
CREATE INDEX idx_workout_sessions_client ON workout_sessions(client_id);
CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Quick Login (Development)
- Click "Quick Test Login" on the login page
- This creates a test trainer account automatically

---

## 🎯 What's Next

See `ROADMAP.md` for the complete feature roadmap. Priority features:
- Edit workouts
- Enhanced progress tracking with charts
- Calendar/scheduling system
- Client dashboard view
- Notifications
- Export workouts as PDF

---

## 📝 Current State (December 18, 2025)

The app is fully functional for trainers to:
1. **Manage clients** - Add, view, edit, delete
2. **Create workout templates** - Build workouts with exercises, sets, reps
3. **Assign workouts** - Assign templates to multiple clients
4. **Track progress** - Log completed workouts with actual performance data
5. **View history** - See all workout sessions with detailed stats

All features use real Supabase data (no mocks). Ready for continued development!

---

## 🤝 Contributing

This is a portfolio project being built in public. Feel free to explore, learn, or suggest improvements!

---

## 📄 License

MIT License - See LICENSE file for details
