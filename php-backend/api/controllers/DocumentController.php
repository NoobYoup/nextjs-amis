<?php
require_once 'Controller.php';

class DocumentController extends Controller {

    public function index() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;

        $type = isset($_GET['type']) ? $_GET['type'] : null;
        $field = isset($_GET['field']) ? $_GET['field'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;

        $conditions = [];
        $sql = "SELECT * FROM documents WHERE 1=1";

        if ($type && $type !== 'all') {
            $sql .= " AND type = :type";
            $conditions[':type'] = $type;
        }

        if ($field && $field !== 'all') {
            $sql .= " AND field = :field";
            $conditions[':field'] = $field;
        }
        
        if ($search) {
             $sql .= " AND (title LIKE :search OR number LIKE :search)";
             $conditions[':search'] = "%$search%";
        }

        // Count
        $stmt = $this->conn->prepare(str_replace("SELECT *", "SELECT COUNT(*)", $sql));
        foreach ($conditions as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        $totalItems = $stmt->fetchColumn();
        $totalPages = ceil($totalItems / $limit);

        // Fetch
        $sql .= " ORDER BY date DESC, createdAt DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($sql);
        foreach ($conditions as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Attach files
        foreach ($rows as &$row) {
            $fileSql = "SELECT * FROM document_files WHERE documentId = :id ORDER BY `order` ASC";
            $fStmt = $this->conn->prepare($fileSql);
            $fStmt->bindValue(':id', $row['id']);
            $fStmt->execute();
            $row['files'] = $fStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $this->json([
            'data' => $rows,
            'pages' => $totalPages,
            'current' => $page
        ]);
    }

    public function show($id) {
        $sql = "SELECT * FROM documents WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $fileSql = "SELECT * FROM document_files WHERE documentId = :id ORDER BY `order` ASC";
            $fStmt = $this->conn->prepare($fileSql);
            $fStmt->bindValue(':id', $id);
            $fStmt->execute();
            $row['files'] = $fStmt->fetchAll(PDO::FETCH_ASSOC);
            $this->json($row);
        } else {
            $this->json(['message' => 'Not Found'], 404);
        }
    }

    public function filters() {
        // Years from documents
        $yStmt = $this->conn->prepare("SELECT DISTINCT YEAR(date) as year FROM documents WHERE date IS NOT NULL ORDER BY year DESC");
        $yStmt->execute();
        $years = $yStmt->fetchAll(PDO::FETCH_COLUMN);

        // Types and Fields from categories
        $cStmt = $this->conn->prepare("SELECT * FROM document_categories ORDER BY name ASC");
        $cStmt->execute();
        $all = $cStmt->fetchAll(PDO::FETCH_ASSOC);

        $types = array_values(array_map(function($item) { return $item['name']; }, array_filter($all, function($item) { return $item['type'] === 'document_type'; })));
        $fields = array_values(array_map(function($item) { return $item['name']; }, array_filter($all, function($item) { return $item['type'] === 'document_field'; })));

        $this->json([
            'years' => array_map('intval', $years),
            'types' => $types,
            'fields' => $fields
        ]);
    }

    public function categories() {
        // Fetch from document_categories (old version, keeping for safety)
        $sql = "SELECT * FROM document_categories ORDER BY name ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $all = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $types = array_values(array_filter($all, function($item) { return $item['type'] === 'document_type'; }));
        $fields = array_values(array_filter($all, function($item) { return $item['type'] === 'document_field'; }));

        $this->json([
            'types' => $types,
            'fields' => $fields
        ]);
    }

    public function store() {
        $this->requireAuth();
        $input = $this->getInput();

        $this->conn->beginTransaction();
        try {
            $sql = "INSERT INTO documents (id, title, number, type, field, date, summary, isNew, createdAt, updatedAt) 
                    VALUES (:id, :title, :number, :type, :field, :date, :summary, :isNew, NOW(), NOW())";
            
            $stmt = $this->conn->prepare($sql);
            $id = bin2hex(random_bytes(16));
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $input['title']);
            $stmt->bindValue(':number', $input['number'] ?? '');
            $stmt->bindValue(':type', $input['type']);
            $stmt->bindValue(':field', $input['field']);
            $stmt->bindValue(':date', $input['date']);
            $stmt->bindValue(':summary', $input['summary'] ?? '');
            $isNew = 0;
            if (isset($input['isNew'])) {
                $isNew = ($input['isNew'] === 'true' || $input['isNew'] === '1' || $input['isNew'] === true) ? 1 : 0;
            }
            $stmt->bindValue(':isNew', $isNew);
            $stmt->execute();

            // Handle Files (Frontend uses 'file' key)
            $uploadedFiles = $this->saveFiles('file', 'uploads/documents/');
            foreach ($uploadedFiles as $index => $url) {
                // Determine file type from input if provided, or default to pdf if not image
                $fType = $input["fileType_$index"] ?? (strpos($url, '.pdf') !== false ? 'pdf' : 'image');
                $fSql = "INSERT INTO document_files (id, documentId, fileUrl, fileType, `order`) VALUES (:id, :documentId, :url, :type, :order)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':documentId', $id);
                $fStmt->bindValue(':url', $url);
                $fStmt->bindValue(':type', $fType);
                $fStmt->bindValue(':order', $index);
                $fStmt->execute();
            }

            $this->conn->commit();
            $this->json(['message' => 'Document created', 'id' => $id]);
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
            $sql = "UPDATE documents SET title = :title, number = :number, type = :type, 
                    field = :field, date = :date, summary = :summary, isNew = :isNew, updatedAt = NOW() 
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $input['title']);
            $stmt->bindValue(':number', $input['number'] ?? '');
            $stmt->bindValue(':type', $input['type']);
            $stmt->bindValue(':field', $input['field']);
            $stmt->bindValue(':date', $input['date']);
            $stmt->bindValue(':summary', $input['summary'] ?? '');
            $stmt->bindValue(':isNew', (int)($input['isNew'] ?? 0));
            $stmt->execute();

            // Handle Files
            $existingFiles = isset($input['existingFiles']) ? json_decode($input['existingFiles'], true) : [];
            
            $this->conn->prepare("DELETE FROM document_files WHERE documentId = :id")->execute([':id' => $id]);
            
            $order = 0;
            foreach ($existingFiles as $file) {
                $fSql = "INSERT INTO document_files (id, documentId, fileUrl, fileType, `order`) VALUES (:id, :documentId, :url, :type, :order)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':documentId', $id);
                $fStmt->bindValue(':url', $file['fileUrl'] ?? $file['url']);
                $fStmt->bindValue(':type', $file['fileType'] ?? 'pdf');
                $fStmt->bindValue(':order', $order++);
                $fStmt->execute();
            }
            
            $newUploadedFiles = $this->saveFiles('file', 'uploads/documents/');
            foreach ($newUploadedFiles as $index => $url) {
                $fType = $input["fileType_$index"] ?? (strpos($url, '.pdf') !== false ? 'pdf' : 'image');
                $fSql = "INSERT INTO document_files (id, documentId, fileUrl, fileType, `order`) VALUES (:id, :documentId, :url, :type, :order)";
                $fStmt = $this->conn->prepare($fSql);
                $fStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fStmt->bindValue(':documentId', $id);
                $fStmt->bindValue(':url', $url);
                $fStmt->bindValue(':type', $fType);
                $fStmt->bindValue(':order', $order++);
                $fStmt->execute();
            }

            $this->conn->commit();
            $this->json(['message' => 'Document updated']);
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->json(['message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function delete($id) {
        $this->requireAuth();
        $this->conn->prepare("DELETE FROM document_files WHERE documentId = :id")->execute([':id' => $id]);
        $stmt = $this->conn->prepare("DELETE FROM documents WHERE id = :id");
        if ($stmt->execute([':id' => $id])) {
            $this->json(['message' => 'Document deleted']);
        } else {
            $this->json(['message' => 'Failed to delete document'], 500);
        }
    }
}
?>
