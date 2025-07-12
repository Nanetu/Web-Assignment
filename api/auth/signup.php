<?

require_once "../utils/database.php";
session_start();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username']);
$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
$password = password_hash($data['passwrd'], PASSWORD_DEFAULT);

if(!$username || !$email || !$pass){
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
    $existingUser = dbQuery("SELECT id FROM user WHERE email = ?", [$email]);
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
    $sql = "INSERT INTO user (username, email, password, created_at) VALUES (?, ?, ?, NOW())";
    dbQuery($sql, [$username, $email, $password]);

    $user = dbQuery("SELECT id FROM user WHERE email = ?", [$email]);
    if ($user) {
        $_SESSION['uid'] = $user[0]['id'];
        echo json_encode(['success' => true, 'user_id' => $_SESSION['uid']]);
    } else {
        throw new Exception("User creation failed");
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Signup failed: ' . $e->getMessage()]);
}
?>