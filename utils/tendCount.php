<?php

require_once __DIR__.'/../../utils/database.php';

function calculateTrend($time, $likes, $upvotes, $shares, $downloads) {
    $now = new DateTime();
    $memeTime = new DateTime($time);
    $interval = $now->diff($memeTime);
    $hoursOld = ($interval->days * 24) + $interval->h;

    if ($hoursOld <= 48) {
        return 'Fresh';
    }

    if (($likes + $upvotes + $shares) >= 20 && $hoursOld <= 72) {
        return 'Trending';
    }

    if (($likes + $upvotes + $shares + $downloads) >= 100) {
        return 'Viral';
    }

    return 'Fresh';
}

function memeCount($meme_id){
    $sql = "SELECT
        m.meme_id, m.timestamp,
        SUM(r.type = 'Like') AS like_count,
        SUM(r.type = 'Upvote') AS upvote_count,
        SUM(r.type = 'Share') AS share_count,
        SUM(r.type = 'Download') AS download_count
    FROM 
        memes m 
    LEFT JOIN 
        reactions r ON m.meme_id = r.meme_id 
    WHERE 
        m.meme_id = ?
    ";

    $meme_data = dbQuery($sql, [$meme_id]);

    if (empty($meme_data)) {
        return [
            'like_count' => 0,
            'upvote_count' => 0,
            'share_count' => 0,
            'download_count' => 0
        ];
    }

    return $meme_data[0];
}

function updateMemeCategory($meme_id) {
    $counts = memeCount($meme_id);
    if (!$counts) return;

    $category = calculateTrend(
        $counts['timestamp'],
        $counts['like_count'],
        $counts['upvote_count'],
        $counts['share_count'],
        $counts['download_count']
    );

    $sql = "UPDATE memes SET category = ? WHERE meme_id = ?";
    dbQuery($sql, [$category, $meme_id]);
}


?>