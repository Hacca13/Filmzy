CREATE TABLE `screenplays` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`stage` text NOT NULL,
	`version` integer NOT NULL,
	`content` text NOT NULL,
	`request` text,
	`generation_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `screenplays_per_versione` ON `screenplays` (`project_id`,`stage`,`version`);