/*
  Warnings:

  - You are about to drop the column `owner` on the `actionplan` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `audit` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `audit` table. All the data in the column will be lost.
  - Added the required column `auditName` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auditType` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `actionplan` DROP FOREIGN KEY `ActionPlan_findingId_fkey`;

-- DropForeignKey
ALTER TABLE `finding` DROP FOREIGN KEY `Finding_auditId_fkey`;

-- DropIndex
DROP INDEX `ActionPlan_findingId_fkey` ON `actionplan`;

-- DropIndex
DROP INDEX `Finding_auditId_fkey` ON `finding`;

-- AlterTable
ALTER TABLE `actionplan` DROP COLUMN `owner`,
    ADD COLUMN `ownerId` INTEGER NULL,
    MODIFY `dueDate` DATETIME(3) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE `audit` DROP COLUMN `name`,
    DROP COLUMN `type`,
    ADD COLUMN `assignedManagerId` INTEGER NULL,
    ADD COLUMN `auditName` VARCHAR(191) NOT NULL,
    ADD COLUMN `auditType` VARCHAR(191) NOT NULL,
    ADD COLUMN `auditUniverseId` INTEGER NULL,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'planned';

-- AlterTable
ALTER TABLE `finding` ADD COLUMN `auditProgramId` INTEGER NULL,
    ADD COLUMN `rootCause` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'identified';

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `mfaEnabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_roleName_key`(`roleName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `UserRole_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditUniverse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entityType` VARCHAR(191) NOT NULL,
    `entityName` VARCHAR(191) NOT NULL,
    `riskRating` VARCHAR(191) NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditProgram` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auditId` INTEGER NOT NULL,
    `procedureName` VARCHAR(191) NOT NULL,
    `controlReference` VARCHAR(191) NULL,
    `expectedOutcome` VARCHAR(191) NULL,
    `actualResult` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evidence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auditProgramId` INTEGER NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileHash` VARCHAR(191) NOT NULL,
    `uploadedById` INTEGER NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` INTEGER NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddress` VARCHAR(191) NULL,
    `deviceInfo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComplianceFramework` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `frameworkName` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ControlMapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auditProgramId` INTEGER NOT NULL,
    `frameworkId` INTEGER NOT NULL,
    `coverageStatus` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ControlMapping_auditProgramId_frameworkId_key`(`auditProgramId`, `frameworkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Integration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemName` VARCHAR(191) NOT NULL,
    `apiEndpoint` VARCHAR(191) NOT NULL,
    `authenticationMethod` VARCHAR(191) NULL,
    `lastSyncDate` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Integration_systemName_key`(`systemName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditUniverse` ADD CONSTRAINT `AuditUniverse_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_assignedManagerId_fkey` FOREIGN KEY (`assignedManagerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_auditUniverseId_fkey` FOREIGN KEY (`auditUniverseId`) REFERENCES `AuditUniverse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditProgram` ADD CONSTRAINT `AuditProgram_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `Audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidence` ADD CONSTRAINT `Evidence_auditProgramId_fkey` FOREIGN KEY (`auditProgramId`) REFERENCES `AuditProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidence` ADD CONSTRAINT `Evidence_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Finding` ADD CONSTRAINT `Finding_auditProgramId_fkey` FOREIGN KEY (`auditProgramId`) REFERENCES `AuditProgram`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Finding` ADD CONSTRAINT `Finding_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `Audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActionPlan` ADD CONSTRAINT `ActionPlan_findingId_fkey` FOREIGN KEY (`findingId`) REFERENCES `Finding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActionPlan` ADD CONSTRAINT `ActionPlan_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlMapping` ADD CONSTRAINT `ControlMapping_auditProgramId_fkey` FOREIGN KEY (`auditProgramId`) REFERENCES `AuditProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlMapping` ADD CONSTRAINT `ControlMapping_frameworkId_fkey` FOREIGN KEY (`frameworkId`) REFERENCES `ComplianceFramework`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
