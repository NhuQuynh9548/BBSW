# Development Docker Setup

## Database đã có sẵn
Sử dụng PostgreSQL đang chạy trên port 5437:
```
Container: pg_thuchi
Port: 5437
Database: bluebolt
User: thuchi
```

## Cách sử dụng

### 1. Khởi động môi trường dev
```bash
cd docker/dev
docker-compose up -d --build
```

### 2. Xem logs
```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend

# Chỉ frontend
docker-compose logs -f frontend
```

### 3. Chạy migration database
```bash
docker-compose exec backend npx prisma migrate dev
```

### 4. Seed database
```bash
docker-compose exec backend npx prisma db seed
```

### 5. Dừng môi trường
```bash
docker-compose down
```

## URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api
- API Docs: http://localhost:5001/api-docs
- Database: localhost:5437 (existing pg_thuchi)

## Hot Reload
- Frontend: Vite dev server với HMR
- Backend: Nodemon (nếu có trong package.json) hoặc restart container
