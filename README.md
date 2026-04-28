# Vehicle Parts Selling and Inventory Management System

This is a C#.NET coursework project built with ASP.NET Core Web API, React, and PostgreSQL.

## Project Structure

- `backend/`: ASP.NET Core Web API project.
- `frontend/`: React frontend project (Create React App).

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/)

## Getting Started

### Backend Setup

1. Open `backend/appsettings.json`.
2. Update the `DefaultConnection` string with your local PostgreSQL credentials.
3. Open a terminal in the project root and run migrations:
   ```powershell
   dotnet ef migrations add InitialCreate --project backend
   dotnet ef database update --project backend
   ```
4. Run the backend:
   ```powershell
   dotnet run --project backend
   ```

### Frontend Setup

1. Open a terminal in `frontend`.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Run the frontend:
   ```powershell
   npm run dev
   ```
4. Access the app at `http://localhost:5173`.

## Group Collaboration Rules

### Branching Strategy
- **main**: Production-ready code. No direct commits.
- **develop**: Integration branch for features.
- **feature/[feature-name]**: Individual feature branches.

### Workflow
1. **Pull** latest changes from `develop`.
2. **Create a branch** for your task.
3. **Commit** regularly with descriptive messages.
4. **Push** your branch.
5. **Create a Pull Request (PR)** on GitHub.

## Features

- **Feature 1: Financial Reports** (Admin only)
  - Daily, Monthly, and Yearly reports.
  - Dashboard with stat cards and charts.
