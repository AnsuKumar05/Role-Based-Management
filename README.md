# Ansu Kumar Hotels - Hotel Management System

A full-stack hotel management web application featuring a modern React frontend and a robust ASP.NET Core backend connected to PostgreSQL.

---

## Clean Project Structure

```text
HotelManagementSystem/
├── backend/                  # ASP.NET Core .NET 10 API & Server
│   ├── Controllers/          # REST API Controllers (Auth, Rooms, Bookings, Menu, Admin)
│   ├── Data/                 # Entity Framework Core ApplicationDbContext & Seeders
│   ├── DTOs/                 # Request & Response Data Transfer Objects
│   ├── Models/               # Domain Database Entities (User, Room, Booking, MenuItem)
│   ├── Properties/           # Launch & Environment Settings (launchSettings.json)
│   ├── Repositories/         # Repository Data Access Layer
│   ├── Services/             # Business Logic Services & Email Handlers
│   ├── appsettings.json      # Connection Strings & App Configuration 
│   ├── HotelManagementSystem.csproj
│   ├── Program.cs            # Server Middleware, Authentication & SPA Fallback
│   └── wwwroot/              # Static Web Assets (images, css) & Compiled React Bundle
│
├── frontend/                 # React 19 + Vite Single Page Application (SPA)
│   ├── public/               # Public Static Assets (images, css)
│   ├── src/
│   │   ├── components/       # Reusable UI Components & Modals (Header, Footer, Gallery, etc.)
│   │   ├── context/          # React Contexts (AuthContext, ThemeContext)
│   │   ├── data/             # Curated Room & Dining Metadata
│   │   ├── pages/            # Page Views (Home, Rooms, Booking, MyBookings, Login, Register, Forgot, Profile, Admin)
│   │   ├── App.jsx           # Route Hierarchy & Navigation
│   │   └── main.jsx          # React Application Root Mount
│   ├── index.html            # SPA Entry Template
│   ├── package.json          # Frontend Dependencies & Scripts
│   └── vite.config.js        # Vite Build & Development Proxy Configuration
│
└── package.json              # Root Convenience Scripts
```

---

## How to Run the Project

### 1. Run the Backend (.NET API)
```bash
cd backend
dotnet run
```
Backend API will start on `http://localhost:5000` (and `https://localhost:5001`).

### 2. Run the Frontend (React Development Server with Hot Reload)
```bash
cd frontend
npm install
npm run dev
```
Access the client at `http://localhost:3000` (API requests are automatically proxied to the backend at `http://localhost:5000`).

### 3. Production Build
```bash
cd frontend
npm run build
cd ../backend
dotnet run
```
Access the full application directly at `http://localhost:5000`.