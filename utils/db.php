<?php

define('host', 'localhost');
define('user', 'root');
define('pass', '');
define('name', 'zedmemes');
define('port', 3307);    //change your port number to reflect your xampp

try {
    $dsn = 'mysql:host='.$host.';dbname='.$name.';port='.$port;
    $options = [
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ];
    $conn = new PDO($dsn, $user, $pass, $options);
} catch(PDOException $e){
    die("Connection failed: ".$e->getMessage());
}

function dbQuery($sql, $params = []){
    global $conn;
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    } catch(PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
}

?>