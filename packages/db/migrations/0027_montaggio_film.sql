CREATE TABLE `film_assemblies` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`status` text NOT NULL,
	`fingerprint` text NOT NULL,
	`asset_id` text,
	`duration_s` real,
	`error_code` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `film_assemblies_per_film` ON `film_assemblies` (`project_id`,`created_at`);