ALTER TABLE `generations` ADD `connection_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `generations` ADD `project_id` text;--> statement-breakpoint
CREATE INDEX `generations_per_fornitore` ON `generations` (`connection_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `generations_per_film` ON `generations` (`project_id`);
--> statement-breakpoint
-- Gli scontrini scritti prima di questa migrazione hanno fornitore e film solo dentro il JSON.
UPDATE `generations` SET `connection_id` = COALESCE(json_extract(`receipt`, '$.connectionId'), ''), `project_id` = json_extract(`receipt`, '$.projectId');
