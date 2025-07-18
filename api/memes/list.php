<?php

require_once __DIR__ . '/../../utils/database.php';

header('Content-Type: application/json');

$sql = "SELECT
            m.*,
            u.username,
            COALESCE(SUM(r.type = 'Like'), 0) AS like_count,
            COALESCE(SUM(r.type = 'Upvote'), 0) AS upvote_count,
            COALESCE(COUNT(s.share_id), 0) AS share_count,
            COALESCE(COUNT(d.download_id), 0) AS download_count
        FROM 
            memes m
        LEFT JOIN 
        users u ON m.user_id = u.user_id
        LEFT JOIN 
            reactions r ON m.meme_id = r.meme_id
        LEFT JOIN 
            downloads d ON m.meme_id = d.meme_id
        LEFT JOIN 
            shares s ON m.meme_id = s.meme_id
        GROUP BY 
            m.meme_id;
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