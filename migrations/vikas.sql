ALTER TABLE `meeting_participants` ADD `user_name` VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL AFTER `userId`, ADD `user_email` VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL AFTER `user_name`;
ALTER TABLE `meeting_participants` CHANGE `userId` `userId` INT NULL;
ALTER TABLE `users` CHANGE `firstName` `firstName` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL;
ALTER TABLE `users` CHANGE `lastName` `lastName` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL;

ALTER TABLE `meeting_task_users` ADD `participant_id` INT NULL AFTER `userId`;
ALTER TABLE `meeting_task_users` CHANGE `userId` `userId` INT NULL;