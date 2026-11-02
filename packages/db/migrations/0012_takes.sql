CREATE TABLE `takes` (
	`id` text PRIMARY KEY NOT NULL,
	`shot_id` text NOT NULL,
	`status` text NOT NULL,
	`model_id` text NOT NULL,
	`model_label` text NOT NULL,
	`asset_id` text,
	`receipt_id` text,
	`cost_usd` real,
	`error_code` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
