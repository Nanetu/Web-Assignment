<?php

session_start();

require_once __DIR__ . '/../../utils/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['uid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    return;
}

$user = $_SESSION['uid'];

$data = json_decode(file_get_contents('php://input'), true);
$meme_id = $data['meme_id'] ?? null;

if (!$meme_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No meme selected']);
    exit;
}

try {

    $sql = "DELETE FROM memes WHERE meme_id = ?";
    dbQuery($sql, [$meme_id]);

    echo json_encode(['success' => true, 'message' => 'Meme deleted successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
