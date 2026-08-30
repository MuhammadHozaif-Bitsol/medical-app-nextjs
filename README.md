# MedBook - Next.js Clinic Management System

MedBook is a lightweight, modern medical clinic booking and management system built with Next.js 16 (App Router) and React Server Components.

## 🚀 Features

- **Role-Based Authentication**: Secure edge-level routing separating `patient` and `staff` access.
- **Patient Portal**: Allows patients to view available doctors, chat with an AI assistant, and book appointments.
- **Staff Dashboard**: Allows clinic administrators to view all global appointments, manage doctor directories, and dynamically edit available time slots.
- **Server Actions**: 100% server-side data mutations ensuring secure operations and preventing double-booking race conditions.
- **Local JSON Database**: Uses a lightweight local file system database (`data/db.json`) for rapid prototyping without needing external database setup.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Date Management**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 💻 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Test Accounts

To test the role-based system, you can use the following pre-configured account:

**Staff Admin Account**
- **Email**: `staff@clinic.com`
- **Password**: `password123`

*(Patients can be created on-the-fly using the "Register" tab on the login page).*
