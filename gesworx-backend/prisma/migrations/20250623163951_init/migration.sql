-- AlterTable
ALTER TABLE `MaterialInstance` ADD COLUMN `taskId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TaskLoad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `vanId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskLoadMaterial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskLoadId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaterialInstance` ADD CONSTRAINT `MaterialInstance_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskLoad` ADD CONSTRAINT `TaskLoad_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskLoad` ADD CONSTRAINT `TaskLoad_vanId_fkey` FOREIGN KEY (`vanId`) REFERENCES `Van`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskLoad` ADD CONSTRAINT `TaskLoad_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskLoadMaterial` ADD CONSTRAINT `TaskLoadMaterial_taskLoadId_fkey` FOREIGN KEY (`taskLoadId`) REFERENCES `TaskLoad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskLoadMaterial` ADD CONSTRAINT `TaskLoadMaterial_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
