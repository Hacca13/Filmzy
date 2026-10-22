CREATE TABLE `instruction_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`instructions_id` text NOT NULL,
	`version` integer NOT NULL,
	`family` text DEFAULT '' NOT NULL,
	`origin` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instruction_versions_una_sola` ON `instruction_versions` (`instructions_id`,`version`,`family`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `troupe_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`config` text NOT NULL,
	`from_release_id` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `troupe_releases` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`config` text NOT NULL,
	`hash` text NOT NULL,
	`note` text,
	`author` text,
	`created_at` integer NOT NULL,
	`activated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `troupe_releases_id_unique` ON `troupe_releases` (`id`);--> statement-breakpoint
CREATE INDEX `troupe_releases_attivazione` ON `troupe_releases` (`activated_at`);