CREATE TABLE `shot_plans` (
	`project_id` text NOT NULL,
	`scene_number` integer NOT NULL,
	`scene_hash` text NOT NULL,
	`screenplay_id` text NOT NULL,
	`generation_id` text,
	`notes` text,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `scene_number`)
);
--> statement-breakpoint
CREATE TABLE `shots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`scene_number` integer NOT NULL,
	`position` integer NOT NULL,
	`spec` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shots_per_scena` ON `shots` (`project_id`,`scene_number`,`position`);