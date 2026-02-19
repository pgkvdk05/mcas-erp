# Mangalam College ERP System

This is a comprehensive Enterprise Resource Planning (ERP) system designed for Mangalam College of Arts and Science. It provides various modules for managing students, teachers, departments, courses, attendance, marks, fees, and communication, with distinct access levels for different user roles.

## Table of Contents

1.  [Features](#features)
2.  [Tech Stack](#tech-stack)
3.  [Installation & Setup](#installation--setup)
    *   [Prerequisites](#prerequisites)
    *   [Clone the Repository](#clone-the-repository)
    *   [Install Dependencies](#install-dependencies)
    *   [Supabase Setup](#supabase-setup)
    *   [Environment Variables](#environment-variables)
    *   [Run the Application](#run-the-application)
4.  [User Roles & Permissions](#user-roles--permissions)
    *   [Super Admin](#super-admin)
    *   [Admin](#admin)
    *   [Teacher](#teacher)
    *   [Student](#student)
5.  [Project Structure](#project-structure)
6.  [Available Scripts](#available-scripts)

## Features

*   **User Management:** Add, edit, and delete users (Super Admin).
*   **Role-Based Access Control:** Distinct dashboards and functionalities for Super Admin, Admin, Teacher, and Student roles.
*   **Department Management:** Add, view, and remove academic departments (Super Admin).
*   **Course Management:** Add, view, and remove courses (Super Admin).
*   **Student Management:** Add new students with comprehensive details (Super Admin).
*   **Teacher Management:** Add new teachers with professional details (Super Admin).
*   **Attendance Tracking:**
    *   Teachers can mark attendance for their classes.
    *   Students can view their attendance records.
    *   Admins can view all attendance logs.
*   **Marks Management:**
    *   Teachers can upload marks for their courses.
    *   Students can view their marks.
    *   Admins can view all marks.
*   **Fee Management:**
    *   Students can view their fee status and outstanding amounts.
    *   Admins and Super Admins can manage fee records and mark payments.
*   **On Duty (OD) Requests:**
    *   Students can submit OD requests with supporting documents.
    *   Teachers and Admins can approve/reject OD requests.
*   **Class Chat:** Real-time communication between teachers and students within specific courses.
*   **User Profiles:** Detailed profile pages for all users.
*   **Responsive Design:** Optimized for various screen sizes using Tailwind CSS.
*   **Authentication:** Secure user authentication using Supabase.

## Tech Stack

*   **Frontend:** React, TypeScript, React Router
*   **Styling:** Tailwind CSS, Shadcn/ui
*   **Backend/Database/Auth:** Supabase
*   **Package Manager:** npm
*   **Build Tool:** Vite
*   **Analytics:** Vercel Analytics

## Installation & Setup

Follow these steps to get the project up and running on your local machine.

### Prerequisites

*   Node.js (v18 or higher)
*   npm (v9 or higher) or Yarn (v1.22 or higher)
*   Git

### Clone the Repository

```bash
git clone <repository-url>
cd mangalam-college-erp
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Supabase Setup

This project heavily relies on Supabase for authentication, database, and storage.

1.  **Create a Supabase Project:**
    *   Go to [Supabase](https://supabase.com/) and create a new project.
    *   Note down your Project URL and `anon` public key from `Project Settings > API`.

2.  **Run Supabase Migrations:**
    *   Ensure you have the Supabase CLI installed. If not, follow the instructions [here](https://supabase.com/docs/guides/cli).
    *   Link your local project to your Supabase project:
        ```bash
        supabase login
        supabase link --project-ref <your-supabase-project-ref>
        ```
    *   Apply the database migrations located in the `supabase/migrations` directory:
        ```bash
        supabase db push
        ```
    *   This will create all necessary tables (`profiles`, `departments`, `courses`, `attendance`, `marks`, `fees`, `od_requests`, `chats`) and set up Row Level Security (RLS) policies and triggers.

3.  **Set up Storage Buckets:**
    *   In your Supabase project dashboard, navigate to `Storage`.
    *   Create a new bucket named `od_documents`.
    *   Set its public access to `ON` if you want documents to be publicly viewable (e.g., for teachers to view student OD requests). Otherwise, you'll need to implement signed URLs for access.

### Environment Variables

Create a `.env` file in the root of your project and add your Supabase credentials:

```
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
```

Replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_PUBLIC_KEY` with the values from your Supabase project settings.

### Run the Application

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:8080`.

## User Roles & Permissions

The ERP system implements robust role-based access control. Upon first login, a user's role is determined by their profile in the `profiles` table.

### Super Admin

*   **Dashboard:** Comprehensive overview with quick stats.
*   **User Management:**
    *   Add new Teachers and Students.
    *   View, edit, and delete any user profile.
*   **Academic Configuration:**
    *   Manage (add, edit, delete) Departments.
    *   Manage (add, edit, delete) Courses.
*   **Financial Management:** View and manage all student fee records, including marking payments.
*   **Approvals:** Approve/Reject On Duty (OD) requests.
*   **Attendance & Marks:** View all attendance and marks records.
*   **Profile:** View and manage their own profile.

### Admin

*   **Dashboard:** Administrative overview.
*   **User Management:**
    *   Add new Teachers and Students.
*   **Academic Management:**
    *   Mark attendance for any class.
    *   View all attendance logs.
    *   View all marks records.
*   **Financial Management:** Update student fee statuses (mark as paid).
*   **Approvals:** Approve/Reject On Duty (OD) requests.
*   **Profile:** View and manage their own profile.

### Teacher

*   **Dashboard:** Overview of assigned classes and student-related tasks.
*   **Academic Management:**
    *   Mark attendance for their assigned classes.
    *   Upload marks for their assigned courses.
    *   View their assigned classes.
*   **Student Information:** View student profiles.
*   **Communication:** Participate in class-specific chats.
*   **Approvals:** Approve/Reject On Duty (OD) requests.
*   **Profile:** View and manage their own profile.

### Student

*   **Dashboard:** Personal overview of academic progress.
*   **Academic Records:**
    *   View their attendance records.
    *   View their marks.
*   **Financial Records:** View their fee status and outstanding amounts.
*   **Requests:** Submit On Duty (OD) requests.
*   **Communication:** Participate in class-specific chats.
*   **Profile:** View and manage their own profile.

## Project Structure

The project follows a standard React application structure with a focus on modularity:

```
.
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, icons, etc.
│   ├── components/
│   │   ├── auth/            # Authentication-related components (AuthPage, ProtectedRoute, SessionContextProvider)
│   │   ├── layout/          # Layout components (MainLayout, Sidebar, DashboardPage, PageHeader)
│   │   └── ui/              # Shadcn/ui components (auto-generated)
│   ├── hooks/               # Custom React hooks (e.g., useDepartments, useCourses, useChatMessages)
│   ├── integrations/        # Supabase client setup
│   ├── lib/                 # Utility functions (e.g., cn for Tailwind)
│   ├── pages/
│   │   ├── erp/             # ERP-specific pages (AddStudent, ManageUsers, MarkAttendance, FeesRecords, etc.)
│   │   ├── AuthPage.tsx     # Generic authentication page for roles
│   │   ├── DashboardPage.tsx# Generic dashboard page for roles
│   │   ├── Index.tsx        # Role selection landing page
│   │   └── NotFound.tsx     # 404 error page
│   ├── utils/               # General utility functions (e.g., toast notifications, auth-helpers)
│   ├── App.tsx              # Main application component, defines routes
│   ├── globals.css          # Global styles (Tailwind base, components, utilities)
│   └── main.tsx             # Entry point for React application
├── supabase/                # Supabase migrations and database setup
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build tool configuration
└── package.json             # Project dependencies and scripts
```

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode. Open [http://localhost:8080](http://localhost:8080) to view it in your browser.
*   `npm run build`: Builds the app for production to the `dist` folder.
*   `npm run lint`: Lints the project files.
*   `npm run preview`: Serves the `dist` folder locally for previewing the production build.

## Deployment Recommendations

To make deployments faster, more reliable, and prevent frontend-backend mismatches, consider the following:

1.  **Build Multiple Deployments Simultaneously:** Configure your hosting (e.g., Vercel) to allow concurrent builds or enable "Builds in Parallel" so you never wait for a queued build.
2.  **Switch to a Bigger Build Machine:** If builds are slow, increase your build machine size to reduce build time (can be up to ~40% faster depending on workload).
3.  **Prevent Frontend-Backend Mismatches:** Automate syncing client and server versions—tag releases, use the same commit SHAs for backend and frontend, or embed API version checks during startup to avoid conflicts.
4.  **Find & Configure a Custom Domain:** Purchase and configure a custom domain for production. Many hosts (including Vercel) offer fast, private, at-cost domains and simple DNS setup.

Tip: If you're deploying on Vercel, review `vercel.json` or your project settings to set the preferred build machine, concurrency options, and domain configuration. Keep CI/CD deploy previews enabled for pull requests to catch mismatches early.