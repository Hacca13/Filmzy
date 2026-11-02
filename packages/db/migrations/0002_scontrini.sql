CREATE TABLE `generations` (
	`id` text PRIMARY KEY NOT NULL,
	`purpose` text NOT NULL,
	`role` text NOT NULL,
	`model_id` text NOT NULL,
	`status` text NOT NULL,
	`estimated_cost_usd` real NOT NULL,
	`actual_cost_usd` real,
	`created_at` integer NOT NULL,
	`receipt` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `generations_per_scopo` ON `generations` (`purpose`,`created_at`);