<?php
class Database {
    // START: CONFIG - EDIT THESE FOR DIRECTADMIN
    private $host = "localhost";
    private $db_name = "amisedu_db";
    private $username = "root"; // CHANGE THIS ON SERVER
    private $password = "";     // CHANGE THIS ON SERVER
    // END: CONFIG

    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8mb4");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
