# AuditSoft - Plesk Deployment Guide

## Your Setup
- **Main Domain**: mw265.com
- **Frontend Subdomain**: app.mw265.com
- **Backend Subdomain**: api.mw265.com

---

## 📋 Pre-Deployment Checklist

- [ ] Node.js 18+ installed on Plesk server
- [ ] MySQL database created
- [ ] Git installed on Plesk server
- [ ] SSH access to Plesk server
- [ ] Two subdomains configured (app.mw265.com and api.mw265.com)

---

## 🚀 Step-by-Step Deployment

### Phase 1: Backend Deployment (api.mw265.com)

#### 1.1 Connect to Plesk via SSH

```bash
# SSH into your Plesk server
ssh user@your-plesk-server-ip
# or use Plesk Terminal if available
```

#### 1.2 Clone Backend Repository

```bash
cd /var/www/vhosts/mw265.com/api.mw265.com
git clone https://github.com/felixkumafutsa/auditsoft-backend.git .
```

#### 1.3 Install Dependencies

```bash
cd /var/www/vhosts/mw265.com/api.mw265.com
npm install
```

#### 1.4 Configure Environment Variables

Create `.env` file:

```bash
nano .env
```

Add the following (replace with your actual credentials):

```env
# Database Configuration
DATABASE_URL="mysql://auditsoft_user:your_secure_password@localhost:3306/auditsoft_db"

# Server Configuration
NODE_ENV=production
PORT=3000

# API Configuration
API_URL=https://api.mw265.com
FRONTEND_URL=https://app.mw265.com

# JWT Configuration (if implemented)
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRATION=7d
```

**To save in nano**: Press `Ctrl+X`, then `Y`, then `Enter`

#### 1.5 Create MySQL Database

In Plesk Databases panel or via SSH:

```bash
mysql -u root -p
# Enter your root password when prompted

CREATE DATABASE auditsoft_db;
CREATE USER 'auditsoft_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON auditsoft_db.* TO 'auditsoft_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 1.6 Run Database Migrations

```bash
cd /var/www/vhosts/mw265.com/api.mw265.com
npx prisma migrate deploy
```

**Optional: Seed sample data**

```bash
npx prisma db seed
```

#### 1.7 Build Backend

```bash
npm run build
```

#### 1.8 Install PM2 (Process Manager)

```bash
npm install -g pm2
```

#### 1.9 Create PM2 Configuration File

Create `ecosystem.config.js`:

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'auditsoft-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
EOF
```

#### 1.10 Start Backend with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Note**: Copy and run the command shown by `pm2 startup`

#### 1.11 Configure Plesk for Node.js Application

1. Login to Plesk
2. Go to **Websites & Domains** → **api.mw265.com**
3. Click **Web Hosting Settings**
4. Under **Application Server**, select:
   - **Enable Application Server**: Yes
   - **Application Server**: Node.js
   - **Document Root**: `/public` (or leave default)
5. Save changes

#### 1.12 Configure Reverse Proxy (Important!)

In Plesk Terminal or SSH:

```bash
# Configure nginx to reverse proxy to Node.js
# Edit the nginx config for api.mw265.com
nano /etc/nginx/conf.d/api.mw265.com.conf
```

Add or modify to include:

