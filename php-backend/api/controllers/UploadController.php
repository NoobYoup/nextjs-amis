<?php
require_once 'Controller.php';

class UploadController extends Controller {

    public function upload() {
        $this->requireAuth();

        $uploaded = $this->saveFiles('file', 'uploads/');
        if (!empty($uploaded)) {
            // Return public URL (assuming /api/prefix)
            $url = "/api/" . $uploaded[0];
            $this->json(['url' => $url]);
        } else {
            $this->json(['message' => 'Upload failed or no file'], 400);
        }
    }
}
?>
