CREATE TABLE `audio_clips` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`track_id` text NOT NULL,
	`scene_id` text NOT NULL,
	`shot_id` text,
	`start_s` real NOT NULL,
	`duration_s` real NOT NULL,
	`volume` real NOT NULL,
	`fade_in_s` real NOT NULL,
	`fade_out_s` real NOT NULL,
	`description` text NOT NULL,
	`mood` text,
	`chosen_variant_id` text,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audio_clips_per_film` ON `audio_clips` (`project_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `audio_tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`muted` integer NOT NULL,
	`volume` real NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audio_tracks_per_tipo` ON `audio_tracks` (`project_id`,`kind`);--> statement-breakpoint
CREATE TABLE `audio_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`clip_id` text NOT NULL,
	`status` text NOT NULL,
	`model_id` text,
	`model_label` text,
	`asset_id` text,
	`receipt_id` text,
	`cost_usd` real,
	`error_code` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audio_variants_per_clip` ON `audio_variants` (`clip_id`,`created_at`);