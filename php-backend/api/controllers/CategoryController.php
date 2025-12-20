<?php
require_once 'Controller.php';

class CategoryController extends Controller {

    // ACTIVITY CATEGORIES
    public function listActivity() {
        $stmt = $this->conn->prepare("SELECT * FROM activity_categories WHERE deletedAt IS NULL ORDER BY name ASC");
        $stmt->execute();
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function showActivity($id) {
        $stmt = $this->conn->prepare("SELECT * FROM activity_categories WHERE id = :id AND deletedAt IS NULL LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->json($row);
        } else {
            $this->json(['message' => 'Not Found'], 404);
        }
    }

    public function storeActivity() {
        $this->requireAuth();
        $input = $this->getInput();
        $stmt = $this->conn->prepare("INSERT INTO activity_categories (id, name, createdAt, updatedAt) VALUES (:id, :name, NOW(), NOW())");
        $id = bin2hex(random_bytes(16));
        $stmt->execute([':id' => $id, ':name' => $input['name']]);
        $this->json(['message' => 'Category created', 'id' => $id]);
    }

    public function updateActivity($id) {
        $this->requireAuth();
        $input = $this->getInput();
        $stmt = $this->conn->prepare("UPDATE activity_categories SET name = :name, updatedAt = NOW() WHERE id = :id");
        $stmt->execute([':id' => $id, ':name' => $input['name']]);
        $this->json(['message' => 'Category updated']);
    }

    public function deleteActivity($id) {
        $this->requireAuth();
        $stmt = $this->conn->prepare("UPDATE activity_categories SET deletedAt = NOW() WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $this->json(['message' => 'Category deleted']);
    }

    // DOCUMENT CATEGORIES
    public function listDocument() {
        $stmt = $this->conn->prepare("SELECT * FROM document_categories ORDER BY type ASC, name ASC");
        $stmt->execute();
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function showDocument($id) {
        $stmt = $this->conn->prepare("SELECT * FROM document_categories WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->json($row);
        } else {
            $this->json(['message' => 'Not Found'], 404);
        }
    }

    public function storeDocument() {
        $this->requireAuth();
        $input = $this->getInput();
        $stmt = $this->conn->prepare("INSERT INTO document_categories (id, name, type, createdAt, updatedAt) VALUES (:id, :name, :type, NOW(), NOW())");
        $id = bin2hex(random_bytes(16));
        $stmt->execute([':id' => $id, ':name' => $input['name'], ':type' => $input['type']]);
        $this->json(['message' => 'Category created', 'id' => $id]);
    }

    public function updateDocument($id) {
        $this->requireAuth();
        $input = $this->getInput();
        $stmt = $this->conn->prepare("UPDATE document_categories SET name = :name, type = :type, updatedAt = NOW() WHERE id = :id");
        $stmt->execute([':id' => $id, ':name' => $input['name'], ':type' => $input['type']]);
        $this->json(['message' => 'Category updated']);
    }

    public function deleteDocument($id) {
        $this->requireAuth();
        $stmt = $this->conn->prepare("DELETE FROM document_categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $this->json(['message' => 'Category deleted']);
    }
}
?>
