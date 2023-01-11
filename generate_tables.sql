DROP DATABASE IF EXISTS `interbar`;

CREATE DATABASE `interbar`;

USE `interbar`;

CREATE TABLE `Users` (
  `id` varchar(255) PRIMARY KEY,
  `emailaddress` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `Events` (
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

CREATE TABLE `Products` (
  `id` varchar(255) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `category` int COMMENT '0 = food, 1 = alcoholic drink, 2 = soft' NOT NULL,
  `description` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `Commands` (
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

CREATE TABLE `EventsProducts` (
  `id` varchar(255) PRIMARY KEY,
  `event_id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `stock` int NOT NULL,
  `buyingprice` float NOT NULL,
  `sellingprice` float NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `UsersEvents` (
  `id` varchar(255) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `role` int COMMENT '0 = user, 1 = seller, 2 = organizer' NOT NULL,
  `left_event_at` datetime DEFAULT null
);

CREATE TABLE `EventsProductsCommands` (
  `id` varchar(255) PRIMARY KEY,
  `command_id` varchar(255) NOT NULL,
  `event_product_id` varchar(255) NOT NULL,
  `number` int NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `RefreshTokens` (
  `token` varchar(500) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL
);

ALTER TABLE `Commands` ADD FOREIGN KEY (`client_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Commands` ADD FOREIGN KEY (`servedby_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Commands` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProducts` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProducts` ADD FOREIGN KEY (`product_id`) REFERENCES `Products` (`id`);

ALTER TABLE `UsersEvents` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `UsersEvents` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProductsCommands` ADD FOREIGN KEY (`command_id`) REFERENCES `Commands` (`id`);

ALTER TABLE `EventsProductsCommands` ADD FOREIGN KEY (`event_product_id`) REFERENCES `EventsProducts` (`id`);

ALTER TABLE `RefreshTokens` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

DROP DATABASE IF EXISTS `interbar-testing`;

CREATE DATABASE `interbar-testing`;

USE `interbar-testing`;

CREATE TABLE `Users` (
  `id` varchar(255) PRIMARY KEY,
  `emailaddress` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `Events` (
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

CREATE TABLE `Products` (
  `id` varchar(255) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `category` int COMMENT '0 = food, 1 = alcoholic drink, 2 = soft' NOT NULL,
  `description` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `Commands` (
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

CREATE TABLE `EventsProducts` (
  `id` varchar(255) PRIMARY KEY,
  `event_id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `stock` int NOT NULL,
  `buyingprice` float NOT NULL,
  `sellingprice` float NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `UsersEvents` (
  `id` varchar(255) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `role` int COMMENT '0 = user, 1 = seller, 2 = organizer' NOT NULL,
  `left_event_at` datetime DEFAULT null
);

CREATE TABLE `EventsProductsCommands` (
  `id` varchar(255) PRIMARY KEY,
  `command_id` varchar(255) NOT NULL,
  `event_product_id` varchar(255) NOT NULL,
  `number` int NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `RefreshTokens` (
  `token` varchar(500) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL
);

ALTER TABLE `Commands` ADD FOREIGN KEY (`client_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Commands` ADD FOREIGN KEY (`servedby_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Commands` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProducts` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProducts` ADD FOREIGN KEY (`product_id`) REFERENCES `Products` (`id`);

ALTER TABLE `UsersEvents` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `UsersEvents` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProductsCommands` ADD FOREIGN KEY (`command_id`) REFERENCES `Commands` (`id`);

ALTER TABLE `EventsProductsCommands` ADD FOREIGN KEY (`event_product_id`) REFERENCES `EventsProducts` (`id`);

ALTER TABLE `RefreshTokens` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

DROP DATABASE IF EXISTS `interbar-dev`;

CREATE DATABASE `interbar-dev`;

USE `interbar-dev`;

CREATE TABLE `Users` (
  `id` varchar(255) PRIMARY KEY,
  `emailaddress` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `Events` (
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

CREATE TABLE `Products` (
  `id` varchar(255) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `category` int COMMENT '0 = food, 1 = alcoholic drink, 2 = soft' NOT NULL,
  `description` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `Commands` (
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

CREATE TABLE `EventsProducts` (
  `id` varchar(255) PRIMARY KEY,
  `event_id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `stock` int NOT NULL,
  `buyingprice` float NOT NULL,
  `sellingprice` float NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `UsersEvents` (
  `id` varchar(255) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `role` int COMMENT '0 = user, 1 = seller, 2 = organizer' NOT NULL,
  `left_event_at` datetime DEFAULT null
);

CREATE TABLE `EventsProductsCommands` (
  `id` varchar(255) PRIMARY KEY,
  `command_id` varchar(255) NOT NULL,
  `event_product_id` varchar(255) NOT NULL,
  `number` int NOT NULL,
  `deleted_at` datetime DEFAULT null
);

CREATE TABLE `RefreshTokens` (
  `token` varchar(500) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL
);

ALTER TABLE `Commands` ADD FOREIGN KEY (`client_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Commands` ADD FOREIGN KEY (`servedby_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Commands` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProducts` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProducts` ADD FOREIGN KEY (`product_id`) REFERENCES `Products` (`id`);

ALTER TABLE `UsersEvents` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `UsersEvents` ADD FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`);

ALTER TABLE `EventsProductsCommands` ADD FOREIGN KEY (`command_id`) REFERENCES `Commands` (`id`);

ALTER TABLE `EventsProductsCommands` ADD FOREIGN KEY (`event_product_id`) REFERENCES `EventsProducts` (`id`);

ALTER TABLE `RefreshTokens` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);
