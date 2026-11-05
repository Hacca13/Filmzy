ALTER TABLE `film_exports` ADD `aspect` text;--> statement-breakpoint
ALTER TABLE `film_exports` ADD `container` text DEFAULT 'mp4' NOT NULL;