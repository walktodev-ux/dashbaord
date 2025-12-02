-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `givenName` VARCHAR(191) NULL,
    `familyName` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `birthDate` DATETIME(3) NULL,
    `city` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `method` VARCHAR(191) NULL,
    `about` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NULL DEFAULT 'UAH',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkHours` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `startMin` INTEGER NOT NULL DEFAULT 540,
    `endMin` INTEGER NOT NULL DEFAULT 1080,
    `mon` BOOLEAN NOT NULL DEFAULT true,
    `tue` BOOLEAN NOT NULL DEFAULT true,
    `wed` BOOLEAN NOT NULL DEFAULT true,
    `thu` BOOLEAN NOT NULL DEFAULT true,
    `fri` BOOLEAN NOT NULL DEFAULT true,
    `sat` BOOLEAN NOT NULL DEFAULT false,
    `sun` BOOLEAN NOT NULL DEFAULT false,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Europe/Kyiv',

    UNIQUE INDEX `WorkHours_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PricingTier` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `minutes` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'DONE') NOT NULL DEFAULT 'ACTIVE',
    `tags` JSON NULL,
    `lastSessionAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NULL,
    `pricingTierId` VARCHAR(191) NULL,
    `googleEventId` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELED', 'NOSHOW') NOT NULL DEFAULT 'SCHEDULED',
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WaitlistItem` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(32) NULL,
    `note` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'CONTACTED', 'CONVERTED', 'DROPPED') NOT NULL DEFAULT 'PENDING',
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GoogleCalendarIntegration` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `calendarId` VARCHAR(191) NOT NULL,
    `syncToken` VARCHAR(191) NULL,
    `resourceId` VARCHAR(191) NULL,
    `channelId` VARCHAR(191) NULL,
    `channelExpiration` DATETIME(3) NULL,

    UNIQUE INDEX `GoogleCalendarIntegration_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` LONGTEXT NULL,
    `session_state` VARCHAR(191) NULL,
    `oauth_token_secret` VARCHAR(191) NULL,
    `oauth_token` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkHours` ADD CONSTRAINT `WorkHours_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PricingTier` ADD CONSTRAINT `PricingTier_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_pricingTierId_fkey` FOREIGN KEY (`pricingTierId`) REFERENCES `PricingTier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WaitlistItem` ADD CONSTRAINT `WaitlistItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoogleCalendarIntegration` ADD CONSTRAINT `GoogleCalendarIntegration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
