# ☁️ AuditSoft Cloud Database Setup Guide

## Overview

This guide covers setting up a **cloud database** (Prisma Postgres) and seeding it with initial data **before deploying to Plesk**.

### Benefits of Cloud Database
✅ Automatic backups  
✅ Scalable infrastructure  
✅ No server management  
✅ Easy to share database across environments  
✅ Built-in monitoring & analytics  

---

## Option 1: Prisma Postgres (Recommended)

### 1.1 Create Prisma Postgres Account

1. **Go to**: https://console.prisma.io
2. **Click**: "Create Account" or "Sign In"
3. **Create** a new workspace for AuditSoft

### 1.2 Create Prisma Postgres Database

1. **In Prisma Console**:
   - Click: "Databases"
   - Click: "Create Database"
   - Enter:
     - Name: `auditsoft-production`
     - Region: Choose closest to mw265.com (EU/US)
   - Click: "Create"

2. **Wait** for database to provision (~1-2 minutes)

3. **Copy** the connection string:
   ```
   postgresql://user:password@aws-xxx.databases.prisma.io:5432/auditsoft_db
   ```

### 1.3 Update Your .env File

**Local .env** (for seeding):

```env
DATABASE_URL="postgresql://user:password@aws-xxx.databases.prisma.io:5432/auditsoft_db"
NODE_ENV=development
PORT=3000
API_URL=https://api.mw265.com
FRONTEND_URL=https://app.mw265.com
JWT_SECRET=your-secret-key-here
```

### 1.4 Run Database Migrations

On your **local machine**:

```bash
cd backend
npm install
npx prisma migrate deploy
```

This creates all tables in the cloud database.

Output should show:
```
✔ 2 migrations applied

All migrations have been successfully applied to the database.
```

### 1.5 Seed the Database

```bash
npx prisma db seed
```

This creates:
- ✅ 6 roles
- ✅ Admin user (`admin@auditsoft.com` / `password123`)
- ✅ Sample users for each role
- ✅ Sample audit records
- ✅ Sample findings

Output should show:
```
Running seed command `ts-node prisma/seed.ts`...
Start seeding ...
Role 'System Administrator' created.
Role 'Chief Audit Executive (CAE)' created.
Role 'Audit Manager' created.
Role 'Auditor' created.
Role 'Process Owner' created.
Role 'Executive / Board Viewer' created.
Default user 'admin@auditsoft.com' created with password 'password123'
...
Seeding finished.
```

### 1.6 Verify Database Seeding

Open **Prisma Studio** to view the data:

```bash
npx prisma studio
```

This opens a web interface where you can:
- ✅ View all users and roles
- ✅ View sample audits
- ✅ View sample findings
- ✅ Add/edit data if needed

---

## Option 2: MySQL Cloud (AWS RDS / DigitalOcean)

If using MySQL in the cloud instead of Prisma Postgres:

### 2.1 Create MySQL Database

**Example: AWS RDS**
1. Go to: AWS RDS Console
2. Create MySQL database (8.0+)
3. Save connection details:
   - Host: `auditsoft.xxx.rds.amazonaws.com`
   - User: `admin`
   - Password: Strong password
   - Database: `auditsoft_db`

### 2.2 Update .env

```env
DATABASE_URL="mysql://admin:password@auditsoft.xxx.rds.amazonaws.com:3306/auditsoft_db"
NODE_ENV=development
PORT=3000
API_URL=https://api.mw265.com
FRONTEND_URL=https://app.mw265.com
JWT_SECRET=your-secret-key-here
```

### 2.3 Run Migrations & Seed

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## Full Local Testing Before Cloud

### Test 1: Verify Migrations

```bash
npx prisma migrate deploy
```

Expected output: ✅ Migrations applied successfully

### Test 2: Verify Seeding

```bash
npx prisma db seed
```

Expected output: ✅ All roles, users, and samples created

### Test 3: Verify API Can Connect

Start your local backend:

```bash
npm run start
```

Should see:
```
[NestFactory] Nest application successfully started
Server running on http://localhost:3000
```

### Test 4: Test API Endpoints

```bash
curl https://localhost:3000/audits
```

Should return:
```json
[
  {
    "id": "...",
    "title": "Sample Audit",
    ...
  }
]
```

### Test 5: Test Frontend Login

1. Start frontend:
   ```bash
   cd auditsoft-frontend
   npm start
   ```

2. Go to: http://localhost:3001
3. Login with:
   - Email: `admin@auditsoft.com`
   - Password: `password123`

4. Should see admin dashboard with seeded data

---

## Migration & Seeding Details

### What Gets Created

**Roles** (6):
- System Administrator
- Chief Audit Executive (CAE)
- Audit Manager
- Auditor
- Process Owner
- Executive / Board Viewer

**Default Users**:
```
admin@auditsoft.com / password123 (System Admin)
executive@auditsoft.com / password123 (CAE)
manager@auditsoft.com / password123 (Audit Manager)
auditor@auditsoft.com / password123 (Auditor)
owner@auditsoft.com / password123 (Process Owner)
viewer@auditsoft.com / password123 (Executive Viewer)
```

**Sample Data**:
- Sample audits
- Sample findings
- Sample action plans
- Sample evidence records

### View Seed Script

Location: `backend/prisma/seed.ts`

Edit this file to customize seeding (add more sample data, change default users, etc.)

---

## Deploying Cloud Database to Plesk

### After Cloud Setup is Complete

Once your cloud database is seeded and tested:

### 1. Update Production .env

**For Plesk deployment**, use the cloud database URL in your `.env`:

