# TerraRun: Complete Setup Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Mobile App Setup](#mobile-app-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

```bash
# Node.js 18+ and npm
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0

# PostgreSQL 15+ with PostGIS
psql --version  # Should be >= 15

# Redis 7+
redis-cli --version  # Should be >= 7.0

# React Native development tools
npx react-native --version
```

### For Mobile Development

**Android:**
- Android Studio with SDK 33+
- Java JDK 17
- Android device or emulator

**iOS (macOS only):**
- Xcode 14+
- CocoaPods
- iOS device or simulator

---

## 🗄️ Database Setup

### Step 1: Install PostgreSQL with PostGIS

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-15-postgis-3 postgis
```

**macOS:**
```bash
brew install postgresql@15 postgis
brew services start postgresql@15
```

**Windows:**
Download and install from [PostgreSQL.org](https://www.postgresql.org/download/windows/)
Then install PostGIS from [Stack Builder](https://postgis.net/windows_downloads/)

### Step 2: Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE terrarun;
CREATE USER terrarun_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE terrarun TO terrarun_user;

# Connect to terrarun database
\c terrarun

# Enable PostGIS extensions
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION pg_trgm;

# Exit
\q
```

### Step 3: Run Schema Migration

```bash
cd terrarun-app/database
psql -U postgres -d terrarun -f schema.sql
```

### Step 4: Verify Installation

```bash
psql -U postgres -d terrarun

# Check PostGIS version
SELECT PostGIS_Version();

# Check tables
\dt

# Should show: users, activities, territories, etc.
```

---

## 🖥️ Backend Setup

### Step 1: Install Dependencies

```bash
cd terrarun-app/backend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Database
DATABASE_URL=postgresql://terrarun_user:your_secure_password@localhost:5432/terrarun
DB_HOST=localhost
DB_PORT=5432
DB_NAME=terrarun
DB_USER=terrarun_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=change-this-to-a-random-64-character-string
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# WebSocket
WS_PORT=8080

# API Keys (get from respective services)
MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token
STRIPE_SECRET_KEY=sk_test_your-stripe-key

# Allowed Origins (for CORS)
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000
```

### Step 3: Create Logs Directory

```bash
mkdir -p logs
```

### Step 4: Test Database Connection

```bash
node -e "const db = require('./src/config/database'); db.one('SELECT NOW()').then(console.log).catch(console.error)"
```

Should output current timestamp.

### Step 5: Start Development Server

```bash
npm run dev
```

Server should start on `http://localhost:3000`

### Step 6: Test API

```bash
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","timestamp":"...","services":{"database":"connected","redis":"connected"}}
```

---

## 📱 Mobile App Setup

### Step 1: Install Dependencies

```bash
cd terrarun-app/mobile
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```env
API_URL=http://localhost:3000
WS_URL=ws://localhost:8080
MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token
```

**For Android emulator:**
```env
API_URL=http://10.0.2.2:3000
WS_URL=ws://10.0.2.2:8080
```

**For iOS simulator:**
```env
API_URL=http://localhost:3000
WS_URL=ws://localhost:8080
```

### Step 3: Platform-Specific Setup

**Android:**
```bash
# Generate keystore (for release builds)
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore terrarun-release.keystore -alias terrarun -keyalg RSA -keysize 2048 -validity 10000

# Return to mobile directory
cd ../..

# Start Metro bundler
npm start

# In another terminal, run Android app
npm run android
```

**iOS (macOS only):**
```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..

# Run iOS app
npm run ios
```

### Step 4: Request Permissions

The app requires location permissions. On first launch:

- **Android**: Grant "Allow all the time" for location
- **iOS**: Grant "Always" for location

---

## 🚀 Running the Application

### Option 1: Development Mode (Recommended for Testing)

**Terminal 1 - Database & Redis:**
```bash
# PostgreSQL should be running
sudo systemctl status postgresql

# Start Redis
redis-server
```

**Terminal 2 - Backend:**
```bash
cd terrarun-app/backend
npm run dev
```

**Terminal 3 - Mobile Metro:**
```bash
cd terrarun-app/mobile
npm start
```

**Terminal 4 - Mobile App:**
```bash
# For Android
npm run android