```nginx
upstream api_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.mw265.com;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Reload nginx:

```bash
systemctl reload nginx
```

---

### Phase 2: Frontend Deployment (app.mw265.com)

#### 2.1 Clone Frontend Repository

```bash
cd /var/www/vhosts/mw265.com/app.mw265.com/httpdocs
git clone https://github.com/felixkumafutsa/auditsoft-frontend.git .
```

#### 2.2 Install Dependencies

```bash
npm install
```

#### 2.3 Configure Environment Variables

Create `.env.production`:

```bash
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://api.mw265.com
REACT_APP_ENV=production
EOF
```

#### 2.4 Build Frontend for Production

```bash
npm run build
```

#### 2.5 Deploy Build Files

```bash
# Move build files to web root
cp -r build/* /var/www/vhosts/mw265.com/app.mw265.com/httpdocs/
```

#### 2.6 Configure Web Server for React Router

In Plesk, create `.htaccess` file in the root:

```bash
cat > /var/www/vhosts/mw265.com/app.mw265.com/httpdocs/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF
```

This ensures React Router works correctly.

#### 2.7 Verify Frontend is Accessible

Visit: `https://app.mw265.com`

---

### Phase 3: SSL/HTTPS Configuration

#### 3.1 Enable SSL in Plesk

1. Go to **Websites & Domains**
2. For both `app.mw265.com` and `api.mw265.com`:
   - Click the domain
   - Go to **SSL/TLS Certificates**
   - Click **Request a Free Let's Encrypt Certificate**
   - Select both subdomains
   - Click **Install**

#### 3.2 Redirect HTTP to HTTPS

In Plesk for each subdomain:
1. **Web Hosting Settings** → **Enable "Permanent SEO-safe redirect from HTTP to HTTPS"**

---

### Phase 4: Testing & Verification

#### 4.1 Test Backend API

```bash
# Test the API is running
curl -X GET https://api.mw265.com/audits
# Should return JSON response (may require auth)
```

#### 4.2 Test Frontend

1. Open `https://app.mw265.com` in browser
2. Verify the login page loads
3. Check browser console (F12) for any API errors

#### 4.3 Login Test

Use default test credentials:
- **Email**: admin@auditsoft.com
- **Password**: password123

(Change these credentials immediately in production!)

#### 4.4 Check Logs

**Backend Logs**:
```bash
pm2 logs auditsoft-backend
```

**Frontend**: Check browser console (F12 → Console)

---

## 🔒 Security Configuration

### 4.1 Database Security

```bash
# Change default MySQL root password
mysqladmin -u root -p password newpassword

# Remove test databases
mysql -u root -p -e "DROP DATABASE IF EXISTS test;"
```

### 4.2 Node.js Security

Update `.env` with secure values:
```env
JWT_SECRET=<generate-with-openssl: openssl rand -base64 32>
```

### 4.3 Firewall Rules

In Plesk or server firewall:
- Allow: Port 80 (HTTP)
- Allow: Port 443 (HTTPS)
- Allow: Port 3000 (Only for localhost/127.0.0.1)
- Block: Direct access to port 3000 externally

---

## 📊 Monitoring & Maintenance

### 5.1 Monitor Backend Process

```bash
# Check if PM2 is running
pm2 list

# View real-time logs
pm2 logs auditsoft-backend

# Monitor performance
pm2 monit
```

### 5.2 Check Disk Space

```bash
df -h
```

### 5.3 Database Backups

In Plesk:
1. Go to **Databases**
2. Select your database
3. Click **Backup** (or set up automatic backups)

### 5.4 Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update
npm audit fix
```

---

## 🚨 Troubleshooting

### Backend Won't Start

```bash
# Check PM2 logs
pm2 logs auditsoft-backend

# Check if port 3000 is in use
lsof -i :3000

# Restart PM2
pm2 restart auditsoft-backend
```

### Database Connection Error

1. Verify `.env` DATABASE_URL is correct
2. Check MySQL is running: `systemctl status mysql`
3. Test connection: `mysql -u auditsoft_user -p auditsoft_db`

### Frontend Shows Blank Page

1. Check browser console for errors (F12)
2. Verify `REACT_APP_API_URL` is correct in `.env.production`
3. Check frontend build: `ls /var/www/vhosts/mw265.com/app.mw265.com/httpdocs/index.html`

### API CORS Errors

The backend needs CORS configured. In backend `main.ts`:

```typescript
app.enableCors({
  origin: 'https://app.mw265.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
```

---

## 📱 Access Your System

### URLs
- **Frontend**: https://app.mw265.com
- **API**: https://api.mw265.com
- **Main Domain**: https://mw265.com (optional landing page)

### Test Credentials (Change Immediately!)
- Email: admin@auditsoft.com
- Password: password123

---

## 🔄 Future Updates

### Deploying New Code

**Backend**:
```bash
cd /var/www/vhosts/mw265.com/api.mw265.com
git pull origin main
npm install
npm run build
pm2 restart auditsoft-backend
```

**Frontend**:
```bash
cd /var/www/vhosts/mw265.com/app.mw265.com/httpdocs
git pull origin main
npm install
npm run build
cp -r build/* .
```

---

## 📞 Support Resources

1. **Plesk Documentation**: https://docs.plesk.com/
2. **Node.js on Plesk**: https://docs.plesk.com/en-US/onyx/cli-only/using-command-line-tools/nodejs-selector/
3. **Let's Encrypt**: https://letsencrypt.org/
4. **PM2 Documentation**: https://pm2.keymetrics.io/

---

## ✅ Deployment Completion Checklist

- [ ] SSH access confirmed
- [ ] Node.js 18+ installed
- [ ] MySQL database created
- [ ] Backend cloned and dependencies installed
- [ ] `.env` file configured with correct credentials
- [ ] Database migrations run successfully
- [ ] PM2 configured and running
- [ ] Backend accessible at https://api.mw265.com
- [ ] Frontend cloned and built
- [ ] Frontend accessible at https://app.mw265.com
- [ ] SSL certificates installed (HTTPS working)
- [ ] Login tested with default credentials
- [ ] API responding to requests
- [ ] Database backups configured
- [ ] Monitoring set up (PM2 logs)

---

## 🎉 You're Live!

Once all items are checked, your AuditSoft system is live on:
- **Frontend**: https://app.mw265.com
- **Backend API**: https://api.mw265.com

Congratulations on your successful deployment! 🚀

---

*Last Updated: January 2026*  
*Deployment Version: 1.0*
