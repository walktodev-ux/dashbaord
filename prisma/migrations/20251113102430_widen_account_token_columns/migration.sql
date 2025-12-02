-- AlterTable
ALTER TABLE `account` MODIFY `refresh_token` LONGTEXT NULL,
    MODIFY `access_token` LONGTEXT NULL,
    MODIFY `oauth_token_secret` TEXT NULL,
    MODIFY `oauth_token` TEXT NULL;
