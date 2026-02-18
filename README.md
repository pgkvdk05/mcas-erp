# MCAS College ERP

A modern, role-based Enterprise Resource Planning (ERP) system designed to streamline academic and administrative operations within a college environment. The platform centralizes attendance, marks, fees, user management, and OD request workflows in a secure and responsive dashboard.

---

## Overview

MCAS College ERP is a full-stack web application built to digitize institutional processes and improve operational efficiency. It provides structured role-based access control and secure data handling using modern web technologies.

---

## Features

- Role-Based Access Control (Super Admin, Admin, Teacher, Student)
- Secure Authentication and Authorization
- Attendance Management System
- Marks & Academic Records Management
- Fee Tracking and Management
- On-Duty (OD) Request Workflow
- Real-Time Data Synchronization
- Responsive Dashboard Interface
- Row-Level Security Implementation

---

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI

### Backend & Services
- Supabase (PostgreSQL Database)
- Supabase Authentication
- Supabase Storage
- Supabase Realtime

### Deployment
- Vercel

---

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/             # Application screens
├── hooks/             # Custom React hooks
├── integrations/      # Supabase configuration
├── lib/               # Utility functions
├── assets/            # Static files
└── main.tsx           # Entry point
```

---

## User Roles

### Super Admin
- Manage users and roles
- Configure departments and courses
- Monitor system-wide data

### Admin
- Manage attendance
- Manage marks
- Review fee records

### Teacher
- Mark attendance
- Upload student marks
- Approve or reject OD requests

### Student
- View attendance and marks
- Submit OD requests
- Track fee details

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/pgkvdk05/MCAS-College-ERP.git
cd MCAS-College-ERP
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file and add:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open in browser:

```
http://localhost:8080
```

---

## Security

- JWT-Based Authentication
- Role-Based Route Protection
- Supabase Row-Level Security (RLS)
- Controlled File Storage Access

---

## Purpose

This project demonstrates full-stack application architecture, secure data handling, and scalable UI development tailored for educational institutions.

---

## License

Licensed under the MIT License.

---

## Author

Developed as an academic and portfolio project showcasing modern ERP system design and implementation.
