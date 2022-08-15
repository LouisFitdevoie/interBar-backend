CREATE TABLE `users` (
  `id` varchar(255) PRIMARY KEY,
  `emailaddress` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
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
  `client_id` varchar(255) NOT NULL,
  `servedby_id` varchar(255) NOT NULL,
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

ALTER TABLE `commands` ADD FOREIGN KEY (`client_id`) REFERENCES `users` (`id`);

ALTER TABLE `commands` ADD FOREIGN KEY (`servedby_id`) REFERENCES `users` (`id`);

ALTER TABLE `commands` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

ALTER TABLE `events_products` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

ALTER TABLE `events_products` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `users_events` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `users_events` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

ALTER TABLE `events_products_commands` ADD FOREIGN KEY (`command_id`) REFERENCES `commands` (`id`);

ALTER TABLE `events_products_commands` ADD FOREIGN KEY (`event_product_id`) REFERENCES `events_products` (`id`);

SELECT * FROM commands 
  INNER JOIN events_products_commands ON commands.id = events_products_commands.command_id 
  INNER JOIN events_products ON events_products_commands.event_product_id = events_products.id 
  INNER JOIN events ON events_products.event_id = events.id 
  INNER JOIN users AS client ON client.id = commands.client_id 
  INNER JOIN users AS seller ON seller.id = commands.servedby_id 
  WHERE 
    events_products_commands.command_id = ? 
    AND events_products_commands.event_product_id = ? 
    AND events_products_commands.deleted_at IS null;

SELECT id, client_id, servedby_id, event_id, isserved, ispaid, created_at FROM commands WHERE id = ? AND deleted_at IS null;
SELECT event_product_command.event_product_id, event_product_command.number, event_product.product_id, event_product.sellingprice, products.name, products.category, products.description FROM events_products_commands INNER JOIN events_products ON events_products_commands.events_products_id = events_products.id INNER JOIN products ON events_products.product_id = products.id WHERE commands.id = ? AND events_products_commands.deleted_at IS null;
SELECT  FROM events_products INNER JOIN products ON events_products.product_id = products.id WHERE events_products.event_id = ? AND events_products.deleted_at IS null;
SELECT id, firstname, lastname, birthday, emailaddress FROM users WHERE id = ? AND deleted_at IS null;