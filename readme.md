# 🔐 Auxonia auth system

This is my take on authentication system. Logic is mine no code is taken from anybody.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

## ✨ Features

- 🔒 Session-based authentication with Redis
- 🚀 Express.js backend with TypeScript
- ⚛️ React frontend with Vite
- 📊 PostgreSQL with Prisma ORM
- 🔑 JWT token management
- 🛡️ OWASP security compliance

## 🏗️ Architecture

```mermaid
graph LR
    A[React Frontend] -->|Type-safe API calls| B[Express Backend]
    B -->|Session Management| C[Redis]
    B -->|Data Storage| D[PostgreSQL]
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL
- Redis
- pnpm

### Backend Setup
```bash
cd backend
pnpm install
cp .env.example .env
pnpm prisma migrate dev
pnpm dev
```

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```

## 🔐 Security Features

- ✅ CSRF Protection
- ✅ Rate Limiting
- ✅ Session Management
- ✅ Password Hashing (Argon2)
- ✅ SQL Injection Prevention
- ✅ XSS Protection

## 📚 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get user profile |
| PUT | `/api/auth/password` | Update password |

## 🧪 Testing

```bash
# Backend tests
cd backend && pnpm test

# Frontend tests
cd frontend && pnpm test
```

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── prisma/
│   └── tests/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   └── pages/
    └── tests/
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/auth"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000"
```

## 📈 Performance

- Redis caching for sessions
- Connection pooling
- Rate limiting
- Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE for details
```

Similar code found with 2 license types