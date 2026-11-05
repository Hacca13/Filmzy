CREATE TABLE `film_scene_exclusions` (
	`project_id` text NOT NULL,
	`scene_number` integer NOT NULL,
	PRIMARY KEY(`project_id`, `scene_number`)
);
