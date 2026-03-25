<?php
require_once 'Controller.php';

class ReformController extends Controller {

    public function index() {
        // Pagination
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;

        // Total
        $countSql = "SELECT COUNT(*) FROM reforms";
        $total = $this->conn->query($countSql)->fetchColumn();

        $sql = "SELECT * FROM reforms ORDER BY createdAt DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row['details'] = json_decode($row['details']) ?? [];
            
            // Files
            $fStmt = $this->conn->prepare("SELECT * FROM reform_files WHERE reformId = :rid ORDER BY `order` ASC");
            $fStmt->bindValue(':rid', $row['id']);
            $fStmt->execute();
            $row['files'] = $fStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $this->json(['data' => $rows, 'total' => (int)$total]);
    }

    public function show($id) {
        $sql = "SELECT * FROM reforms WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $row['details'] = json_decode($row['details']) ?? [];
            
            // Files
            $fStmt = $this->conn->prepare("SELECT * FROM reform_files WHERE reformId = :rid ORDER BY `order` ASC");
            $fStmt->bindValue(':rid', $id);
            $fStmt->execute();
            $row['files'] = $fStmt->fetchAll(PDO::FETCH_ASSOC);

            $this->json($row);
        } else {
            $this->json(['message' => 'Not Found'], 404);
        }
    }

    public function store() {
        $this->requireAuth();
        $input = $this->getInput();

        $this->conn->beginTransaction();
        try {
            $sql = "INSERT INTO reforms (id, title, description, details, createdAt, updatedAt) 
                    VALUES (:id, :title, :description, :details, NOW(), NOW())";
            
            $stmt = $this->conn->prepare($sql);
            $id = bin2hex(random_bytes(16));
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $input['title']);
            $stmt->bindValue(':description', $input['description'] ?? '');
            $stmt->bindValue(':details', $input['details'] ?? '[]'); // Details usually JSON string
            $stmt->execute();

            // Handle Files (Frontend uses 'file')
            $uploadedFiles = $this->saveFiles('file', 'uploads/reforms/');
            foreach ($uploadedFiles as $index => $url) {
                $fType = $input["fileType_$index"] ?? (strpos($url, '.pdf') !== false ? 'pdf' : 'image');
                $fSql = "INSERT INTO reform_files (id, reformId, fileUrl, fileType, `order`) VALUES (:id, :rid, :url, :type, :order)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':rid', $id);
                $fStmt->bindValue(':url', $url);
                $fStmt->bindValue(':type', $fType);
                $fStmt->bindValue(':order', $index);
                $fStmt->execute();
            }

            $this->conn->commit();
            $this->json(['message' => 'Reform created', 'id' => $id]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->json(['message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function update($id) {
        $this->requireAuth();
        $input = $this->getInput();

        $this->conn->beginTransaction();
        try {
            $sql = "UPDATE reforms SET title = :title, description = :description, details = :details, updatedAt = NOW() 
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $input['title']);
            $stmt->bindValue(':description', $input['description'] ?? '');
            $stmt->bindValue(':details', $input['details'] ?? '[]');
            $stmt->execute();

            // Update Files
            $existingFiles = isset($input['existingFiles']) ? json_decode($input['existingFiles'], true) : [];
            $this->conn->prepare("DELETE FROM reform_files WHERE reformId = :id")->execute([':id' => $id]);
            
            $order = 0;
            foreach ($existingFiles as $ef) {
                $fSql = "INSERT INTO reform_files (id, reformId, fileUrl, fileType, `order`) VALUES (:id, :rid, :url, :type, :order)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':rid', $id);
                $fStmt->bindValue(':url', $ef['fileUrl'] ?? $ef['url']);
                $fStmt->bindValue(':type', $ef['fileType'] ?? 'pdf');
                $fStmt->bindValue(':order', $order++);
                $fStmt->execute();
            }

            $uploadedFiles = $this->saveFiles('file', 'uploads/reforms/');
            foreach ($uploadedFiles as $index => $url) {
                $fType = $input["fileType_$index"] ?? (strpos($url, '.pdf') !== false ? 'pdf' : 'image');
                $fSql = "INSERT INTO reform_files (id, reformId, fileUrl, fileType, `order`) VALUES (:id, :rid, :url, :type, :order)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':rid', $id);
                $fStmt->bindValue(':url', $url);
                $fStmt->bindValue(':type', $fType);
                $fStmt->bindValue(':order', $order++);
                $fStmt->execute();
            }

            $this->conn->commit();
            $this->json(['message' => 'Reform updated']);
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->json(['message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function delete($id) {
        $this->requireAuth();
        $this->conn->prepare("DELETE FROM reform_files WHERE reformId = :id")->execute([':id' => $id]);
        $stmt = $this->conn->prepare("DELETE FROM reforms WHERE id = :id");
        if ($stmt->execute([':id' => $id])) {
            $this->json(['message' => 'Reform deleted']);
        } else {
            $this->json(['message' => 'Failed to delete reform'], 500);
        }
    }
}
?>
