<?php
require_once 'config/Database.php';

$database = new Database();
$conn = $database->getConnection();

try {
    // Create procedure_categories
    $conn->exec("CREATE TABLE IF NOT EXISTS `procedure_categories` (
        `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
        `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Create reform_categories
    $conn->exec("CREATE TABLE IF NOT EXISTS `reform_categories` (
        `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
        `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    // Check if category column exists in procedures table
    $stmt = $conn->query("SHOW COLUMNS FROM `procedures` LIKE 'category'");
    if ($stmt->rowCount() == 0) {
        $conn->exec("ALTER TABLE `procedures` ADD COLUMN `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `title`");
        echo "Added category column to procedures.\n";
    }

    // Check if category column exists in reforms table
    $stmt = $conn->query("SHOW COLUMNS FROM `reforms` LIKE 'category'");
    if ($stmt->rowCount() == 0) {
        $conn->exec("ALTER TABLE `reforms` ADD COLUMN `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `title`");
        echo "Added category column to reforms.\n";
    }

    echo "Tables created successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
