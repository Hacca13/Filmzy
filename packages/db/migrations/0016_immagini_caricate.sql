CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`kind` text NOT NULL,
	`location_id` text,
	`name` text NOT NULL,
	`checked` integer NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `uploads_per_film` ON `uploads` (`project_id`,`created_at`);