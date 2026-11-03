CREATE TABLE `moodboard_references` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`scene_id` text,
	`asset_id` text NOT NULL,
	`origin` text NOT NULL,
	`analysis_only` integer NOT NULL,
	`description` text NOT NULL,
	`mood_tags` text NOT NULL,
	`palette` text NOT NULL,
	`generation_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `moodboard_references_per_film` ON `moodboard_references` (`project_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `moodboard_scenes` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`scene_id` text NOT NULL,
	`palette` text NOT NULL,
	`notes` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `moodboard_scenes_per_scena` ON `moodboard_scenes` (`project_id`,`scene_id`);--> statement-breakpoint
CREATE TABLE `moodboards` (
	`project_id` text PRIMARY KEY NOT NULL,
	`palette` text NOT NULL,
	`notes` text NOT NULL,
	`updated_at` integer NOT NULL
);
