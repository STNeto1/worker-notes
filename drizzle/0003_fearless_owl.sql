CREATE TABLE `user_notes` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(15) NOT NULL,
	`title` varchar(255) NOT NULL,
	`note` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_notes_id` PRIMARY KEY(`id`)
);
