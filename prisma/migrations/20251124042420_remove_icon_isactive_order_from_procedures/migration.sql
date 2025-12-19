/*
  Warnings:

  - You are about to drop the column `order` on the `procedure_files` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `procedures` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `procedures` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `procedures_isActive_idx` ON `procedures`;

-- AlterTable
ALTER TABLE `procedure_files` DROP COLUMN `order`;

-- AlterTable
ALTER TABLE `procedures` DROP COLUMN `icon`,
    DROP COLUMN `isActive`;
