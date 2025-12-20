<?php
require_once 'Controller.php';

class ActivityController extends Controller {

    public function index() {
        // Pagination vars
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 9;
        $offset = ($page - 1) * $limit;

        // Filters
        $categoryId = isset($_GET['categoryId']) ? $_GET['categoryId'] : null;

        // Base Query
        $conditions = [];
        $params = [];

        $sql = "SELECT a.*, c.name as categoryName 
                FROM activities a 
                LEFT JOIN activity_categories c ON a.categoryId = c.id
                WHERE 1=1";

        if ($categoryId && $categoryId !== 'all') {
            $sql .= " AND a.categoryId = :categoryId";
            $conditions[':categoryId'] = $categoryId;
        }

        // Count Total
        $countSql = str_replace("a.*, c.name as categoryName", "COUNT(*)", $sql);
        $stmt = $this->conn->prepare($countSql);
        foreach ($conditions as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        $totalItems = $stmt->fetchColumn();
        $totalPages = ceil($totalItems / $limit);

        // Fetch Data
        $sql .= " ORDER BY a.date DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($sql);
        foreach ($conditions as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Transform Data (JSON fields)
        $data = array_map(function($row) {
            // Check if JSON, if not keep as is (though DB says LongText for images)
            $row['images'] = json_decode($row['images']) ?? [];
            $row['videos'] = json_decode($row['videos']) ?? [];
            $row['category'] = [
                'id' => $row['categoryId'],
                'name' => $row['categoryName']
            ];
            unset($row['categoryName']);
            return $row;
        }, $rows);

        $this->json([
            'data' => $data,
            'pages' => $totalPages,
            'current' => $page
        ]);
    }

    public function show($id) {
        $sql = "SELECT a.*, c.name as categoryName 
                FROM activities a 
                LEFT JOIN activity_categories c ON a.categoryId = c.id
                WHERE a.id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $row['images'] = json_decode($row['images']) ?? [];
            $row['videos'] = json_decode($row['videos']) ?? [];
            $row['category'] = [
                'id' => $row['categoryId'],
                'name' => $row['categoryName']
            ];
            unset($row['categoryName']);
            $this->json($row);
        } else {
            $this->json(['message' => 'Not Found'], 404);
        }
    }

    public function categories() {
        $sql = "SELECT * FROM activity_categories WHERE deletedAt IS NULL ORDER BY name ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->json($data);
    }

    public function store() {
        $this->requireAuth();
        $input = $this->getInput();

        // Handle File Uploads
        $uploadedImages = $this->saveFiles('images', 'uploads/activities/');
        $images = array_merge([], $uploadedImages);
        $thumbnail = count($images) > 0 ? $images[0] : null;

        // Handle videos (sent as string in FormData, legacy splits by \n)
        $videosRaw = $input['videos'] ?? '';
        $videosArr = array_filter(array_map('trim', explode("\n", $videosRaw)));
        $videos = json_encode(array_values($videosArr));

        $sql = "INSERT INTO activities (id, title, description, date, author, thumbnail, images, videos, categoryId, createdAt, updatedAt) 
                VALUES (:id, :title, :description, :date, :author, :thumbnail, :images, :videos, :categoryId, NOW(), NOW())";
        
        $stmt = $this->conn->prepare($sql);
        $id = bin2hex(random_bytes(16));
        $stmt->bindValue(':id', $id);
        $stmt->bindValue(':title', $input['title']);
        $stmt->bindValue(':description', $input['description'] ?? '');
        $stmt->bindValue(':date', $input['date']);
        $stmt->bindValue(':author', $input['author'] ?? '');
        $stmt->bindValue(':thumbnail', $thumbnail);
        $stmt->bindValue(':images', json_encode($images));
        $stmt->bindValue(':videos', $videos);
        $stmt->bindValue(':categoryId', $input['category']); // Frontend sends 'category' for categoryId
        
        if ($stmt->execute()) {
            $this->json(['message' => 'Activity created', 'id' => $id]);
        } else {
            $this->json(['message' => 'Failed to create activity'], 500);
        }
    }

    public function update($id) {
        $this->requireAuth();
        $input = $this->getInput();

        // Handle Images (Combine existing and new)
        $existingImages = isset($input['existingImages']) ? json_decode($input['existingImages'], true) : [];
        if (!is_array($existingImages)) $existingImages = [];
        
        $newUploadedImages = $this->saveFiles('images', 'uploads/activities/');
        $images = array_merge($existingImages, $newUploadedImages);
        
        // Thumbnail: keep existing if still in list, otherwise take first
        $thumbnail = count($images) > 0 ? $images[0] : null;

        $sql = "UPDATE activities SET title = :title, description = :description, date = :date, 
                author = :author, thumbnail = :thumbnail, images = :images, videos = :videos, 
                categoryId = :categoryId, updatedAt = NOW() 
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id);
        $stmt->bindValue(':title', $input['title']);
        $stmt->bindValue(':description', $input['description'] ?? '');
        $stmt->bindValue(':date', $input['date']);
        $stmt->bindValue(':author', $input['author'] ?? '');
        $stmt->bindValue(':thumbnail', $thumbnail);
        $stmt->bindValue(':images', json_encode($images));
        
        // Handle videos
        $videosRaw = $input['videos'] ?? '';
        $videosArr = array_filter(array_map('trim', explode("\n", $videosRaw)));
        $videos = json_encode(array_values($videosArr));
        $stmt->bindValue(':videos', $videos);
        $stmt->bindValue(':categoryId', $input['category']);
        
        if ($stmt->execute()) {
            $this->json(['message' => 'Activity updated']);
        } else {
            $this->json(['message' => 'Failed to update activity'], 500);
        }
    }

    public function delete($id) {
        $this->requireAuth();
        $stmt = $this->conn->prepare("DELETE FROM activities WHERE id = :id");
        $stmt->bindValue(':id', $id);
        
        if ($stmt->execute()) {
            $this->json(['message' => 'Activity deleted']);
        } else {
            $this->json(['message' => 'Failed to delete activity'], 500);
        }
    }
}
?>
