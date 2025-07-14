<?php

session_start();

require_once __DIR__.'/../../utils/database.php';

header('Content-Type: application/json');

if(!$_SERVER['uid']){
    http_response_code(401);
    echo json_encode([
        'success'=>false,
        'message'=>'Authentication required'
    ]);
    return;
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
        SUM(r.type = 'Like') as like_count,
        SUM(r.type = 'Upvote') as upvote_count,
        SUM(r.type = 'Share'), as share_countc,
        SUM(r.type = 'Download') as download_count
        FROM 
        memes m
        LEFT JOIN 
        reactions r on r.meme_id = m.meme_id
        GROUP BY
        m.meme_id
        HAVING m.meme_id = ?
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