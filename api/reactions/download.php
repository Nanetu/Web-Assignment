<?php

session_start();

header('Content-Type: application/json');

require_once __DIR__.'/../../utils/database.php';

if(!isset($_SESSION['uid'])){
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
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$meme_id = $data['meme_id'];

if(!$meme_id){
    http_response_code(404);
    echo json_encode(['success'=>false, 'message'=>'Meme must be chosen']);
}

$sql = "SELECT filename, title FROM memes WHERE meme_id = ?";

try{
    $file = dbQuery($sql, [$meme_id]);
    $path = $file[0]['filename'];
    $title = $file[0]['title'];
    
    $system_path = __DIR__.'/../../'.$path;

    if(!file_exists($system_path)){
        http_response_code(400);
        echo json_encode(['success'=>false, 'message'=>'File does not exist']);
        exit();
    }

    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="'.$title.'"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($system_path));
    readfile($system_path);

    $update = "INSERT INTO downloads(meme_id, user_id) VALUES (?, ?)";
    dbQuery($update, [$meme_id, $_SESSION['uid']]);
    updateMemeCategory($meme_id);

    exit();
}catch(Exception $e){
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch file']);
}

?>