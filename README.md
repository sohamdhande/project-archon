# Project Archon 🏆

Project Archon is the official **Leaderboard and Session Tracking Platform** for the **NST-SDC Dev Club**. It is designed to foster healthy competition and manage student engagement through a premium, cinematic user interface.

## 🌟 Features

- **Dynamic Leaderboard:** Real-time ranking of students based on a calculated score (Attendance = 5 points per session + Manual Points).
- **Live & Upcoming Sessions:** A dedicated sessions tab that displays active live sessions, countdowns to upcoming sessions, and a chronological list of future scheduled lectures.
- **Admin Dashboard:** A fully authenticated, JWT-secured backend for administrators to:
  - Add and manage students.
  - Modify student manual points.
  - Schedule and edit sessions.
  - Efficiently take and record student attendance via a frosted-glass modal.
- **Cinematic UI:** The entire platform features a highly polished dark-mode aesthetic utilizing glassmorphism, animated aurora gradients, noise overlays, and custom Google typography (Space Grotesk, Inter, JetBrains Mono).

## 💻 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Frontend:** React, Tailwind CSS, Vanilla CSS Variables (`globals.css`)
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** Custom JWT-based admin authentication (`jose`)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- A PostgreSQL database URL

### 1. Environment Variables
Create a `.env.local` (or `.env`) file in the root directory and add the following keys:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Admin Authentication
ADMIN_USERNAME="your_admin_username"
ADMIN_PASSWORD="your_admin_password"

# JWT Secret (Generate a strong random string)
JWT_SECRET="your_super_secret_jwt_key"
```

### 2. Installation & Setup

Install the dependencies:
```bash
npm install
```

Push the Prisma schema to your database:
```bash
npx prisma db push
# or to apply migrations
npx prisma migrate deploy
```

*(Optional)* Seed the database with students:
```bash
npx tsx --env-file=.env.local seed-students.ts
```

### 3. Run Development Server

Start the application:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
To access the admin panel, navigate to `/login` and use the credentials specified in your environment variables.

## 🏗 Architecture Notes

- **Scoring System:** The platform relies strictly on Attendance (5 pts) and Manual Points. Legacy "assignment" logic has been completely surgically removed to keep the application lightweight and focused on live participation.
- **UI Engine:** The complex glassmorphism and background animations (like the Fluted Glass effect) are handled via raw CSS in `globals.css` to prevent React hydration errors and improve SSR performance.

---
*Built for NST-SDC. Build. Learn. Compete. Repeat.*
