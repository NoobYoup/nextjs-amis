/*
  Warnings:

  - You are about to drop the column `fileType` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `documents` DROP COLUMN `fileType`,
    DROP COLUMN `fileUrl`;

-- CreateTable
CREATE TABLE `document_files` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `fileUrl` TEXT NOT NULL,
    `fileType` VARCHAR(191) NOT NULL DEFAULT 'pdf',
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `document_files_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `document_files` ADD CONSTRAINT `document_files_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
