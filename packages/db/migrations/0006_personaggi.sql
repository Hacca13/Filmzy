CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`name` text NOT NULL,
	`tag` text NOT NULL,
	`role` text NOT NULL,
	`description` text NOT NULL,
	`profile` text,
	`appearance` text NOT NULL,
	`voice_id` text,
	`proposal_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `characters_per_film` ON `characters` (`project_id`,`created_at`);