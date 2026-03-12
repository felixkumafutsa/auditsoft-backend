-- Add RiskAssessment table
CREATE TABLE IF NOT EXISTS `RiskAssessment` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `auditId` INT NOT NULL,
    `stage` VARCHAR(191) NOT NULL,
    `riskLevel` VARCHAR(191) NOT NULL,
    `riskFactors` VARCHAR(191) NOT NULL,
    `mitigationActions` VARCHAR(191) NULL,
    `assessedBy` INT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE INDEX `RiskAssessment_auditId_fkey`(`auditId`),
    INDEX `RiskAssessment_assessedBy_fkey`(`assessedBy`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraints
ALTER TABLE `RiskAssessment` ADD CONSTRAINT `RiskAssessment_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `Audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `RiskAssessment` ADD CONSTRAINT `RiskAssessment_assessedBy_fkey` FOREIGN KEY (`assessedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
