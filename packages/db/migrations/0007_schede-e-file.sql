CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`content_type` text NOT NULL,
	`bytes` integer NOT NULL,
	`project_id` text,
	`generation_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `character_sheet_images` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`attempt` integer NOT NULL,
	`angle` text NOT NULL,
	`status` text NOT NULL,
	`asset_id` text,
	`receipt_id` text,
	`error_code` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sheet_images_per_angolo` ON `character_sheet_images` (`character_id`,`attempt`,`angle`);--> statement-breakpoint
ALTER TABLE `characters` ADD `locked_attempt` integer;