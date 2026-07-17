# Kolkata Metro Project – Frontend Technical Assessment

> **Duration:** 24 hours
> **Difficulty:** Intermediate  
> **Tech Stack:** React (Vite), Python (FastAPI), PostgreSQL, SQLite

---

# Objective

This assessment is designed to evaluate your ability to:

- Understand an unfamiliar codebase
- Debug and resolve existing issues
- Configure and run a full-stack application
- Read and understand an existing database schema
- Integrate frontend with backend APIs
- Implement missing frontend functionality
- Write clean, maintainable, and production-ready code

---

# Project Overview

You are provided with a partially completed **Kolkata Metro Management System**.

The repository contains:

- React + Vite frontend
- Python (FastAPI) backend
- PostgreSQL database
- SQLite database

The project already contains the complete Kolkata Metro station dataset.

**Important:**

- All metro station data has already been loaded into the provided SQLite database.
- **You are NOT required to populate or modify the station data.**
- Your responsibility is to understand the existing project and complete the missing frontend functionality.

---

# Database Information

The SQLite database already contains all Kolkata Metro station information.

To understand the database schema, relationships, and available tables, refer to:

```
database_setup/sqlite_ddl_description.md
```

Read this document before implementing any functionality that interacts with the database.

---

# Assessment Workflow

The assessment consists of **three stages**.

---

# Stage 1 — Setup & Debugging

## Goal

Run the complete application successfully.

## Tasks

- Clone the repository.
- Install all required dependencies.
- Configure the project.
- Identify and fix any bugs preventing the application from running.
- Start both frontend and backend successfully.

### Expected Outcome

The application should launch without runtime errors.

---

# Stage 2 — Verification

Once the project is running successfully:

1. Open the homepage.
2. A verification code will be displayed.
3. Copy the verification code.
4. Submit the code using the provided Google Form / Google Sheet / Google Drive link.

Only after submitting the verification code should you continue to Stage 3.

---

# Stage 3 — Feature Implementation

The backend APIs already exist.

Your task is to complete the missing frontend implementation.

---

## Feature 1 — Display All Metro Stations

### Backend Status

The backend endpoint is already implemented.

### Your Task

Implement the frontend functionality to:

- Fetch all metro stations from the backend API.
- Display the stations in the UI.
- Show an appropriate loading state.
- Handle API failures gracefully.
- Ensure the UI is responsive and user-friendly.

---
## Feature 2 — Shortest Route Finder

### Backend Status

The backend endpoint for finding the shortest route has already been created.

However, **the endpoint is intentionally incomplete**.

The route calculation logic has **not** been implemented.

### Your Task

You are required to complete the backend implementation by writing the missing route-finding logic inside the existing endpoint.

After implementing the backend logic, complete the frontend integration.

### Functional Requirements

Your implementation should:

- Accept a source station.
- Accept a destination station.
- Compute the shortest route between the two stations using the metro network stored in the SQLite database.
- Return the route through the existing API endpoint.
- Integrate the frontend with this API.
- Display the computed route in the UI.

### Notes

- **Do not create a new endpoint.**
- **Do not modify the existing API contract.**
- Implement the missing business logic within the existing endpoint.
- Use the existing SQLite database, which already contains all Kolkata Metro station data.
- The required database schema documentation is available at:

```
database_setup/sqlite_ddl_description.md
```

Study the schema before implementing the route calculation logic.

The final implementation should allow users to:

- Select a source station.
- Select a destination station.
- Retrieve the shortest route.
- Display the route clearly in the frontend.
- Handle invalid inputs and API errors gracefully.

# Technical Expectations

Your solution should demonstrate:

- Clean React architecture
- Proper component organization
- Reusable components where appropriate
- Good state management
- Proper API integration
- Error handling
- Loading states
- Clean and readable code

---

# Submission Requirements

After completing the assessment, submit the following:

## 1. Homepage Verification Code

Submit the verification code displayed on the homepage.

---

## 2. Required Screenshots

Capture screenshots of the homepage showing the successfully generated routes for the following station pairs:

### Route 1

```
Dakshineswar → VIP Bazar
```

### Route 2

```
Park Street → Howrah
```

### Route 3

```
Thakurpukur → Eco Park
```

The screenshots should clearly show the calculated route.

---

## 3. Git Repository

Push your completed solution to a **public Git repository**.

Submit the repository URL along with your assessment.

---

## 4. TESTIMONIAL.md

Create a file named

```
TESTIMONIAL.md
```

in the **root directory** of the project.

This document should briefly describe:

- Your overall approach
- How you understood the project
- Bugs you encountered
- How you resolved them
- Challenges faced
- Assumptions made
- Any improvements you would make if given more time

This is intended to help us understand your problem-solving process.

---

# What You May Modify

You may modify:

- React components
- Pages
- CSS
- Hooks
- Utilities
- API integration layer
- Backend bug fixes (only if necessary to run the project)

---

# What You Should Not Modify

Unless absolutely necessary, do **not** modify:

- Database schema
- Existing API contracts
- API endpoint URLs
- Metro station data stored in SQLite

---

# Submission Checklist

Before submitting, ensure the following are completed:

- [ ] Project runs successfully
- [ ] Frontend runs successfully
- [ ] Backend runs successfully
- [ ] Verification code submitted
- [ ] Metro stations are displayed correctly
- [ ] Shortest route functionality works correctly
- [ ] Required screenshots captured
- [ ] Public Git repository created
- [ ] Repository URL submitted
- [ ] TESTIMONIAL.md added to the project root
- [ ] No unnecessary code changes
- [ ] No runtime errors

---

# Evaluation Criteria

| Category | Weight |
|-----------|-------:|
| Project Setup & Debugging | 20% |
| Code Quality | 20% |
| Frontend API Integration | 20% |
| Feature Implementation | 25% |
| UI/UX & Error Handling | 10% |
| Documentation & Submission | 5% |

---

# Notes

- Internet access is allowed.
- You may use official documentation.
- You may use AI-assisted coding tools unless instructed otherwise.
- Focus on writing clean, maintainable, production-quality code.
- We are interested in both your final implementation and your engineering approach.

---

# Deliverables

Your submission must include:

- Working source code
- Verification code submission
- Public Git repository URL
- Screenshots for the three required routes
- `TESTIMONIAL.md` in the project root

---

# Best of Luck!

This assessment is intended to evaluate your ability to understand an existing codebase, debug issues, integrate with existing APIs, and implement missing frontend functionality while maintaining clean engineering practices.