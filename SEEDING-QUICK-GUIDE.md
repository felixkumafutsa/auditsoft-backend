# 📚 Seeding Guide - Quick Start

## ⚡ Quick Summary

**Yes, you can absolutely seed the cloud database first!** This is the recommended approach.

---

## 🚀 Fast Track (5 minutes)

### 1. Create Cloud Database

Go to: https://console.prisma.io
- Click "Create Database"
- Copy connection string

### 2. Update Local .env

```env
DATABASE_URL="postgresql://user:pass@aws-xxx.databases.prisma.io:5432/auditsoft_db"
NODE_ENV=development
```

### 3. Run Migrations

```bash
cd backend
npx prisma migrate deploy
```

### 4. Seed Database

```bash
npx prisma db seed
```

Output should show:
```
✓ Roles created (6)
✓ Admin user created
✓ Sample users created
✓ Sample data created
```

### 5. Verify with Prisma Studio

```bash
npx prisma studio
```

Opens web interface to see all seeded data.

### 6. Deploy to Plesk

Use the **same cloud database URL** in Plesk `.env` file.

---

## 📊 What Gets Seeded

### Users Created
| Email | Password | Role |
|-------|----------|------|
| admin@auditsoft.com | password123 | System Admin |
| executive@auditsoft.com | password123 | CAE |
| manager@auditsoft.com | password123 | Audit Manager |
| auditor@auditsoft.com | password123 | Auditor |
| owner@auditsoft.com | password123 | Process Owner |
| viewer@auditsoft.com | password123 | Executive |

### Roles Created
- System Administrator
- Chief Audit Executive (CAE)
- Audit Manager
- Auditor
- Process Owner
- Executive / Board Viewer

### Sample Data
- Sample audits (ready to test)
- Sample findings (ready to test)
- Sample action plans
- Sample evidence records

---

## 🎯 Recommended Workflow

```
1. Create cloud database ← START HERE
2. Get connection string
3. Update .env locally
4. Run: npx prisma migrate deploy
5. Run: npx prisma db seed
6. Test locally: npm run start
7. Build backend: npm run build
8. Upload to Plesk with cloud DATABASE_URL
```

---

## ✅ Verify Each Step

### After Migration
```bash
npx prisma migrate status
```
Should show: "Migrations are up to date"

### After Seeding
```bash
npx prisma studio
```
Open browser → Should see 6 users and sample audits

### Local Test
```bash
npm run start
# Then: curl http://localhost:3000/audits
```
Should return JSON with sample audits

---

## 🔗 Full Guides

- **Full cloud setup**: See `CLOUD-DATABASE-SETUP.md`
- **Plesk deployment**: See `PLESK-NO-SSH-DEPLOYMENT.md`
- **Everything**: See `DOCUMENTATION-INDEX.md`

---

## ⚠️ Important Notes

1. **Same database everywhere**: Use the same cloud URL for local dev AND Plesk production
2. **No migration needed on Plesk**: Migrations run locally, not on server
3. **Data stays in cloud**: Both local dev and Plesk access the same seeded data
4. **No file uploads**: Cloud database is in the cloud, not on Plesk server

---

## 💡 Benefits of Cloud Database

✅ No need to migrate data between environments  
✅ Automatic backups  
✅ Same data everywhere (dev = production)  
✅ Easy to share with team  
✅ Scales automatically  
✅ No server management needed  

---

Ready to seed? Follow the 5-minute quick start above! 🚀
