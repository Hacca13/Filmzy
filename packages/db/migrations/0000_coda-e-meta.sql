CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`payload` text NOT NULL,
	`project_id` text,
	`idempotency_key` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`run_after` integer NOT NULL,
	`error_code` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`started_at` integer,
	`finished_at` integer
);
--> statement-breakpoint
CREATE INDEX `jobs_da_fare` ON `jobs` (`status`,`run_after`,`priority`);--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_idempotenza` ON `jobs` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `jobs_per_film` ON `jobs` (`project_id`);--> statement-breakpoint
CREATE TABLE `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
