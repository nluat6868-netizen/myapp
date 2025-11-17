# Backend API Documentation

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and JWT secret

4. Start MongoDB (make sure MongoDB is running)

5. Run the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/me` - Get current user (Protected)

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in root:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start frontend:
```bash
npm run dev
```

## Notes

- Backend uses JWT for authentication
- All user routes require admin role
- Passwords are hashed using bcrypt
- MongoDB is used as the database




