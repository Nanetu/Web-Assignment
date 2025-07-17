<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Origin: index.html");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../../utils/database.php';

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['error'=>'Method not allowed here']);
    return;
}

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'];
$password = $data['password'];

if(!$email || !$password){
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

$sql = "SELECT * FROM users WHERE email = ?";

try {
    $user = dbQuery($sql, [$email]);

    if(!$user){
        http_response_code(401);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    $db_user = $user[0]['user_id'];
    $name = $user[0]['username'];
    $db_password = $user[0]['password'];

    if($user && password_verify($password, $db_password)){
        session_start();
        $_SESSION['uid'] = $db_user;

        echo json_encode([
            'success'=>true,
            'user_id' => $db_user,
            'username'=> $name
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'error'=>'Invalid Credentials'
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
}


?>