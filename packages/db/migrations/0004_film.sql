CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`idea` text NOT NULL,
	`genre` text NOT NULL,
	`tone` text NOT NULL,
	`style` text NOT NULL,
	`cinematography` text NOT NULL,
	`language` text NOT NULL,
	`duration_s` integer NOT NULL,
	`phase` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `projects_per_modifica` ON `projects` (`updated_at`);