<?php
session_start();
require_once __DIR__.'/../../utils/database.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Credentials: true");

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

// Get pagination parameters
$page = isset($_POST['page']) ? max(1, intval($_POST['page'])) : 1;
$limit = isset($_POST['limit']) ? max(1, min(100, intval($_POST['limit']))) : 10; // Max 100, default 10
$offset = ($page - 1) * $limit;

// Get total count for this user's memes
$countSql = "SELECT COUNT(DISTINCT m.meme_id) as total FROM memes m WHERE m.user_id = ?";

// Main query with pagination
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
        ORDER BY 
            m.timestamp DESC
        LIMIT ? OFFSET ?";

try{
    // Get total count
    $totalResult = dbQuery($countSql, [$user]);
    $totalMemes = $totalResult[0]['total'];
    $totalPages = ceil($totalMemes / $limit);
    
    // Get paginated memes
    $memes = dbQueryInt($sql, [$user, $limit, $offset]);
    
    echo json_encode([
        'success' => true,
        'memes' => $memes
    ]);
} catch(Exception $e){
    http_response_code(500);
    echo json_encode([
        'success'=>false,
        'error'=>'Fetch failed '.$e->getMessage()
    ]);
}
?>