# MedBook - Next.js Clinic Management System

MedBook is a modern, production-ready medical clinic booking and management system built with Next.js 16 (App Router), React Server Components, and Prisma ORM connected to Supabase PostgreSQL.

## 🚀 Features

- **Role-Based Authentication**: Secure edge-level routing (`proxy.ts`) separating `patient` and `staff` access with cryptographically signed JWT cookies (`jose`) and bcrypt password hashing.
- **Patient Portal**: Allows patients to view available doctors, chat with an AI assistant, and book appointments with real-time slot availability checking.
- **Staff Dashboard**: Allows clinic administrators to view all global appointments, manage doctor directories, and dynamically edit available time slots via atomic database upserts.
- **Server Actions & Transactions**: 100% server-side data mutations ensuring secure operations and preventing double-booking race conditions.
- **PostgreSQL Database with Prisma**: Real relational database hosted on Supabase with connection pooling, migrations, and idempotent reset seeding.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Database**: [PostgreSQL (Supabase)](https://supabase.com/) with [Prisma ORM](https://www.prisma.io/)
- **Security**: [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) & [Jose (JWT)](https://github.com/panva/jose)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Date Management**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 💻 Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `.env` and configure your Supabase connection strings:

   ```bash
   cp .env.example .env
   ```

3. **Sync Database & Seed Baseline Data**

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

5. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Test Accounts

To test the role-based system, you can use the pre-configured staff account:

**Staff Admin Account**

- **Email**: `staff@clinic.com`
- **Password**: `password123`

_(Patients can be created on-the-fly using the "Register" tab on the login page)._
