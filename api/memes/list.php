<?php

require_once __DIR__ . '/../../utils/database.php';

header('Content-Type: application/json');

$sql = "SELECT 
            m.*,
            SUM(r.emoji_type = 'laugh') AS laugh_count,
            SUM(r.emoji_type = 'cry') AS cry_count,
            SUM(r.emoji_type = 'angry') AS angry_count,
            SUM(e.action = 'share') AS share_count,
            SUM(e.action = 'download') AS download_count
        FROM 
            memes m
        LEFT JOIN 
            reactions r ON m.id = r.meme_id
        LEFT JOIN 
            engagement e ON m.id = e.meme_id
        GROUP BY 
            m.id
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