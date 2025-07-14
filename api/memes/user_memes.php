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
            r.title,
            SUM(r.type = 'Like') AS like_count,
            SUM(r.type = 'Upvote') AS upvote_count,
            SUM(r.type = 'Share'), AS share_countc,
            SUM(r.type = 'Download') AS download_count
        FROM 
            memes m
        LEFT JOIN 
            reactions r on m.meme_id = r.meme_id
        WHERE 
            m.meme_id = ?
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