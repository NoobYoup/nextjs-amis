<?php
require_once 'Controller.php';

class TuitionController extends Controller {

    public function index() {
        $type = isset($_GET['type']) ? $_GET['type'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;

        $sql = "SELECT * FROM tuitions WHERE 1=1";
        $params = [];

        if ($type) {
            $sql .= " AND type = :type";
            $params[':type'] = $type;
        }

        if ($search) {
            $sql .= " AND (name LIKE :search OR description LIKE :search)";
            $params[':search'] = "%$search%";
        }

        // Count
        $countSql = str_replace("SELECT *", "SELECT COUNT(*)", $sql);
        $stmt = $this->conn->prepare($countSql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();
        $total = $stmt->fetchColumn();

        // Fetch
        $sql .= " ORDER BY createdAt DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->json([
            'data' => $rows,
            'total' => (int)$total,
            'pages' => ceil($total / $limit),
            'current' => $page
        ]);
    }

    public function show($id) {
        $sql = "SELECT * FROM tuitions WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->json($row);
        } else {
            $this->json(['message' => 'Not Found'], 404);
        }
    }

    public function store() {
        $this->requireAuth();
        $input = $this->getInput();

        $sql = "INSERT INTO tuitions (id, type, name, description, grade, level, tuition, discount, period, date, months, typeFee, createdAt, updatedAt) 
                VALUES (:id, :type, :name, :description, :grade, :level, :tuition, :discount, :period, :date, :months, :typeFee, NOW(), NOW())";
        
        $stmt = $this->conn->prepare($sql);
        $id = bin2hex(random_bytes(16));
        $stmt->bindValue(':id', $id);
        $stmt->bindValue(':type', $input['type']);
        $stmt->bindValue(':name', $input['name']);
        $stmt->bindValue(':description', $input['description'] ?? '');
        $stmt->bindValue(':grade', $input['grade'] ?? null);
        $stmt->bindValue(':level', $input['level'] ?? null);
        $stmt->bindValue(':tuition', $input['tuition'] ?? null);
        $stmt->bindValue(':discount', $input['discount'] ?? null);
        $stmt->bindValue(':period', $input['period'] ?? null);
        $stmt->bindValue(':date', $input['date'] ?? null);
        $stmt->bindValue(':months', $input['months'] ?? null);
        $stmt->bindValue(':typeFee', $input['typeFee'] ?? null);

        if ($stmt->execute()) {
            $this->json(['message' => 'Tuition record created', 'id' => $id]);
        } else {
            $this->json(['message' => 'Failed to create record'], 500);
        }
    }

    public function update($id) {
        $this->requireAuth();
        $input = $this->getInput();

        $sql = "UPDATE tuitions SET name = :name, description = :description, grade = :grade, 
                level = :level, tuition = :tuition, discount = :discount, period = :period, 
                date = :date, months = :months, typeFee = :typeFee, updatedAt = NOW() 
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id);
        $stmt->bindValue(':name', $input['name']);
        $stmt->bindValue(':description', $input['description'] ?? '');
        $stmt->bindValue(':grade', $input['grade'] ?? null);
        $stmt->bindValue(':level', $input['level'] ?? null);
        $stmt->bindValue(':tuition', $input['tuition'] ?? null);
        $stmt->bindValue(':discount', $input['discount'] ?? null);
        $stmt->bindValue(':period', $input['period'] ?? null);
        $stmt->bindValue(':date', $input['date'] ?? null);
        $stmt->bindValue(':months', $input['months'] ?? null);
        $stmt->bindValue(':typeFee', $input['typeFee'] ?? null);

        if ($stmt->execute()) {
            $this->json(['message' => 'Tuition record updated']);
        } else {
            $this->json(['message' => 'Failed to update record'], 500);
        }
    }

    public function delete($id) {
        $this->requireAuth();
        $stmt = $this->conn->prepare("DELETE FROM tuitions WHERE id = :id");
        if ($stmt->execute([':id' => $id])) {
            $this->json(['message' => 'Tuition record deleted']);
        } else {
            $this->json(['message' => 'Failed to delete record'], 500);
        }
    }
}
?>
