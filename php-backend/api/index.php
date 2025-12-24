<?php
// Handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Cho phép cả domain Vercel và domain chính chủ
    $allowed_origins = [
        'https://nextjs-amis.vercel.app',
        'https://amis.edu.vn',
        'https://www.amis.edu.vn'
    ];
    $origin = $_SERVER['HTTP_ORIGIN'];
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

// Load Config & Controllers
require_once 'config/database.php';

// Autoload Controllers (Simple implementation)
foreach (glob("controllers/*.php") as $filename) {
    require_once $filename;
}

// Simple Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
if ($scriptDir !== '/') {
    $uri = preg_replace('#^' . preg_quote($scriptDir, '#') . '#', '', $uri);
}
$uri = '/' . ltrim($uri, '/');

$method = $_SERVER['REQUEST_METHOD'];

// Helper to send JSON response
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// --- ROUTING TABLE ---

// AUTH
if ($uri === '/auth/login' && $method === 'POST') {
    (new AuthController())->login();
}
elseif ($uri === '/auth/me' && $method === 'GET') {
    (new AuthController())->me();
}

// ACTIVITIES (PUBLIC)
elseif (preg_match('#^/client/activities/([^/]+)$#', $uri, $matches) && $method === 'GET') {
    (new ActivityController())->show($matches[1]);
}
elseif ($uri === '/client/activities' && $method === 'GET') {
    (new ActivityController())->index();
}
elseif ($uri === '/client/categories/activity' && $method === 'GET') {
    (new ActivityController())->categories();
}

// ACTIVITIES (ADMIN)
elseif ($uri === '/admin/activities' && $method === 'GET') {
    (new ActivityController())->index(); // Reuse public index for now, requireAuth handled inside if needed or here
}
elseif ($uri === '/admin/activities' && $method === 'POST') {
    (new ActivityController())->store();
}
elseif (preg_match('#^/admin/activities/([^/]+)$#', $uri, $matches)) {
    if ($method === 'GET') (new ActivityController())->show($matches[1]);
    elseif ($method === 'PUT' || $method === 'POST') (new ActivityController())->update($matches[1]);
    elseif ($method === 'DELETE') (new ActivityController())->delete($matches[1]);
}
elseif ($uri === '/admin/categories/activity' && $method === 'GET') {
    (new ActivityController())->categories();
}

// NEWS (PUBLIC)
elseif (preg_match('#^/client/news/([^/]+)$#', $uri, $matches) && $method === 'GET') {
    (new NewsController())->show($matches[1]);
}
elseif ($uri === '/client/news' && $method === 'GET') {
    (new NewsController())->index();
}
elseif ($uri === '/client/categories/news' && $method === 'GET') {
    (new NewsController())->categories();
}

// NEWS (ADMIN)
elseif ($uri === '/admin/news' && $method === 'GET') {
    (new NewsController())->index();
}
elseif ($uri === '/admin/news' && $method === 'POST') {
    (new NewsController())->store();
}
elseif (preg_match('#^/admin/news/([^/]+)$#', $uri, $matches)) {
    if ($method === 'GET') (new NewsController())->show($matches[1]);
    elseif ($method === 'PUT' || $method === 'POST') (new NewsController())->update($matches[1]);
    elseif ($method === 'DELETE') (new NewsController())->delete($matches[1]);
}
elseif ($uri === '/admin/categories/news' && $method === 'GET') {
    (new NewsController())->categories();
}

// DOCUMENTS (PUBLIC)
elseif ($uri === '/client/documents' && $method === 'GET') {
    (new DocumentController())->index();
}
elseif ($uri === '/client/documents/filters' && $method === 'GET') {
    (new DocumentController())->filters();
}
elseif ($uri === '/client/categories/document' && $method === 'GET') {
    (new CategoryController())->listDocument();
}

// DOCUMENTS (ADMIN)
elseif ($uri === '/admin/documents' && $method === 'GET') {
    (new DocumentController())->index();
}
elseif ($uri === '/admin/documents' && $method === 'POST') {
    (new DocumentController())->store();
}
elseif (preg_match('#^/admin/documents/([^/]+)$#', $uri, $matches)) {
    if ($method === 'GET') (new DocumentController())->show($matches[1]);
    elseif ($method === 'PUT' || $method === 'POST') (new DocumentController())->update($matches[1]);
    elseif ($method === 'DELETE') (new DocumentController())->delete($matches[1]);
}
elseif ($uri === '/admin/categories/document' && $method === 'GET') {
    (new CategoryController())->listDocument();
}

