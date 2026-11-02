CREATE TABLE `location_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`location_id` text NOT NULL,
	`attempt` integer NOT NULL,
	`status` text NOT NULL,
	`asset_ids` text NOT NULL,
	`receipt_id` text,
	`error_code` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `location_attempts_per_tentativo` ON `location_attempts` (`location_id`,`attempt`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`prompt` text NOT NULL,
	`proposal_id` text,
	`chosen_asset_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `locations_per_film` ON `locations` (`project_id`,`created_at`);