# OR for iOS
npm run ios
```

### Option 2: Using Docker (Easier Setup)

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: terrarun
      POSTGRES_USER: terrarun_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://terrarun_user:secure_password@postgres:5432/terrarun
      REDIS_HOST: redis
      NODE_ENV: development
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

Run everything:
```bash
docker-compose up -d
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Mobile Tests

```bash
cd mobile

# Jest unit tests
npm test

# E2E tests (requires Detox setup)
npm run test:e2e
```

### Manual API Testing

Use the included Postman collection or test with curl:

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🌐 Deployment

### Backend Deployment (AWS/Heroku)

**AWS ECS (Docker):**

1. Build Docker image:
```bash
cd backend
docker build -t terrarun-api .
```

2. Push to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker tag terrarun-api:latest YOUR_ECR_URL/terrarun-api:latest
docker push YOUR_ECR_URL/terrarun-api:latest
```

3. Deploy to ECS using task definition

**Heroku:**
```bash
heroku create terrarun-api
heroku addons:create heroku-postgresql:standard-0
heroku addons:create heroku-redis:premium-0
git push heroku main
```

### Database Migration on Production

```bash
# Connect to production database
psql $DATABASE_URL -f database/schema.sql
```

### Mobile App Deployment

**Android (Google Play):**

1. Generate signed APK/AAB:
```bash
cd android
./gradlew bundleRelease
```

2. Upload to Google Play Console

**iOS (App Store):**

1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

---

## 🔍 Troubleshooting

### Database Connection Issues

**Error:** `ECONNREFUSED localhost:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if stopped
sudo systemctl start postgresql

# Check if listening on correct port
sudo netstat -plnt | grep 5432
```

### PostGIS Not Found

**Error:** `function st_geomfromtext does not exist`

**Solution:**
```bash
psql -U postgres -d terrarun
CREATE EXTENSION IF NOT EXISTS postgis;
\dx  # List extensions
```

### Mobile App Won't Connect to Backend

**Android:**
- Use `10.0.2.2` instead of `localhost`
- Check firewall allows port 3000
- Verify `adb reverse tcp:3000 tcp:3000`

**iOS:**
- Use computer's local IP (e.g., `192.168.1.100`)
- Enable "Allow Arbitrary Loads" in Info.plist for development

### Redis Connection Failed

```bash
# Install Redis
sudo apt install redis-server  # Ubuntu
brew install redis  # macOS

# Start Redis
redis-server

# Test connection
redis-cli ping  # Should return PONG
```

### GPS Not Working on Emulator

**Android:**
- Enable location in emulator settings
- Send mock locations via Extended Controls
- Grant "Allow all the time" permission

**iOS:**
- Simulator > Features > Location > Custom Location
- Enter coordinates manually

### Build Errors

```bash
# Clear Metro cache
npm start -- --reset-cache

# Clean build
cd android && ./gradlew clean && cd ..
npm run android

# For iOS
cd ios && pod deintegrate && pod install && cd ..
npm run ios
```

---

## 📊 Performance Optimization

### Database Indexes

Already included in schema.sql, but verify:
```sql
\di  -- List all indexes

-- Key indexes:
-- idx_territories_geom (GIST)
-- idx_activities_track (GIST)
-- idx_users_location (GIST)
```

### Redis Caching

Implemented for:
- User sessions (1 hour TTL)
- Territory lookups (5 min TTL)
- Leaderboards (1 hour TTL)

### Mobile App

- GPS compression reduces track size by 90%
- Map tiles cached automatically
- Lazy loading of territories (only visible area)

---

## 📞 Support

- **Documentation**: `/docs` folder
- **API Docs**: `http://localhost:3000/api`
- **Issues**: GitHub Issues
- **Email**: support@terrarun.app

---

## 🎉 Success Checklist

Before going live, verify:

- [ ] Database schema applied successfully
- [ ] All backend tests passing
- [ ] Mobile app builds for both platforms
- [ ] GPS tracking working accurately
- [ ] Territory capture functioning
- [ ] Anti-cheat system active
- [ ] TerraCoins economy working
- [ ] WebSocket real-time alerts functional
- [ ] Payment integration (Stripe) tested
- [ ] Push notifications configured
- [ ] SSL/TLS certificates installed (production)
- [ ] Monitoring and logging active
- [ ] Backup strategy implemented

---

**You're now ready to conquer the world with TerraRun! 🏃‍♂️🌍**