<?php

require_once __DIR__ . '/../../utils/database.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$directory = 'uploads/';



?>