# Shonra - Shopee Affiliate Management System

## 🏗️ System Architecture

```
Internet → Nginx (80/443)
    ├── / → Frontend (3000) → Backend API (3002) → Database (3306)
    ├── /backoffice/ → Backend Admin (5173) → Backend API (3002) → Database (3306)
    └── /api/ → Backend API (3002) → Database (3306)
```

📄 **ดูรายละเอียด**: **[ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🚀 Production Deployment

### Deployment Options

- **Portainer**: ดู **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**
- **Hostinger VPS**: ดู **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)** ⭐

### Quick Start

**สำหรับ Portainer:**
1. ใช้ `docker-compose.portainer.yml` สำหรับ deploy ใน Portainer
2. ตั้งค่า Environment Variables ตาม `DEPLOYMENT_GUIDE.md`
3. Deploy stack ใน Portainer

**สำหรับ Hostinger VPS:**
1. เชื่อมต่อ VPS ผ่าน SSH
2. ติดตั้ง Docker และ Docker Compose
3. ตามขั้นตอนใน `HOSTINGER_DEPLOYMENT.md`

### Containers (5 ตัว)

| Container | Port | Description |
|-----------|------|-------------|
| 🖥️ **frontend** | 3000 | Next.js Client (หน้าบ้าน) |
| 🔧 **backend-api** | 3002 | Express API Server |
| 🎛️ **backend-admin** | 5173 | React Admin Panel (หลังบ้าน) |
| 🗄️ **db** | 3306 | MySQL Database |
| 🌐 **nginx** | 80/443 | Reverse Proxy |

---

## 🔧 Development

### Local Development

**📄 ดูคู่มือละเอียด**: **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**

#### **Quick Start (แนะนำ):**

```bash
# Terminal 1: Frontend
npm run dev              # → http://localhost:3000

# Terminal 2: Backend (Admin + API)
cd backend
npm run dev              # → Admin: http://localhost:5173, API: http://localhost:3002
```

#### **Install Dependencies:**

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
cd server && npm install
```

### Development URLs

- 👉 **หน้าขายของ (Client)**: http://localhost:3000
- 👉 **หน้าหลังบ้าน (Admin)**: http://localhost:5173
- 👉 **API Service**: http://localhost:3002

**⚠️ หมายเหตุ**: ห้ามรัน Backend API 2 ครั้งพร้อมกัน (จะซ้อนทับ port 3002)

---

## 📁 Project Structure

```
shonra/
├── src/                          # Next.js frontend source
├── backend/                      # Backend services
│   ├── server/                   # Express API Server
│   │   ├── routes/               # API routes
│   │   ├── config/               # Database config
│   │   └── middleware/           # Express middleware
│   ├── components/               # React Admin Panel components
│   └── services/                 # Frontend API service
├── public/                       # Static assets
│
├── Dockerfile                    # Frontend container
├── Dockerfile.backend-admin      # Backend Admin Panel container
├── docker-compose.portainer.yml  # Portainer deployment config
├── nginx.portainer.conf          # Nginx reverse proxy config
│
├── DEPLOYMENT_GUIDE.md           # Production deployment guide
├── PRODUCTION_PATHS.md           # Production paths & checklist
├── DATABASE_SETUP.md             # Database setup guide
├── MIGRATION_GUIDE.md            # Migration guide
├── DDOS_PROTECTION.md            # DDoS protection status
│
└── backend/
    ├── START_HERE.md             # Database validation - เริ่มต้นที่นี่
    ├── DATABASE_CHECKLIST.md     # Database validation checklist
    └── database_setup.sql         # Database schema definition
```

---

## 🛡️ Security Features

### DDoS Protection
- ✅ **Rate Limiting**: API (10 req/s), Login (5 req/m)
- ✅ **Connection Limiting**: Frontend (30/IP), API (20/IP), Login (5/IP)
- ✅ **Timeout Protection**: ป้องกัน slowloris attacks
- ✅ **Request Size Limits**: จำกัด 50MB ต่อ request
- 📄 ดูรายละเอียด: **[DDOS_PROTECTION.md](./DDOS_PROTECTION.md)**

### Security Headers
- ✅ X-Frame-Options
- ✅ X-XSS-Protection
- ✅ X-Content-Type-Options
- ✅ Strict-Transport-Security (HSTS)
- ✅ Referrer-Policy

### Other Security
- ✅ CORS protection
- ✅ Container isolation
- ✅ Resource limits (CPU/Memory)
- ✅ Non-root user in containers

---

## 🗄️ Database

### Database Validation

**เริ่มต้น:** อ่าน **[backend/START_HERE.md](./backend/START_HERE.md)**

**คำสั่งตรวจสอบ:**
```bash
cd backend/server
node validate_database.js
```

**เอกสาร:**
- `backend/START_HERE.md` - เริ่มต้นที่นี่
- `backend/DATABASE_CHECKLIST.md` - Checklist สรุป
- `DATABASE_SETUP.md` - Database setup guide

### Database Schema

- **Schema Definition**: `backend/database_setup.sql`
- **Auto Migration**: Tables สร้างอัตโนมัติเมื่อ container เริ่มทำงาน
- **Manual Setup**: ดู `DATABASE_SETUP.md`

---

## 📚 Documentation

### Deployment
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment guide (Portainer)
- **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)** - Hostinger VPS deployment guide ⭐
- **[PRODUCTION_PATHS.md](./PRODUCTION_PATHS.md)** - Production paths & checklist
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migration guide

### Database
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup guide
- **[backend/START_HERE.md](./backend/START_HERE.md)** - Database validation (เริ่มต้น)
- **[backend/DATABASE_CHECKLIST.md](./backend/DATABASE_CHECKLIST.md)** - Validation checklist

### Security
- **[DDOS_PROTECTION.md](./DDOS_PROTECTION.md)** - DDoS protection status & recommendations

---

## 📊 Monitoring

- ✅ Docker health checks
- ✅ Application health endpoints (`/health`)
- ✅ Nginx access logs
- ✅ MySQL slow query logging
- ✅ Database validation scripts

---

## 🔍 Quick Commands

### Database Validation
```bash
cd backend/server
node validate_database.js  # Validation ครอบคลุม
```

### Development
```bash
npm run dev                # Frontend
cd backend && npm run dev  # Backend Admin
cd backend/server && npm run dev  # Backend API
```

### Docker
```bash
docker-compose -f docker-compose.portainer.yml up -d
```

---

## 🌐 Production

- **Domain**: https://www.shonra.com
- **Admin Panel**: https://www.shonra.com/backoffice/
- **API**: https://www.shonra.com/api/
- **Health Check**: https://www.shonra.com/health

---

## 📝 Environment Variables

ดูรายละเอียดใน **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** และ **[PRODUCTION_PATHS.md](./PRODUCTION_PATHS.md)**

---

## 🆘 Support

- **Deployment Issues**: ดู `DEPLOYMENT_GUIDE.md`
- **Database Issues**: ดู `DATABASE_SETUP.md` และ `backend/START_HERE.md`
- **Security Questions**: ดู `DDOS_PROTECTION.md`

---

**🎯 Version**: 1.0.0
