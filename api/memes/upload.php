<?php

session_start();

require_once __DIR__ . '/../../utils/database.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Credentials: true");

if (!isset($_SESSION['uid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['meme']) || $_FILES['meme']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        0 => 'There is no error',
        1 => 'The uploaded file exceeds the upload_max_filesize directive',
        2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive',
        3 => 'The uploaded file was only partially uploaded',
        4 => 'No file was uploaded',
        6 => 'Missing a temporary folder',
        7 => 'Failed to write file to disk',
        8 => 'A PHP extension stopped the file upload'
    ];
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Upload error: ' . ($errorMessages[$_FILES['meme']['error'] ?? 'Unknown error'])
    ]);
    exit;
}

$allowed_mime = ['image/jpeg', 'image/png', 'image/pjpeg', 'image/x-png', 'image/webp'];
$allowed_ext = ['jpg', 'jpeg', 'png', 'webp'];
$extension = strtolower(pathinfo($_FILES['meme']['name'], PATHINFO_EXTENSION));

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$meme_type = finfo_file($finfo, $_FILES['meme']['tmp_name']);
finfo_close($finfo);

if (!in_array($meme_type, $allowed_mime) || !in_array($extension, $allowed_ext)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Only JPG, WEBP and PNG files are allowed',
        'detected_mime' => $meme_type,
        'detected_ext' => $extension
    ]);
    exit;
}

$maxSize = 5 * 1024 * 1024;
if ($_FILES['meme']['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File exceeds 5MB limit']);
    exit;
}

$directory = __DIR__ . '/../../uploads/';
$originalName = basename($_FILES['meme']['name']);
$extension = pathinfo($originalName, PATHINFO_EXTENSION);
$uniqueName = uniqid("meme_", true) . "." . $extension;
$targetFile = $directory.$uniqueName;

if (move_uploaded_file($_FILES['meme']['tmp_name'], $targetFile)) {
    try {
        $publicPath = 'uploads/' . $uniqueName;
        $title = $_POST['title'] ?? 'Untitled meme';
        $user = $_SESSION['uid'];

        $sql = "INSERT INTO memes (user_id, filename, timestamp, title, category) VALUES (?, ?, NOW(), ?, 'Fresh')";

        dbQuery($sql, [$user, $publicPath, $title]);

        echo json_encode(['success' => true, 'file'=>$publicPath]);
    } catch(PDOException $e) {
        unlink($targetFile);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
}

?>