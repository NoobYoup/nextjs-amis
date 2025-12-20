<?php
require_once 'Controller.php';

class SettingController extends Controller {

    public function updatePassword() {
        $user = $this->requireAuth();
        $input = $this->getInput();

        if (!isset($input['oldPassword']) || !isset($input['newPassword'])) {
            $this->json(['message' => 'Old and New password required'], 400);
        }

        // Verify Old Password
        // Fetch fresh user data to be sure
        $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->execute([':id' => $user['id']]);
        $dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!password_verify($input['oldPassword'], $dbUser['password'])) {
            $this->json(['message' => 'Incorrect old password'], 401);
        }

        // Update with new password
        $newHash = password_hash($input['newPassword'], PASSWORD_BCRYPT);
        $updateStmt = $this->conn->prepare("UPDATE users SET password = :pass, updatedAt = NOW() WHERE id = :id");
        
        if ($updateStmt->execute([':pass' => $newHash, ':id' => $user['id']])) {
            $this->json(['message' => 'Password updated successfully']);
        } else {
            $this->json(['message' => 'Failed to update password'], 500);
        }
    }
}
?>
