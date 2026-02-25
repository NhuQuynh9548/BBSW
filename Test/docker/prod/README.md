# Production Docker Deployment

## Database đã có sẵn
Sử dụng PostgreSQL đang chạy trên port 5437:
```
Container: pg_thuchi
Port: 5437
Database: bluebolt
User: thuchi
```

## Yêu cầu
- Docker & Docker Compose
- Container pg_thuchi đang chạy

## Cấu hình

### 1. Tạo file .env từ template
```bash
cd docker/prod
cp .env.example .env
```

### 2. Cập nhật các biến môi trường trong .env
```bash
nano .env
```

**Quan trọng**: Thay đổi `JWT_SECRET` thành một giá trị bí mật mạnh.

## Deployment

### 1. Build và khởi động containers
```bash
cd docker/prod
docker-compose up -d --build
```

### 2. Kiểm tra trạng thái
```bash
docker-compose ps
docker-compose logs -f
```

### 3. Chạy migrations (nếu cần)
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 4. Seed data (nếu cần)
```bash
docker-compose exec backend npx prisma db seed
```

## Cập nhật ứng dụng

### Pull code mới và rebuild
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Chỉ rebuild một service
```bash
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

## Backup Database

### Tạo backup (từ container pg_thuchi)
```bash
docker exec pg_thuchi pg_dump -U thuchi bluebolt > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore backup
```bash
cat backup.sql | docker exec -i pg_thuchi psql -U thuchi bluebolt
```

## Logs & Monitoring

### Xem logs realtime
```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend

# Chỉ frontend  
docker-compose logs -f frontend
```

### Kiểm tra health
```bash
# Backend health
curl http://localhost:5001/api/health

# Frontend
curl http://localhost:3000
```

## URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api
- Database: localhost:5437 (pg_thuchi)

## Nginx Proxy Manager Configuration

Nếu sử dụng NPM để reverse proxy:

1. **Proxy Host cho Frontend:**
   - Domain: bbplatform.bluebolt.vn
   - Forward Hostname: 192.167.10.120
   - Forward Port: 3000
   - Enable SSL (Let's Encrypt)

2. Frontend server.cjs sẽ tự động proxy `/api/*` requests đến backend.

## Troubleshooting

### Container không start
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Kiểm tra pg_thuchi đang chạy
```bash
docker ps | grep pg_thuchi
```

### Database connection issues
```bash
docker-compose exec backend npx prisma db push --force-reset
```

### Rebuild từ đầu
```bash
docker-compose down
docker-compose up -d --build
```

## Security Notes
- Không commit file .env vào git
- Giữ JWT_SECRET bí mật
