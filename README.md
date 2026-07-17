# Kolkata Metro Booking & Verification System

A high-performance transit routing, booking, and system verification platform. It demonstrates a dual-database design utilizing **PostgreSQL** for transactional operational data (bookings, configurations, heartbeats) and **SQLite** for static metro graph topology and vault keys.

## Features

1. Smart Route Planner: Finds the fastest and cheapest way to travel across the metro network, including where you need to switch lines.

2. Auto-Expiring Tickets: Works in the background to automatically update and clear out your tickets once their time is up.

3. Ticket Dashboard: A clean screen where you can view all your active and past tickets, complete with digital QR codes.


---

## Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.9 or higher) & **pip**
- **PostgreSQL** database server running locally

---

## Setup Instructions

### 1. Database Setup

#### PostgreSQL Configuration
1. Start your local PostgreSQL server.
2. Create a database named `kolkata_metro`:
   ```sql
   CREATE DATABASE kolkata_metro;
   ```
3. Execute the schema initialization script:
   ```bash
   psql -h localhost -U postgres -d kolkata_metro -f database_setup/postgres_init.sql
   ```
   *(Adjust username `-U` and host `-h` options as needed for your local setup).*

#### SQLite Configuration
Database alraedy initialized

---

### 2. Backend Installation & Start

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Verify/configure environment settings in `.env` if your local Postgres connection credentials differ from the defaults.
5. Start the backend development server using uvicorn:
   ```bash
   python3 -m uvicorn app.main:app --reload --port 8000
   ```
   The backend API will run at `http://localhost:8000`. Swagger documentation is available at `http://localhost:8000/docs`.

---

### 3. Frontend Installation & Start

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The React application will launch at `http://localhost:5173`.
