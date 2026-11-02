CREATE TABLE `storyboard_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`shot_id` text NOT NULL,
	`attempt` integer NOT NULL,
	`status` text NOT NULL,
	`asset_ids` text NOT NULL,
	`receipt_id` text,
	`error_code` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `storyboard_attempts_per_tentativo` ON `storyboard_attempts` (`shot_id`,`attempt`);--> statement-breakpoint
ALTER TABLE `shots` ADD `chosen_asset_id` text;