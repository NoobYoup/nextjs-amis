<?php
require_once 'Controller.php';

class ProcedureController extends Controller {

    public function categories() {
        $stmt = $this->conn->prepare("SELECT * FROM procedure_categories ORDER BY name ASC");
        $stmt->execute();
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function index() {
        $category = isset($_GET['category']) ? $_GET['category'] : null;

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;

        $where = " WHERE 1=1";
        $params = [];

        if ($category) {
            $where .= " AND category = :category";
            $params[':category'] = $category;
        }

        // Total
        $countSql = "SELECT COUNT(*) FROM procedures" . $where;
        $cStmt = $this->conn->prepare($countSql);
        foreach ($params as $k => $v) $cStmt->bindValue($k, $v);
        $cStmt->execute();
        $total = $cStmt->fetchColumn();

        $sql = "SELECT * FROM procedures" . $where . " ORDER BY createdAt DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Attach content and files
        foreach ($rows as &$row) {
            // Contents
            $contentStmt = $this->conn->prepare("SELECT * FROM procedure_contents WHERE procedureId = :pid");
            $contentStmt->bindValue(':pid', $row['id']);
            $contentStmt->execute();
            $contents = $contentStmt->fetchAll(PDO::FETCH_ASSOC);
            $row['content'] = array_map(function($c) {
                $c['items'] = json_decode($c['items']) ?? [];
                return $c;
            }, $contents);

            // Files
            $fStmt = $this->conn->prepare("SELECT * FROM procedure_files WHERE procedureId = :pid");
            $fStmt->bindValue(':pid', $row['id']);
            $fStmt->execute();
            $row['files'] = $fStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $this->json(['data' => $rows, 'total' => (int)$total]);
    }

    public function show($id) {
        $sql = "SELECT * FROM procedures WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Contents
            $cStmt = $this->conn->prepare("SELECT * FROM procedure_contents WHERE procedureId = :pid");
            $cStmt->bindValue(':pid', $id);
            $cStmt->execute();
            $contents = $cStmt->fetchAll(PDO::FETCH_ASSOC);
            $row['content'] = array_map(function($c) {
                $c['items'] = json_decode($c['items']) ?? [];
                return $c;
            }, $contents);

            // Files
            $fStmt = $this->conn->prepare("SELECT * FROM procedure_files WHERE procedureId = :pid");
            $fStmt->bindValue(':pid', $id);
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
            $sql = "INSERT INTO procedures (id, title, category, description, createdAt, updatedAt) 
                    VALUES (:id, :title, :category, :description, NOW(), NOW())";
            
            $stmt = $this->conn->prepare($sql);
            $id = bin2hex(random_bytes(16));
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $input['title']);
            $stmt->bindValue(':category', $input['category']);
            $stmt->bindValue(':description', $input['description'] ?? '');
            $stmt->execute();

            // Handle Contents (JSON string from frontend)
            $contents = json_decode($input['content'], true);
            foreach ($contents as $c) {
                $cSql = "INSERT INTO procedure_contents (id, procedureId, title, items) VALUES (:id, :pid, :title, :items)";
                $cStmt = $this->conn->prepare($cSql);
                $cStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $cStmt->bindValue(':pid', $id);
                $cStmt->bindValue(':title', $c['title']);
                $cStmt->bindValue(':items', json_encode($c['items']));
                $cStmt->execute();
            }

            // Handle Files
            // Note: Frontend uses 'file' as key. 
            // If multiple 'file' keys, standard PHP $_FILES only sees last one.
            // I'll assume only one for now or fix frontend later if needed.
            $uploadedFiles = $this->saveFiles('file', 'uploads/procedures/');
            foreach ($uploadedFiles as $index => $url) {
                $fType = $input["fileType_$index"] ?? 'image';
                $fSql = "INSERT INTO procedure_files (id, procedureId, fileUrl, fileType) VALUES (:id, :pid, :url, :type)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':pid', $id);
                $fStmt->bindValue(':url', $url);
                $fStmt->bindValue(':type', $fType);
                $fStmt->execute();
            }

            $this->conn->commit();
            $this->json(['message' => 'Procedure created', 'id' => $id]);
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
            $sql = "UPDATE procedures SET title = :title, category = :category, description = :description, updatedAt = NOW() 
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $input['title']);
            $stmt->bindValue(':category', $input['category']);
            $stmt->bindValue(':description', $input['description'] ?? '');
            $stmt->execute();

            // Update Contents
            $this->conn->prepare("DELETE FROM procedure_contents WHERE procedureId = :id")->execute([':id' => $id]);
            $contents = json_decode($input['content'], true);
            foreach ($contents as $c) {
                $cSql = "INSERT INTO procedure_contents (id, procedureId, title, items) VALUES (:id, :pid, :title, :items)";
                $cStmt = $this->conn->prepare($cSql);
                $cStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $cStmt->bindValue(':pid', $id);
                $cStmt->bindValue(':title', $c['title']);
                $cStmt->bindValue(':items', json_encode($c['items']));
                $cStmt->execute();
            }

            // Update Files
            $existingFiles = isset($input['existingFiles']) ? json_decode($input['existingFiles'], true) : [];
            $this->conn->prepare("DELETE FROM procedure_files WHERE procedureId = :id")->execute([':id' => $id]);
            
            foreach ($existingFiles as $ef) {
                $fSql = "INSERT INTO procedure_files (id, procedureId, fileUrl, fileType) VALUES (:id, :pid, :url, :type)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':pid', $id);
                $fStmt->bindValue(':url', $ef['fileUrl']);
                $fStmt->bindValue(':type', $ef['fileType']);
                $fStmt->execute();
            }

            $uploadedFiles = $this->saveFiles('file', 'uploads/procedures/');
            foreach ($uploadedFiles as $index => $url) {
                $fType = $input["fileType_$index"] ?? 'image';
                $fSql = "INSERT INTO procedure_files (id, procedureId, fileUrl, fileType) VALUES (:id, :pid, :url, :type)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':pid', $id);
                $fStmt->bindValue(':url', $url);
                $fStmt->bindValue(':type', $fType);
                $fStmt->execute();
            }

            $this->conn->commit();
            $this->json(['message' => 'Procedure updated']);
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->json(['message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function delete($id) {
        $this->requireAuth();
        $this->conn->prepare("DELETE FROM procedure_contents WHERE procedureId = :id")->execute([':id' => $id]);
        $this->conn->prepare("DELETE FROM procedure_files WHERE procedureId = :id")->execute([':id' => $id]);
        $stmt = $this->conn->prepare("DELETE FROM procedures WHERE id = :id");
        if ($stmt->execute([':id' => $id])) {
            $this->json(['message' => 'Procedure deleted']);
        } else {
            $this->json(['message' => 'Failed to delete procedure'], 500);
        }
    }
}
?>
