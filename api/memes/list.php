<?php

require_once __DIR__ . '/../../utils/database.php';

header('Content-Type: application/json');

$sql = "SELECT 
            m.*,
            SUM(r.type = 'Like') AS like_count,
            SUM(r.type = 'Upvote') AS upvote_count,
            SUM(r.type = 'Share') AS share_count,
            SUM(r.type = 'Download') AS download_count
        FROM 
            memes m
        LEFT JOIN 
            reactions r ON m.meme_id = r.meme_id
        GROUP BY 
            m.meme_id
        ";

try {
    $memes = dbQuery($sql, null);
    echo json_encode([
        'success'=>true,
        'memes'=>$memes
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Fetch failed: ' . $e->getMessage()]);
}

?>