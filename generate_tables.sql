DROP DATABASE IF EXISTS `interbar`;

CREATE DATABASE `interbar`;

USE `interbar`;

CREATE TABLE `users` (
  `id` varchar(255) PRIMARY KEY,
  `emailaddress` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rights` int NOT NULL COMMENT '0 = user, 1 = admin' DEFAULT 0,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `events` (
  `id` varchar(255) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `startdate` datetime NOT NULL,
  `enddate` datetime NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text,
  `seller_password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `products` (
  `id` varchar(255) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `category` int COMMENT '0 = food, 1 = alcoholic drink, 2 = soft' NOT NULL,
  `description` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `commands` (
  `id` varchar(255) PRIMARY KEY COMMENT 'UUID v4',
  `client_id` varchar(255),
  `client_name` varchar(255),
  `servedby_id` varchar(255),
  `event_id` varchar(255) NOT NULL,
  `isserved` boolean NOT NULL,
  `ispaid` boolean NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `events_products` (
  `id` varchar(255) PRIMARY KEY,
  `event_id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `stock` int NOT NULL,
  `buyingprice` float NOT NULL,
  `sellingprice` float NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `users_events` (
  `id` varchar(255) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `role` int COMMENT '0 = user, 1 = seller, 2 = organizer' NOT NULL,
  `left_event_at` datetime DEFAULT null
);

CREATE TABLE `events_products_commands` (
  `id` varchar(255) PRIMARY KEY,
  `command_id` varchar(255) NOT NULL,
  `event_product_id` varchar(255) NOT NULL,
  `number` int NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `refresh_tokens` (
  `token` varchar(500) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL
);

ALTER TABLE `commands` ADD FOREIGN KEY (`client_id`) REFERENCES `users` (`id`);

ALTER TABLE `commands` ADD FOREIGN KEY (`servedby_id`) REFERENCES `users` (`id`);

ALTER TABLE `commands` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

ALTER TABLE `events_products` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

ALTER TABLE `events_products` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `users_events` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `users_events` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

ALTER TABLE `events_products_commands` ADD FOREIGN KEY (`command_id`) REFERENCES `commands` (`id`);

ALTER TABLE `events_products_commands` ADD FOREIGN KEY (`event_product_id`) REFERENCES `events_products` (`id`);

ALTER TABLE `refresh_tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);