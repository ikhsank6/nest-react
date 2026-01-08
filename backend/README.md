# NestJS Backend

Backend API untuk aplikasi dengan arsitektur:

- Global response format yang konsisten
- Validasi dengan errorId unik
- Daily rotating log files
- JWT authentication + RBAC

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run start:dev
```

## API Endpoints

### Auth

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/forgot-password` - Forgot Password
- `GET /api/auth/profile` - Get Profile (Auth required)

### Users (Admin only)

- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles (Admin only)

- `GET /api/roles` - List roles
- `GET /api/roles/:id` - Get role
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Menus (Admin only)

- `GET /api/menus` - List menus
- `GET /api/menus/:id` - Get menu
- `POST /api/menus` - Create menu
- `PUT /api/menus/:id` - Update menu
- `DELETE /api/menus/:id` - Delete menu

### Menu Access

- `GET /api/menu-access/my-menus` - Get accessible menus (Auth required)
- `GET /api/menu-access/role/:roleId` - Get menu access by role (Admin)
- `POST /api/menu-access` - Create menu access (Admin)
- `PUT /api/menu-access/bulk` - Bulk update menu access (Admin)
- `PUT /api/menu-access/:id` - Update menu access (Admin)
- `DELETE /api/menu-access/:id` - Delete menu access (Admin)

## Response Format

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
