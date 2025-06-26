/*
  Warnings:

  - You are about to drop the column `userId` on the `TaskLoad` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `TaskLoad` DROP FOREIGN KEY `TaskLoad_userId_fkey`;

-- DropIndex
DROP INDEX `TaskLoad_userId_fkey` ON `TaskLoad`;

-- AlterTable
ALTER TABLE `TaskLoad` DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `TaskLoadUser` (
    `taskLoadId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`taskLoadId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaskLoadUser` ADD CONSTRAINT `TaskLoadUser_taskLoadId_fkey` FOREIGN KEY (`taskLoadId`) REFERENCES `TaskLoad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskLoadUser` ADD CONSTRAINT `TaskLoadUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
