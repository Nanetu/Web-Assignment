<?php

session_start();

require_once __DIR__.'/../../utils/database.php';
require_once __DIR__.'/../../utils/tendCount.php';

header('Content-Type: application/json');

if (!isset($_SESSION['uid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode([
        'success'=>false,
        'message'=>'Method not allowed'
    ]);
    return;
}

$user = $_SESSION['uid'];

$data = json_decode(file_get_contents('php://input'), true);
$meme_id = $data['meme_id'] ?? null;
$reaction = $data['type'] ?? null;

if (!$reaction || !$meme_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    if ($reaction === 'RemoveLike') {
        $sql = "DELETE FROM reactions WHERE meme_id = ? AND user_id = ? AND type = 'Like'";
        dbQuery($sql, [$meme_id, $user]);
        dbQuery("UPDATE memes SET like_count = GREATEST(like_count - 1, 0) WHERE meme_id = ?", [$meme_id]);
    } elseif ($reaction === 'RemoveUpvote') {
        $sql = "DELETE FROM reactions WHERE meme_id = ? AND user_id = ? AND type = 'Upvote'";
        dbQuery($sql, [$meme_id, $user]);
        dbQuery("UPDATE memes SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE meme_id = ?", [$meme_id]);
    } else {
        // Insert or update for Like / Upvote / Share / Download
        $sql = "SELECT reactions_id FROM reactions WHERE meme_id = ? AND user_id = ?";
        $existing = dbQuery($sql, [$meme_id, $user]);

        if ($existing) {
            $sql = "UPDATE reactions SET type = ? WHERE meme_id = ? AND user_id = ?";
        } else {
            $sql = "INSERT INTO reactions (type, meme_id, user_id) VALUES (?, ?, ?)";
        }
        dbQuery($sql, [$reaction, $meme_id, $user]);
    }

    updateMemeCategory($meme_id);
    echo json_encode(['success' => true, 'message' => 'Reaction updated successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

?>