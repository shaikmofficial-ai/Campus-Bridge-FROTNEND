CampusBridge Frontend

Overview

CampusBridge is a web-based platform developed for Dr. M.G.R. Educational and Research Institute to strengthen connections between students, seniors, alumni, mentors, and placement resources.

This repository contains the frontend implementation of CampusBridge, built using modern React technologies to provide a responsive and user-friendly experience.

---

Features

Student Dashboard

- Personalized dashboard
- Quick access to resources and activities
- Profile management

Alumni & Mentorship

- Connect with alumni
- Mentorship opportunities
- Professional guidance

Placement Portal

- Placement updates
- Internship opportunities
- Career resources

Community Forum

- Public discussions
- Department-specific conversations
- Knowledge sharing

Resource Center

- Study materials
- Career preparation resources
- Learning content

User Profiles

- Student profiles
- Alumni profiles
- Professional information display

---

Technology Stack

Frontend Framework

- React 19
- TypeScript

Routing

- TanStack Router

State Management & Data Fetching

- TanStack React Query

UI Components

- Radix UI
- Shadcn UI

Styling

- Tailwind CSS v4

Build Tool

- Vite

---

Project Structure

src/
├── assets/
│   ├── images
│   └── logos
│
├── components/
│   ├── ui/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   └── app-shell.tsx
│
├── routes/
│   ├── index.tsx
│   ├── dashboard.tsx
│   ├── profile.tsx
│   ├── placements.tsx
│   ├── mentorship.tsx
│   ├── forum.tsx
│   └── chat.tsx
│
├── hooks/
├── lib/
├── router.tsx
├── routeTree.gen.ts
└── styles.css

---

Installation

Clone the repository:

git clone https://github.com/your-username/Campus-Bridge.git

Move into the project directory:

cd Campus-Bridge

Install dependencies:

npm install

or

bun install

---

Running Locally

Start the development server:

npm run dev

or

bun run dev

Open:

http://localhost:5173

---

Production Build

Generate production build:

npm run build

or

bun run build

Preview build:

npm run preview

---

Deployment

Vercel Configuration

Framework Preset:

Vite

Build Command:

npm run build

Output Directory:

dist

---

Future Enhancements

- Authentication System
- Alumni Verification
- Real-time Chat
- Notification System
- Placement Analytics
- Admin Management Dashboard
- Backend API Integration
- Database Integration

---

Authors

Developed by the CampusBridge Team

Dr. M.G.R. Educational and Research Institute

---

License

This project is developed for academic and educational purposes.