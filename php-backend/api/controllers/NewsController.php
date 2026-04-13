<?php
require_once 'Controller.php';

class NewsController extends Controller {

    public function index() {
        // Pagination vars
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 9;
        $offset = ($page - 1) * $limit;

        // Filters
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;

        // Base Query
        $conditions = [];
        
        $sql = "SELECT * FROM news WHERE 1=1";

        // 'Tiểu học', 'Trung học' are strings stored in `category` column in News table (as per schema)
        if ($category && $category !== 'all') {
            $sql .= " AND category = :category";
            $conditions[':category'] = urldecode($category);
        }

        if ($search) {
            $sql .= " AND (title LIKE :search OR description LIKE :search OR content LIKE :search)";
            $conditions[':search'] = "%$search%";
        }

        // Count Total
        $stmt = $this->conn->prepare(str_replace("SELECT *", "SELECT COUNT(*)", $sql));
        foreach ($conditions as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        $totalItems = $stmt->fetchColumn();
        $totalPages = ceil($totalItems / $limit);

        // Fetch Data
        $sql .= " ORDER BY date DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($sql);
        foreach ($conditions as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Attach images and files
        foreach ($rows as &$row) {
            $id = $row['id'];
            
            // Images
            $imgSql = "SELECT * FROM news_images WHERE newsId = :newsId ORDER BY `order` ASC";
            $imgStmt = $this->conn->prepare($imgSql);
            $imgStmt->execute([':newsId' => $id]);
            $row['images'] = $imgStmt->fetchAll(PDO::FETCH_ASSOC);

            // Files
            $fileSql = "SELECT * FROM news_files WHERE newsId = :newsId ORDER BY `order` ASC";
            $fileStmt = $this->conn->prepare($fileSql);
            $fileStmt->execute([':newsId' => $id]);
            $row['files'] = $fileStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $this->json([
            'data' => $rows,
            'pagination' => [
                'total' => (int)$totalItems,
                'pages' => $totalPages,
                'current' => $page
            ]
        ]);
    }

    public function show($id) {
        $sql = "SELECT * FROM news WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Fetch images
            $imgSql = "SELECT * FROM news_images WHERE newsId = :newsId ORDER BY `order` ASC";
            $imgStmt = $this->conn->prepare($imgSql);
            $imgStmt->bindParam(':newsId', $id);
            $imgStmt->execute();
            $row['images'] = array_map(function($img) {
                return ['id' => $img['id'], 'imageUrl' => $img['imageUrl'], 'order' => $img['order']];
            }, $imgStmt->fetchAll(PDO::FETCH_ASSOC));

            // Fetch files
            $fileSql = "SELECT * FROM news_files WHERE newsId = :newsId ORDER BY `order` ASC";
            $fileStmt = $this->conn->prepare($fileSql);
            $fileStmt->bindParam(':newsId', $id);
            $fileStmt->execute();
            $row['files'] = $fileStmt->fetchAll(PDO::FETCH_ASSOC);

            $this->json($row);
        } else {
            $this->json(['message' => 'Not Found'], 404);
        }
    }

    public function categories() {
        // Hardcoded categories as they seem to be just strings in DB? 
        // Or unique values from table. Let's fetch distinct.
        $sql = "SELECT DISTINCT category as name FROM news WHERE category IS NOT NULL ORDER BY category ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Normalize to structure similar to other categories if needed
        $formatted = array_map(function($item) {
            return ['id' => $item['name'], 'name' => $item['name']];
        }, $data);
        $this->json($formatted);
    }

    public function store() {
        $this->requireAuth();
        $input = $this->getInput();

        $this->conn->beginTransaction();
        try {
            $sql = "INSERT INTO news (id, title, description, content, category, date, createdAt, updatedAt) 
                    VALUES (:id, :title, :description, :content, :category, :date, NOW(), NOW())";
            
            $stmt = $this->conn->prepare($sql);
            $id = bin2hex(random_bytes(16));
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $input['title']);
            $stmt->bindValue(':description', $input['description'] ?? '');
            $stmt->bindValue(':content', $input['content']);
            $stmt->bindValue(':category', $input['category']);
            $stmt->bindValue(':date', $input['date']);
            $stmt->execute();

            // Handle Images
            $uploadedImages = $this->saveFiles('images', 'uploads/news/');
            foreach ($uploadedImages as $index => $url) {
                $imgSql = "INSERT INTO news_images (id, newsId, imageUrl, `order`, createdAt, updatedAt) VALUES (:id, :newsId, :url, :order, NOW(), NOW())";
                $imgStmt = $this->conn->prepare($imgSql);
                $imgStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $imgStmt->bindValue(':newsId', $id);
                $imgStmt->bindValue(':url', $url);
                $imgStmt->bindValue(':order', $index);
                $imgStmt->execute();
            }

            // Handle Files (PDF, DOCX)
            $uploadedFiles = $this->saveFiles('files', 'uploads/news/files/');
            foreach ($uploadedFiles as $index => $url) {
                $fileSql = "INSERT INTO news_files (id, newsId, fileUrl, fileType, fileName, `order`, createdAt, updatedAt) 
                            VALUES (:id, :newsId, :url, :type, :name, :order, NOW(), NOW())";
                $fileStmt = $this->conn->prepare($fileSql);
                $ext = pathinfo($url, PATHINFO_EXTENSION);
                $name = $_FILES['files']['name'][$index] ?? basename($url);
                
                $fileStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fileStmt->bindValue(':newsId', $id);
                $fileStmt->bindValue(':url', $url);
                $fileStmt->bindValue(':type', $ext);
                $fileStmt->bindValue(':name', $name);
                $fileStmt->bindValue(':order', $index);
                $fileStmt->execute();
            }

            $this->conn->commit();
            $this->json(['message' => 'News created', 'id' => $id]);
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
            $sql = "UPDATE news SET title = :title, description = :description, content = :content, 
                    category = :category, date = :date, updatedAt = NOW() 
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $input['title']);
            $stmt->bindValue(':description', $input['description'] ?? '');
            $stmt->bindValue(':content', $input['content']);
            $stmt->bindValue(':category', $input['category']);
            $stmt->bindValue(':date', $input['date']);
            $stmt->execute();

            // Handle Images
            $existingImages = isset($input['existingImages']) ? json_decode($input['existingImages'], true) : [];
            $this->conn->prepare("DELETE FROM news_images WHERE newsId = :id")->execute([':id' => $id]);
            $imgOrder = 0;
            foreach ($existingImages as $img) {
                $imgSql = "INSERT INTO news_images (id, newsId, imageUrl, `order`, createdAt, updatedAt) VALUES (:id, :newsId, :url, :order, NOW(), NOW())";
                $imgStmt = $this->conn->prepare($imgSql);
                $imgStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $imgStmt->bindValue(':newsId', $id);
                $imgStmt->bindValue(':url', $img['url']);
                $imgStmt->bindValue(':order', $imgOrder++);
                $imgStmt->execute();
            }
            $newUploadedImages = $this->saveFiles('images', 'uploads/news/');
            foreach ($newUploadedImages as $url) {
                $imgSql = "INSERT INTO news_images (id, newsId, imageUrl, `order`, createdAt, updatedAt) VALUES (:id, :newsId, :url, :order, NOW(), NOW())";
                $imgStmt = $this->conn->prepare($imgSql);
                $imgStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $imgStmt->bindValue(':newsId', $id);
                $imgStmt->bindValue(':url', $url);
                $imgStmt->bindValue(':order', $imgOrder++);
                $imgStmt->execute();
            }

            // Handle Files
            $existingFiles = isset($input['existingFiles']) ? json_decode($input['existingFiles'], true) : [];
            $this->conn->prepare("DELETE FROM news_files WHERE newsId = :id")->execute([':id' => $id]);
            $fileOrder = 0;
            foreach ($existingFiles as $file) {
                $fileSql = "INSERT INTO news_files (id, newsId, fileUrl, fileType, fileName, `order`, createdAt, updatedAt) 
                            VALUES (:id, :newsId, :url, :type, :name, :order, NOW(), NOW())";
                $fileStmt = $this->conn->prepare($fileSql);
                $fileStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fileStmt->bindValue(':newsId', $id);
                $fileStmt->bindValue(':url', $file['fileUrl'] ?? $file['url']);
                $fileStmt->bindValue(':type', $file['fileType'] ?? 'pdf');
                $fileStmt->bindValue(':name', $file['fileName'] ?? 'document');
                $fileStmt->bindValue(':order', $fileOrder++);
                $fileStmt->execute();
            }
            $newUploadedFiles = $this->saveFiles('files', 'uploads/news/files/');
            foreach ($newUploadedFiles as $index => $url) {
                $fileSql = "INSERT INTO news_files (id, newsId, fileUrl, fileType, fileName, `order`, createdAt, updatedAt) 
                            VALUES (:id, :newsId, :url, :type, :name, :order, NOW(), NOW())";
                $fileStmt = $this->conn->prepare($fileSql);
                $ext = pathinfo($url, PATHINFO_EXTENSION);
                $name = $_FILES['files']['name'][$index] ?? basename($url);
                $fileStmt->bindValue(':id', bin2hex(random_bytes(16)));
                $fileStmt->bindValue(':newsId', $id);
                $fileStmt->bindValue(':url', $url);
                $fileStmt->bindValue(':type', $ext);
                $fileStmt->bindValue(':name', $name);
                $fileStmt->bindValue(':order', $fileOrder++);
                $fileStmt->execute();
            }

            $this->conn->commit();
            $this->json(['message' => 'News updated']);
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->json(['message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function delete($id) {
        $this->requireAuth();
        // news_images should have ON DELETE CASCADE, but let's be explicit
        $this->conn->prepare("DELETE FROM news_images WHERE newsId = :id")->execute([':id' => $id]);
        $this->conn->prepare("DELETE FROM news_files WHERE newsId = :id")->execute([':id' => $id]);
        $stmt = $this->conn->prepare("DELETE FROM news WHERE id = :id");
        if ($stmt->execute([':id' => $id])) {
            $this->json(['message' => 'News deleted']);
        } else {
            $this->json(['message' => 'Failed to delete news'], 500);
        }
    }
}
?>
