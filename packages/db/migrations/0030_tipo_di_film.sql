ALTER TABLE `projects` ADD `kind` text DEFAULT 'short' NOT NULL;--> statement-breakpoint
UPDATE `projects` SET `kind` = 'spot' WHERE `duration_s` < 60;