```env
DATABASE_URL="postgresql://user:password@aws-xxx.databases.prisma.io:5432/auditsoft_db"
NODE_ENV=production
PORT=3000
API_URL=https://api.mw265.com
FRONTEND_URL=https://app.mw265.com
JWT_SECRET=your-actual-secret-key
```

### 2. Build Backend

```bash
npm run build
```

### 3. Upload to Plesk

Follow **PLESK-NO-SSH-DEPLOYMENT.md** Phase 2 with the cloud database URL in `.env`

### 4. No Migrations Needed on Plesk

Since migrations already ran locally against the cloud database, you:
- ✅ Don't need to run migrations again
- ✅ Don't need to seed again
- ✅ Just deploy the built backend
- ✅ Backend connects to same cloud database

---

## Comparison: Cloud vs Local Database

| Feature | Cloud (Recommended) | Plesk MySQL |
|---------|---|---|
| Setup time | 5 minutes | 10 minutes |
| Backups | Automatic | Manual required |
| Scalability | Built-in | Limited by server |
| Cost | Free tier available | Included with Plesk |
| Migration | Easy (same URL) | Need to migrate data |
| Disaster recovery | Built-in | Need to set up |
| Monitoring | Built-in | Check phpMyAdmin |

---

## Step-by-Step Cloud Setup (Quick Version)

### For Prisma Postgres

```bash
# 1. Go to https://console.prisma.io and create database

# 2. Copy connection string, update .env file

# 3. Run migrations
npx prisma migrate deploy

# 4. Seed database
npx prisma db seed

# 5. View with Prisma Studio
npx prisma studio

# 6. Test local backend
npm run start

# 7. Build for production
npm run build

# 8. Upload dist/ folder to Plesk with cloud DATABASE_URL
```

---

## Troubleshooting Cloud Database

### Problem: "Cannot connect to database"

**Solutions**:
1. Check connection string is correct in `.env`
2. Check database is in "Available" state in Prisma Console
3. Check IP whitelist (if database has IP restrictions)
4. Test connection:
   ```bash
   npx prisma db execute --stdin < query.sql
   ```

### Problem: "Migration failed"

**Solutions**:
1. Check database is empty (no existing schema)
2. Check all migrations files exist in `prisma/migrations/`
3. Reset and retry:
   ```bash
   npx prisma migrate reset
   ```
   ⚠️ **Warning**: This deletes all data!

### Problem: "Seed failed"

**Solutions**:
1. Check migrations ran first: `npx prisma migrate deploy`
2. Check for duplicate email in seed script
3. Check database permissions
4. View error logs for details

---

## Environment Configuration Summary

### Local Development
```env
DATABASE_URL=cloud_or_local_db_url
NODE_ENV=development
```

### Plesk Production
```env
DATABASE_URL=same_cloud_db_url  # Use cloud database!
NODE_ENV=production
```

**Key Point**: Use the **same database URL** for both local and production. This way:
- Migrations run once locally
- Data is available on Plesk immediately
- No data migration needed
- Easy to debug issues

---

## After Deployment to Plesk

### 1. Verify Database Connected
```bash
curl https://api.mw265.com/audits
```

Should return JSON with seeded audits.

### 2. Login with Default Account
- Email: `admin@auditsoft.com`
- Password: `password123`

### 3. Change Default Password
```bash
POST /auth/change-password
{
  "currentPassword": "password123",
  "newPassword": "your-new-strong-password"
}
```

### 4. Create Real User Accounts
Use the admin dashboard to create actual user accounts for:
- CAE
- Audit Managers
- Auditors
- Process Owners
- Executives

### 5. Delete Sample Data (Optional)
If you want to remove sample audits/findings:
```bash
npx prisma studio  # Open the GUI
# Delete sample records manually
```

---

## Backup Cloud Database

### Prisma Postgres
- Automatic daily backups included
- Access in Prisma Console → Backups

### AWS RDS / Other Cloud
- Configure automatic backup retention
- Test restore process
- Document backup location

---

## Security Checklist

- [ ] Change default admin password immediately
- [ ] Use strong JWT_SECRET in .env
- [ ] Enable HTTPS (Let's Encrypt on Plesk)
- [ ] Configure database IP whitelist (if available)
- [ ] Enable database encryption at rest
- [ ] Regular backup testing
- [ ] Monitor database for suspicious activity
- [ ] Rotate database credentials periodically

---

## Recommended Flow

```
1. Create cloud database ✓
2. Update .env locally ✓
3. Run migrations locally ✓
4. Run seed locally ✓
5. Test with npm start ✓
6. Test with npm run build ✓
7. Build frontend ✓
8. Upload both to Plesk ✓
9. Test https://app.mw265.com ✓
10. Change default password ✓
11. Create real user accounts ✓
```

This ensures everything works before going to production!

---

## Useful Commands

```bash
# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# View data
npx prisma studio

# Reset database (⚠️ deletes data)
npx prisma migrate reset

# Check migrations status
npx prisma migrate status

# Create new migration after schema changes
npx prisma migrate dev --name "description"
```

---

## Next Steps

1. **Choose database**: Prisma Postgres recommended
2. **Create database** in cloud provider
3. **Update .env** with connection string
4. **Run migrations**: `npx prisma migrate deploy`
5. **Seed data**: `npx prisma db seed`
6. **Test locally**: `npm run start`
7. **Deploy to Plesk** using same database URL

---

*Cloud Database Setup Guide*  
*Version: 1.0*  
*Last Updated: January 2026*
