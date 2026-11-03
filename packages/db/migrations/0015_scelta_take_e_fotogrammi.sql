CREATE TABLE `take_frames` (
	`id` text PRIMARY KEY NOT NULL,
	`shot_id` text NOT NULL,
	`take_id` text NOT NULL,
	`at_s` real NOT NULL,
	`asset_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `take_frames_per_inquadratura` ON `take_frames` (`shot_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `shots` ADD `chosen_take_id` text;