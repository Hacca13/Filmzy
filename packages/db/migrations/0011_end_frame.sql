DROP INDEX `storyboard_attempts_per_tentativo`;--> statement-breakpoint
ALTER TABLE `storyboard_attempts` ADD `mode` text DEFAULT 'storyboard' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `storyboard_attempts_per_tentativo` ON `storyboard_attempts` (`shot_id`,`mode`,`attempt`);