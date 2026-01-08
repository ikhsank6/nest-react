# NestJS + React Full-Stack Application

Arsitektur full-stack dengan backend NestJS dan frontend React.

## Features

- ✅ Global response format yang konsisten
- ✅ Validasi backend dengan errorId unik
- ✅ Logging daily file dengan Winston
- ✅ JWT authentication
- ✅ RBAC (Role-Based Access Control)
- ✅ Dynamic sidebar berdasarkan role

## Quick Start

### 1. Setup Database

Pastikan PostgreSQL sudah terinstall dan buat database:

```sql
CREATE DATABASE nest_react_db;
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env dengan credentials database Anda

npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

npm run start:dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

### Default Credentials

```
Email: admin@example.com
Password: admin123
```

## Project Structure

```
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── common/          # Interceptors, filters, guards, pipes
│   │   ├── logger/          # Winston logger
│   │   ├── prisma/          # Prisma service
│   │   └── modules/         # Feature modules
│   └── prisma/              # Database schema & seed
│
└── frontend/                # React Frontend
    └── src/
        ├── config/          # Axios, env
        ├── services/        # API services
        ├── layouts/         # Auth & Dashboard layouts
        └── pages/           # Page components
```

## API Response Format

### Success

```json
{
  "meta": {
    "error": 0,
    "message": "Success",
    "status": true
  },
  "data": { ... }
}
```

### Error

```json
{
  "meta": {
    "error": "07fc6f80126",
    "message": "email harus diisi.",
    "status": false,
    "exception": {
      "line": "45",
      "file": "auth.service.ts"
    }
  },
  "data": {}
}
```
