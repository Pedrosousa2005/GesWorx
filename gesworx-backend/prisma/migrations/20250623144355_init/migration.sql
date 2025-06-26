/*
  Warnings:

  - You are about to drop the column `scheduletAt` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Task` DROP COLUMN `scheduletAt`,
    ADD COLUMN `scheduledAt` DATETIME(3) NULL;
