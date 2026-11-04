CREATE TABLE `ignored_flags` (
	`project_id` text NOT NULL,
	`flag_key` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `flag_key`)
);
