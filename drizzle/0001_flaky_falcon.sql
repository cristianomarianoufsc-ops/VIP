CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `galleries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`accessToken` varchar(64) NOT NULL,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `galleries_id` PRIMARY KEY(`id`),
	CONSTRAINT `galleries_accessToken_unique` UNIQUE(`accessToken`)
);
--> statement-breakpoint
CREATE TABLE `gallerySettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galleryId` int NOT NULL,
	`watermarkEnabled` boolean NOT NULL DEFAULT true,
	`watermarkText` varchar(255) NOT NULL DEFAULT '© Protected',
	`watermarkOpacity` decimal(3,2) NOT NULL DEFAULT '0.3',
	`watermarkPosition` enum('top-left','top-center','top-right','center','bottom-left','bottom-center','bottom-right') NOT NULL DEFAULT 'bottom-right',
	`printScreenDetectionEnabled` boolean NOT NULL DEFAULT true,
	`rightClickDisabled` boolean NOT NULL DEFAULT true,
	`downloadDisabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallerySettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `gallerySettings_galleryId_unique` UNIQUE(`galleryId`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galleryId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`thumbnailUrl` text,
	`width` int,
	`height` int,
	`fileSize` int,
	`mimeType` varchar(50),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
