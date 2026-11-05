CREATE TABLE `film_exports` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`status` text NOT NULL,
	`source_asset_id` text NOT NULL,
	`short_side` integer NOT NULL,
	`file_name` text,
	`error_code` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `film_exports_per_film` ON `film_exports` (`project_id`,`created_at`);