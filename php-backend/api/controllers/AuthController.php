<?php
require_once 'Controller.php';

class AuthController extends Controller {

    public function login() {
        $input = $this->getInput();
        if (!isset($input['email']) || !isset($input['password'])) {
            $this->json(['message' => 'Email and Password required'], 400);
        }

        $email = $input['email'];
        $password = $input['password'];

        $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verify Password (Bcrypt compatibility)
            // Note: In NextAuth/Node, usually bcrypt is used. PHP password_verify supports it.
            if (password_verify($password, $user['password'])) {
                
                // Remove password from response
                unset($user['password']);

                // In a real API, generate a JWT here. 
                // For simplicity/DirectAdmin without composer, we might send a basic random token 
                // or just the user object and trust the client to store it (Logic for "Mock" JWT below)
                
                // Simple Token Strategy: Base64 encode UserID + Time for this demo
                // Ideally use firebase/php-jwt if Composer allowed
                $token = base64_encode(json_encode([
                    'id' => $user['id'],
                    'exp' => time() + (86400 * 7) // 7 days
                ]));

                $this->json([
                    'message' => 'Login successful',
                    'token' => $token,
                    'user' => $user
                ]);
            } else {
                $this->json(['message' => 'Mật khẩu không đúng. Vui lòng kiểm tra lại mật khẩu !'], 401);
            }
        } else {
            $this->json(['message' => 'Email không đúng. Vui lòng kiểm tra lại email !'], 401);
        }
    }

    public function me() {
        // Retrieve Token from Header
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            // Decode / Verify Token
            $data = json_decode(base64_decode($token), true);
            
            if ($data && isset($data['id'])) {
                 $query = "SELECT id, name, email, role, createdAt FROM users WHERE id = :id LIMIT 1";
                 $stmt = $this->conn->prepare($query);
                 $stmt->bindParam(':id', $data['id']);
                 $stmt->execute();
                 
                 if ($stmt->rowCount() > 0) {
                     $user = $stmt->fetch(PDO::FETCH_ASSOC);
                     $this->json($user);
                 }
            }
        }
        
        $this->json(['message' => 'Unauthorized'], 401);
    }
}
?>
