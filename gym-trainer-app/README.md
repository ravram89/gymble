# 🏋️‍♂️ Gymble – Personal Trainer Platform (MVP)

Gymble is a trainer-first web application for managing clients, workouts, exercises, and live training sessions.

This project is built using:
- **Next.js 15 (App Router)**
- **React**
- **TailwindCSS**
- **TypeScript**
- **Supabase (Postgres + Auth)**
- **Vercel** (future deployment)

---

## 🚀 Features Completed (Day 1)

### ✅ **Base Application**
- Next.js project initialized
- Trainer layout with sidebar navigation
- Pages wired: Dashboard, Clients, Workouts, Exercise Library, Live Session

### ✅ **Exercise Library (LIVE DATA)**
- `exercises` table created in Supabase
- Fetched in real-time on the UI
- Display list with categories, muscle groups, etc.

### ✅ **Workout Builder (FULL STACK, COMPLETE)**
- Create workout UI with:
  - Name
  - Focus / goal
  - Duration
  - Difficulty
  - Notes
- Add/remove exercises to workout
- Configure sets, reps, rest
- Save to database:
  - Inserts into **workouts**
  - Inserts into **workout_exercises**
- Error handling + validation + redirect

Gymble now stores **real trainer data**, not mock data.

---

## 📂 Project Structure

gymble/
│
├── app/
│ ├── (trainer-layout)/
│ │ ├── layout.tsx
│ │ ├── trainer/
│ │ │ ├── dashboard/page.tsx
│ │ │ ├── clients/page.tsx
│ │ │ ├── workouts/
│ │ │ │ ├── page.tsx # workouts list
│ │ │ │ ├── new/page.tsx # create workout
│ │ │ ├── exercises/page.tsx
│ │ │ ├── live/page.tsx
│ │ │
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
│
├── lib/
│ ├── supabase.ts
│
├── public/
│
├── README.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json

## 🧠 Summary of achievements so far

### 🎉 **What's implemented so far**
- Planned the architecture of Gymble  
- Set up the project repo + Next.js app  
- Built the trainer layout and navigation  
- Created Supabase tables: trainers, clients, exercises, workouts, workout_exercises  
- Implemented real-time exercise fetching  
- Built a full workout creator with DB persistence  
- Fixed multiple RLS / FK issues  
- Successfully saved a real workout + its exercises 🎯  

---

## 📅 Roadmap / Next Steps 

### ⭐ **Backend / DB:**
- Add pagination, filtering, sorting for workouts & exercises
- Add trainers → clients assignment logic
- Add workout categories + search

### ⭐ **UI/UX Improvements**
- Replace rough UI with polished 2025 feel  
- Add beautiful animations (Framer Motion)
- Add reusable components (Buttons, Cards, Inputs, etc.)

### ⭐ **Upcoming Features**
- Client profiles + progress tracking
- Calendar scheduling (per client & trainer)
- Live Session upgrades: markers, timers, notes history
- Workout sharing between trainers  
- Notification system  
- Export workout as PDF  
- AI auto-generate workouts (later 😉)

---

Getting Started
git clone https://github.com/<your-username>/gymble.git
cd gymble
npm install
npm run dev

