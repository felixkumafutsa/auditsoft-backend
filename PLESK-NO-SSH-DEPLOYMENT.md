# 🚀 AuditSoft Backend Deployment for Plesk (Without SSH)

## Quick Guide

This is the **backend-specific** guide for `api.mw265.com` deployment without SSH access.

**For full deployment guide, see**: `PLESK-NO-SSH-DEPLOYMENT.md` in the frontend repository.

---

## Backend Setup Summary

### Files Needed
- `dist/` folder (from `npm run build`)
- `prisma/` folder (migrations + schema)
- `package.json`
- `package-lock.json`
- `.env` file (you create)

### Steps
1. Build backend locally
2. Create MySQL database in Plesk
3. Upload files via File Manager or FTP
4. Create `.env` file
5. Run migrations
6. Start Node.js process
7. Test API

---

## Step-by-Step

### 1. Local Build

```bash
npm install
npm run build
```

Creates `dist/` folder with compiled code.

### 2. Database Setup (Plesk Console)

1. **Plesk Dashboard** → Subscriptions → Your Domain
2. **Databases** → Add Database
   - Name: `auditsoft_db`
3. **Add User**
   - User: `auditsoft_user`
   - Password: Strong password (save it!)
   - Grant all privileges

### 3. Upload Files

Via Plesk File Manager or FTP to `httpdocs/api/`:
- Extract the entire backend folder
- Ensure you have: `dist/`, `prisma/`, `package.json`

### 4. Create .env File

In `httpdocs/api/`, create `.env`:

```env
DATABASE_URL="mysql://auditsoft_user:PASSWORD@localhost:3306/auditsoft_db"
NODE_ENV=production
PORT=3000
API_URL=https://api.mw265.com
FRONTEND_URL=https://app.mw265.com
JWT_SECRET=change-me-to-random-string
```

Replace `PASSWORD` with your database password.

### 5. Run Migrations

Via **Plesk → phpMyAdmin**:

1. Open phpMyAdmin
2. Select database: `auditsoft_db`
3. Go to **SQL** tab
4. Import files from `prisma/migrations/`:
   - `20260119224841_init/migration.sql`
   - `20260119234452_add/migration.sql`

### 6. Start Backend

**Option A**: Via Plesk Node.js Extension
- Plesk → Extensions → Node.js
- Configure application for `api.mw265.com`
- Start file: `dist/main.js`

**Option B**: If you get SSH access later
```bash
npm install pm2 -g
pm2 start dist/main.js --name "auditsoft-backend"
pm2 startup && pm2 save
```

### 7. Test

Visit: `https://api.mw265.com/audits`

Should return JSON (success) or error message (still working).

---

## Key Points

- Database must be created in Plesk FIRST
- `.env` file must have correct DATABASE_URL
- `node_modules` can be installed via `npm install` if Node.js available
- Migrations can be run via phpMyAdmin SQL tab
- Backend needs to run on port 3000 (Plesk will proxy to it)

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to database" | Check DATABASE_URL in .env, verify DB exists |
| "Module not found" | Run `npm install` in `httpdocs/api/` |
| "POST /audits returns 500" | Check logs, verify database has tables |
| "CORS error from frontend" | Check FRONTEND_URL in .env matches domain |

---

## For More Details

See: `PLESK-NO-SSH-DEPLOYMENT.md` (Frontend repo)

This has comprehensive troubleshooting, security tips, and post-deployment steps.
