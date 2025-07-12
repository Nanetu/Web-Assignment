<?
require_once "../utils/database.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'];
$password = $data['password'];

if(!$email || !$password){
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

$sql = "SELECT * FROM user WHERE email = ?";

$user = dbQuery($sql, [$email]);

$db_user = $user[0]['user_id'];
$db_password = $user[0]['password'];

if($user && password_verify($password, $db_password)){
    session_start();
    $_SESSION['uid'] = $db_user;

    echo json_encode([
        'success'=>true
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'error'=>'Invalid Credentials'
    ]);
}
?>