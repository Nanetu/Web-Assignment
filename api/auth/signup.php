<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Origin: index.html");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../../utils/database.php';
session_start();

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['error'=>'Method not allowed here']);
    return;
}

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username']);
$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
$password = password_hash($data['password'], PASSWORD_DEFAULT);

if(!$username || !$email || !$password){
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']);
    exit;
}

try {
    $existingUser = dbQuery("SELECT user_id FROM users WHERE email = ?", [$email]);
    if ($existingUser) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit;
}

try {
    $sql = "INSERT INTO users (username, email, password, date_created) VALUES (?, ?, ?, NOW())";
    dbQuery($sql, [$username, $email, $password]);

    $user = dbQuery("SELECT user_id FROM users WHERE email = ?", [$email]);
    if ($user) {
        $_SESSION['uid'] = $user[0]['user_id'];
        echo json_encode(['success' => true, 'user_id' => $_SESSION['uid']]);
    } else {
        throw new Exception("User creation failed");
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Signup failed: ' . $e->getMessage()]);
}
?>