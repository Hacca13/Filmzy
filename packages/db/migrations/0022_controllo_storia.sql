CREATE TABLE `script_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`generation_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `script_checks_per_film` ON `script_checks` (`project_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `script_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`check_id` text NOT NULL,
	`position` integer NOT NULL,
	`scene_id` text,
	`shot_id` text,
	`code` text NOT NULL,
	`light` integer NOT NULL,
	`reason` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `script_issues_per_controllo` ON `script_issues` (`check_id`,`position`);