// PROCEDURES (PUBLIC)
elseif ($uri === '/client/procedures' && $method === 'GET') {
    (new ProcedureController())->index();
}

// PROCEDURES (ADMIN)
elseif ($uri === '/admin/procedures' && $method === 'GET') {
    (new ProcedureController())->index();
}
elseif ($uri === '/admin/procedures' && $method === 'POST') {
    (new ProcedureController())->store();
}
elseif (preg_match('#^/admin/procedures/([^/]+)$#', $uri, $matches)) {
    if ($method === 'GET') (new ProcedureController())->show($matches[1]);
    elseif ($method === 'PUT' || $method === 'POST') (new ProcedureController())->update($matches[1]);
    elseif ($method === 'DELETE') (new ProcedureController())->delete($matches[1]);
}

// REFORMS (PUBLIC)
elseif ($uri === '/client/reforms' && $method === 'GET') {
    (new ReformController())->index();
}

// REFORMS (ADMIN)
elseif ($uri === '/admin/reforms' && $method === 'GET') {
    (new ReformController())->index();
}
elseif ($uri === '/admin/reforms' && $method === 'POST') {
    (new ReformController())->store();
}
elseif (preg_match('#^/admin/reforms/([^/]+)$#', $uri, $matches)) {
    if ($method === 'GET') (new ReformController())->show($matches[1]);
    elseif ($method === 'PUT' || $method === 'POST') (new ReformController())->update($matches[1]);
    elseif ($method === 'DELETE') (new ReformController())->delete($matches[1]);
}

// TUITION (ADMIN)
elseif ($uri === '/admin/tuition' && $method === 'GET') {
    (new TuitionController())->index();
}
elseif ($uri === '/admin/tuition' && $method === 'POST') {
    (new TuitionController())->store();
}
elseif (preg_match('#^/admin/tuition/([^/]+)$#', $uri, $matches)) {
    if ($method === 'GET') (new TuitionController())->show($matches[1]);
    elseif ($method === 'PUT' || $method === 'POST') (new TuitionController())->update($matches[1]);
    elseif ($method === 'DELETE') (new TuitionController())->delete($matches[1]);
}

// CATEGORIES (ADMIN)
elseif ($uri === '/admin/categories/activity' && $method === 'GET') {
    (new CategoryController())->listActivity();
}
elseif ($uri === '/admin/categories/activity' && $method === 'POST') {
    (new CategoryController())->storeActivity();
}
elseif (preg_match('#^/admin/categories/activity/([^/]+)$#', $uri, $matches)) {
    if ($method === 'GET') (new CategoryController())->showActivity($matches[1]);
    elseif ($method === 'PUT') (new CategoryController())->updateActivity($matches[1]);
    elseif ($method === 'DELETE') (new CategoryController())->deleteActivity($matches[1]);
}
elseif ($uri === '/admin/categories/document' && $method === 'GET') {
    (new CategoryController())->listDocument();
}
elseif ($uri === '/admin/categories/document' && $method === 'POST') {
    (new CategoryController())->storeDocument();
}
elseif (preg_match('#^/admin/categories/document/([^/]+)$#', $uri, $matches)) {
    if ($method === 'GET') (new CategoryController())->showDocument($matches[1]);
    elseif ($method === 'PUT') (new CategoryController())->updateDocument($matches[1]);
    elseif ($method === 'DELETE') (new CategoryController())->deleteDocument($matches[1]);
}

// SETTINGS (ADMIN)
elseif ($uri === '/admin/settings/password' && $method === 'PUT') {
    (new SettingController())->updatePassword();
}

// UPLOAD (ADMIN)
elseif ($uri === '/admin/upload' && $method === 'POST') {
    (new UploadController())->upload();
}

// DOWNLOAD
elseif (($uri === '/client/download' || $uri === '/download') && $method === 'GET') {
    (new Controller())->download();
}

// DEFAULT
else {
    jsonResponse(["message" => "Endpoint not found: $uri"], 404);
}
?>
