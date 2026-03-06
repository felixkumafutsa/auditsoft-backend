# Database Cleanup Guide

This guide explains how to safely clear the AUDITSOFT database while preserving users and user roles.

## 🚨 Important Warning

**This action will permanently delete all audit data, reports, evidence, findings, and other application data except for:**
- Users (accounts)
- Roles (permissions)
- UserRoles (role assignments)

**Make sure you have backups before proceeding!**

## 📋 What Gets Preserved

✅ **Preserved Tables:**
- `User` - All user accounts and login information
- `Role` - All system roles (Chief Auditor, Manager, Auditor, etc.)
- `UserRole` - Role assignments for users

## 🗑️ What Gets Deleted

❌ **Cleared Tables:**
- All audit data (Audits, AuditPrograms, Findings, ActionPlans)
- All reports and generated documents
- All evidence files and versions
- All risk assessments and KRIs
- All notifications and messages
- All audit logs
- All compliance frameworks and policies
- All integration data
- All timesheet entries

## 🛠️ Execution Methods

### Method 1: Using npm script (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run the cleanup script
npm run db:cleanup
```

### Method 2: Direct TypeScript execution

```bash
cd backend
npx ts-node scripts/cleanup-database.ts
```

### Method 3: Raw SQL (Advanced)

```bash
cd backend
mysql -u username -p database_name < scripts/cleanup-database.sql
```

## 📊 Before and After

The script will show you:
- Number of users being preserved
- Number of roles being preserved  
- Number of user role assignments being preserved
- Progress of each table being cleared
- Final summary of preserved data

## 🔒 Safety Features

- **Foreign Key Handling**: Temporarily disables foreign key checks to avoid constraint errors
- **Orderly Deletion**: Clears tables in dependency order (child tables first)
- **Auto-increment Reset**: Resets auto-increment values for fresh start
- **Error Handling**: Continues even if individual table cleanup fails
- **Verification**: Shows counts before and after cleanup

## 🚀 After Cleanup

Once cleanup is complete:
1. Your application will have a fresh start with all users intact
2. Users can log in with their existing credentials
3. All role permissions are preserved
4. You can start creating new audits, reports, and data

## 📞 Rollback Plan

**There is no automatic rollback!** 
- Always have a database backup before running cleanup
- Test the script in a development environment first
- Document the current state before cleanup

## 🔄 Maintenance Schedule

Consider running this cleanup:
- Before major system updates
- When starting a new audit period/year
- During system migration or testing
- When clearing test/demo data

## 🛠️ Troubleshooting

**Permission Errors**: Ensure database user has DELETE permissions
**Connection Issues**: Check DATABASE_URL in .env file
**Foreign Key Errors**: Script handles these automatically
**Partial Cleanup**: Script continues even if some tables fail

---

**Remember**: This script is designed for development/testing environments. Use with caution in production!
