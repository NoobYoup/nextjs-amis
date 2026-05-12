<?php
require_once __DIR__ . '/config.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // 1. Rename column in documents table
    // Check if column exists first
    $stmt = $conn->prepare("SHOW COLUMNS FROM documents LIKE 'field'");
    $stmt->execute();
    $hasField = $stmt->rowCount() > 0;
    
    if ($hasField) {
        $conn->exec("ALTER TABLE documents CHANGE COLUMN `field` `belongsTo` VARCHAR(255) NOT NULL");
        echo "Renamed 'field' to 'belongsTo' in documents table.\n";
    } else {
        echo "Column 'field' not found in documents table, might have been already renamed.\n";
    }
    
    // 2. Map existing empty or null belongsTo to 'Nhà trường'
    $conn->exec("UPDATE documents SET belongsTo = 'Nhà trường' WHERE belongsTo IS NULL OR belongsTo = ''");
    echo "Set default 'Nhà trường' for empty belongsTo.\n";
    
    // 3. Delete old document_field categories and create new ones
    $conn->exec("DELETE FROM document_categories WHERE type = 'document_field'");
    echo "Deleted old document_field categories.\n";
    
    // Insert new categories if they don't exist
    $categories = ['Cấp trên', 'Nhà trường'];
    foreach ($categories as $cat) {
        $stmt = $conn->prepare("SELECT id FROM document_categories WHERE name = ? AND type = 'document_belongs_to'");
        $stmt->execute([$cat]);
        if ($stmt->rowCount() == 0) {
            $insert = $conn->prepare("INSERT INTO document_categories (id, name, type, createdAt, updatedAt) VALUES (?, ?, 'document_belongs_to', NOW(), NOW())");
            $insert->execute([bin2hex(random_bytes(16)), $cat]);
            echo "Inserted category: $cat\n";
        }
    }
    
    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
