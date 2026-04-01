-- Database Cleanup Script for AUDITSOFT
-- This script clears all data except Users, Roles, and UserRoles
-- Run this in your MySQL database

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear tables in dependency order (child tables first)

-- 1. Clear notification and messaging tables
DELETE FROM Notification;
DELETE FROM Message;

-- 2. Clear audit-related tables (bottom-up)
DELETE FROM EvidenceVersion;
DELETE FROM Evidence;
DELETE FROM ControlMapping;
DELETE FROM Workpaper;
DELETE FROM ActionPlan;
DELETE FROM Finding;
DELETE FROM AuditProgram;
DELETE FROM Report;
DELETE FROM ReportFile;
DELETE FROM CustomReport;
DELETE FROM Timesheet;
DELETE FROM RiskAssessment;
DELETE FROM Audit;

-- 3. Clear risk and KRI tables
DELETE FROM KRI;
DELETE FROM Risk;

-- 4. Clear audit universe
DELETE FROM AuditUniverse;

-- 5. Clear compliance and policy tables
DELETE FROM PolicyMapping;
DELETE FROM Policy;
DELETE FROM ComplianceFramework;

-- 6. Clear automation tables
DELETE FROM ControlRun;
DELETE FROM AutomatedControl;

-- 7. Clear integration tables
DELETE FROM Integration;

-- 8. Clear audit logs
DELETE FROM AuditLog;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment values for cleared tables
ALTER TABLE Notification AUTO_INCREMENT = 1;
ALTER TABLE Message AUTO_INCREMENT = 1;
ALTER TABLE EvidenceVersion AUTO_INCREMENT = 1;
ALTER TABLE Evidence AUTO_INCREMENT = 1;
ALTER TABLE ControlMapping AUTO_INCREMENT = 1;
ALTER TABLE Workpaper AUTO_INCREMENT = 1;
ALTER TABLE ActionPlan AUTO_INCREMENT = 1;
ALTER TABLE Finding AUTO_INCREMENT = 1;
ALTER TABLE AuditProgram AUTO_INCREMENT = 1;
ALTER TABLE Report AUTO_INCREMENT = 1;
ALTER TABLE ReportFile AUTO_INCREMENT = 1;
ALTER TABLE CustomReport AUTO_INCREMENT = 1;
ALTER TABLE Timesheet AUTO_INCREMENT = 1;
ALTER TABLE RiskAssessment AUTO_INCREMENT = 1;
ALTER TABLE Audit AUTO_INCREMENT = 1;
ALTER TABLE KRI AUTO_INCREMENT = 1;
ALTER TABLE Risk AUTO_INCREMENT = 1;
ALTER TABLE AuditUniverse AUTO_INCREMENT = 1;
ALTER TABLE PolicyMapping AUTO_INCREMENT = 1;
ALTER TABLE Policy AUTO_INCREMENT = 1;
ALTER TABLE ComplianceFramework AUTO_INCREMENT = 1;
ALTER TABLE ControlRun AUTO_INCREMENT = 1;
ALTER TABLE AutomatedControl AUTO_INCREMENT = 1;
ALTER TABLE Integration AUTO_INCREMENT = 1;
ALTER TABLE AuditLog AUTO_INCREMENT = 1;

-- Show summary of preserved data
SELECT 'Users preserved:' as info, COUNT(*) as count FROM User
UNION ALL
SELECT 'Roles preserved:' as info, COUNT(*) as count FROM Role
UNION ALL
SELECT 'UserRoles preserved:' as info, COUNT(*) as count FROM UserRole;

-- Cleanup complete
SELECT 'Database cleanup completed successfully!' as status;
