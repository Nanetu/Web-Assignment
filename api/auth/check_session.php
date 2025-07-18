<?php

session_id($_SERVER['HTTP_X_SESSION_ID'] ?? '');
session_start();

header('Content-Type: application/json');

if (!empty($_SESSION['email'])) {
    echo json_encode([
        'valid' => true,
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email']
    ]);
} else {
    echo json_encode(['valid' => false]);
}

?>