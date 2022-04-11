USE unichat;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `users` (
	`user_id` int(11) NOT NULL AUTO_INCREMENT,
    `user_name` varchar(256) NOT NULL,
	`user_tag` int(4) NOT NULL,
    `user_email` varchar(256) NOT NULL,
    `user_password` varchar(256) NOT NULL,
    `user_active` int(1) DEFAULT 0,
    `login_attempts` int(1) DEFAULT 0,
    PRIMARY KEY(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `groups` (
	`group_id` int(11) NOT NULL AUTO_INCREMENT,
    `group_name` varchar(256) NOT NULL,
    `group_description` varchar(256) NULL,
    `date_created` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY(`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `group_members` (
	`member_id` int(11) NOT NULL,
	`group_id` int(11) NOT NULL,
    `date_joined` datetime NOT NULL DEFAULT current_timestamp(),
	`member_role` int(2) DEFAULT 1,
    `favorite_group` int(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `friends` (
	`user_id` int(11) NOT NULL,
    `friend_id` int(11) NOT NULL,
    `date_friended` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;