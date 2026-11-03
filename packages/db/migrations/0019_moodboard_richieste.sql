CREATE TABLE `moodboard_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`scene_id` text,
	`status` text NOT NULL,
	`images` integer NOT NULL,
	`error_code` text,
	`model_label` text,
	`cost_usd` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `moodboard_runs_per_film` ON `moodboard_runs` (`project_id`,`created_at`);