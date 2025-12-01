# 🏋️‍♂️ Gymble — Personal Trainer Platform (WIP)

Gymble is a modern platform for personal trainers to manage clients, create structured workouts, run live training sessions, and track progress — all with a clean UI and real database storage.

This project is being built publicly as a real-world SaaS-style portfolio piece.

---

# 🚀 Tech Stack

- Next.js 15 (App Router)
- React 18
- TailwindCSS
- Supabase (Postgres + Auth + RLS)
- TypeScript

---

# 📂 Project Structure

```
gymble/
│
├── app/
│   ├── (trainer-layout)/
│   │   ├── layout.tsx
│   │   ├── trainer/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── clients/page.tsx
│   │   │   ├── workouts/page.tsx
│   │   │   ├── workouts/new/page.tsx
│   │   │   └── exercises/page.tsx
│   │   └── live/page.tsx
│   ├── globals.css
│   └── page.tsx
│
├── lib/
│   └── supabase.ts
│
├── public/
│
├── README.md
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

# 🎉 Summary of achievements so far

### ✔️ Architecture & Setup
- Planned Gymble’s platform structure
- Created GitHub repo & Next.js project
- Implemented trainer layout & navigation

### ✔️ Database & Backend
- Created Supabase tables:
  - trainers  
  - clients  
  - exercises  
  - workouts  
  - workout_exercises
- Implemented FK relations + RLS policies
- Enabled real-time exercise fetch from DB

### ✔️ Frontend Features
- Built full workout creator UI (sets, reps, rest)
- Integrated workout saving with Supabase
- Inserted workout + its exercises successfully 🎉

Gymble now stores real trainer data, not mock data.

---

# 🛣️ Roadmap / Next Steps

## 🔧 Backend / DB:
- Add pagination, filtering, sorting for exercises & workouts
- Add trainers → clients assignment logic
- Workout categories + search

## 🎨 UI/UX Improvements:
- Replace early UI with polished 2025 look
- Add animations (Framer Motion)
- Create reusable components (Cards, Inputs, Buttons)

## 🔮 Upcoming Features:
- Client profiles + progress tracking
- Calendar scheduling (trainer + client)
- Live Session upgrades (markers, timers, notes)
- Workout sharing between trainers
- Notification system
- Export workouts as PDF
- AI auto-generate workouts (future feature)

---

# ▶️ Getting Started

```bash
git clone https://github.com/<your-username>/gymble.git
cd gymble
npm install
npm run dev
```

Gymble will start at:  
➡️ http://localhost:3000
