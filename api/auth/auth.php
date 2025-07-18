<?php
session_start();
header('Content-Type: application/json');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Origin: index.html");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if (isset($_SESSION['username'])) {
    echo json_encode(["loggedIn" => true, "user" => $_SESSION['username']]);
} else {
    echo json_encode(["loggedIn" => false]);
}
?>
