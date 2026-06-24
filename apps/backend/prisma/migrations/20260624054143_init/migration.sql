-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `sourceUrl` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Document_externalId_key`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentChunk` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `chunkIndex` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `pointId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DocumentChunk_pointId_key`(`pointId`),
    INDEX `DocumentChunk_documentId_idx`(`documentId`),
    UNIQUE INDEX `DocumentChunk_documentId_chunkIndex_key`(`documentId`, `chunkIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatSession` (
    `id` VARCHAR(191) NOT NULL,
    `userKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `content` TEXT NOT NULL,
    `latencyMs` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChatMessage_sessionId_createdAt_idx`(`sessionId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DocumentChunk` ADD CONSTRAINT `DocumentChunk_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ChatSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
