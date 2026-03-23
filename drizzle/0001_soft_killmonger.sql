CREATE TABLE `apiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`key` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`rateLimit` int NOT NULL DEFAULT 100,
	`requestCount` int NOT NULL DEFAULT 0,
	`lastResetAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiKeys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `apiUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiKeyId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`statusCode` int NOT NULL,
	`responseTime` int,
	`imageProcessed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imageHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalImageUrl` text NOT NULL,
	`originalImageKey` varchar(255) NOT NULL,
	`processedImageUrl` text,
	`processedImageKey` varchar(255),
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`fileSize` int,
	`format` varchar(10),
	`processingTime` int,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imageHistory_id` PRIMARY KEY(`id`)
);
