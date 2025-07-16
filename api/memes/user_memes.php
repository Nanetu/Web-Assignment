<?php

session_start();

require_once __DIR__.'/../../utils/database.php';

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

$sql = "SELECT
            m.*,
            m.title,
            COALESCE(SUM(r.type = 'Like'), 0) AS like_count,
            COALESCE(SUM(r.type = 'Upvote'), 0) AS upvote_count,
            COALESCE(COUNT(s.share_id), 0) AS share_count,
            COALESCE(COUNT(d.download_id), 0) AS download_count
        FROM 
            memes m
        LEFT JOIN 
            reactions r on m.meme_id = r.meme_id
        LEFT JOIN 
            downloads d ON m.meme_id = d.meme_id
        LEFT JOIN 
            shares s ON m.meme_id = s.meme_id
        WHERE 
            m.user_id = ?
        GROUP BY
            m.meme_id
";

try{
    $memes = dbQuery($sql, [$user]);
    echo json_encode([
        'success'=>true,
        'memes'=>$memes
    ]);
} catch(Exception $e){
    http_response_code(500);
    echo json_encode([
        'success'=>false,
        'error'=>'Fetch failed '.$e->getMessage()
    ]);
}

?>