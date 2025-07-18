<?php
require_once __DIR__ . '/../../utils/database.php';

header('Content-Type: application/json');

// Get pagination parameters
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 10; // Max 100, default 10
$offset = ($page - 1) * $limit;

// Validate pagination parameters
if ($limit < 1 || $offset < 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid pagination parameters']);
    exit;
}

// Get total count for pagination info
$countSql = "SELECT COUNT(DISTINCT m.meme_id) as total FROM memes m";

// Main query with pagination
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
            m.meme_id
        ORDER BY 
            m.timestamp DESC
        LIMIT ? OFFSET ?";

try {
    // Get total count
    $totalResult = dbQuery($countSql, null);
    $totalMemes = $totalResult[0]['total'];
    $totalPages = ceil($totalMemes / $limit);
    
    // Get paginated memes
    $memes = dbQueryInt($sql, [$limit, $offset]);
    
    echo json_encode([
        'success' => true,
        'memes' => $memes,
        'total_meme' => $totalMemes,
        'total_pages' => $totalPages,
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Fetch failed: ' . $e->getMessage()]);
}
?>