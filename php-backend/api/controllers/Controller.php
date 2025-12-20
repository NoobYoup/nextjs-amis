<?php
class Controller {
    protected $db;
    protected $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    protected function json($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data);
        exit();
    }

    protected function getInput() {
        $json = json_decode(file_get_contents("php://input"), true);
        if ($json) return $json;
        return $_POST;
    }

    protected function saveFiles($fieldName, $targetDir = 'uploads/') {
        $uploadedUrls = [];
        
        // Some servers/configs might strip [] from the key, some don't.
        // We check both versions.
        $rawFieldName = str_replace('[]', '', $fieldName);
        $fieldWithBrackets = $rawFieldName . '[]';
        
        $files = null;
        if (isset($_FILES[$fieldName])) {
            $files = $_FILES[$fieldName];
        } elseif (isset($_FILES[$rawFieldName])) {
            $files = $_FILES[$rawFieldName];
        } elseif (isset($_FILES[$fieldWithBrackets])) {
            $files = $_FILES[$fieldWithBrackets];
        }

        if (!$files) return [];

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        // Standardize structure for loop (PHP $_FILES structure differs for multiple)
        if (is_array($files['name'])) {
            $count = count($files['name']);
            for ($i = 0; $i < $count; $i++) {
                if ($files['error'][$i] === UPLOAD_ERR_OK) {
                    $ext = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
                    $filename = uniqid() . '.' . $ext;
                    $targetPath = $targetDir . $filename;
                    
                    if (move_uploaded_file($files['tmp_name'][$i], $targetPath)) {
                        $uploadedUrls[] = $targetDir . $filename;
                    }
                }
            }
        } else {
            // Single file upload
            if ($files['error'] === UPLOAD_ERR_OK) {
                $ext = pathinfo($files['name'], PATHINFO_EXTENSION);
                $filename = uniqid() . '.' . $ext;
                $targetPath = $targetDir . $filename;
                
                if (move_uploaded_file($files['tmp_name'], $targetPath)) {
                    $uploadedUrls[] = $targetDir . $filename;
                }
            }
        }
        
        return $uploadedUrls;
    }

    protected function getAuthUser() {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $data = json_decode(base64_decode($token), true);
            
            if ($data && isset($data['id'])) {
                $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
                $stmt->bindParam(':id', $data['id']);
                $stmt->execute();
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
        }
        return null;
    }

    protected function requireAuth() {
        $user = $this->getAuthUser();
        if (!$user) {
            $this->json(['message' => 'Unauthorized'], 401);
        }
        return $user;
    }

    public function download() {
        $url = isset($_GET['url']) ? $_GET['url'] : '';
        if (empty($url)) {
            $this->json(['message' => 'Missing file URL'], 400);
        }

        // Security check: ensure path is within allowed directories
        // Remove domain and /api prefix if present
        $filePath = parse_url($url, PHP_URL_PATH);
        if ($filePath === false || $filePath === null) $filePath = $url;
        
        $filePath = str_replace('/api/', '', $filePath);
        $filePath = ltrim($filePath, '/');
        
        // Allowed directories: uploads/, reforms/, procedures/
        $allowedDirs = ['uploads/', 'reforms/', 'procedures/'];
        $isAllowed = false;
        foreach ($allowedDirs as $dir) {
            if (strpos($filePath, $dir) === 0) {
                $isAllowed = true;
                break;
            }
        }

        if (!$isAllowed) {
            $this->json(['message' => 'Access denied'], 403);
        }

        $basePath = dirname(__DIR__) . '/'; // php-backend/api/
        $fullPath = $basePath . $filePath;

        if (!file_exists($fullPath) || !is_file($fullPath)) {
            $this->json(['message' => 'File not found: ' . $filePath], 404);
        }

        $mimeType = mime_content_type($fullPath);
        $fileName = basename($fullPath);

        header('Content-Description: File Transfer');
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($fullPath));
        readfile($fullPath);
        exit();
    }
}
?>
