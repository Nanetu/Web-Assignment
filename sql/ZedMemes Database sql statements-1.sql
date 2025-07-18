CREATE DATABASE zedmemes;
USE zedmemes;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Memes Table
CREATE TABLE memes (
    meme_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('Trending', 'Fresh', 'Viral', 'Other') DEFAULT 'Fresh',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Reactions Table
CREATE TABLE reactions (
    reactions_id INT AUTO_INCREMENT PRIMARY KEY,
    meme_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('Like', 'Upvote') NOT NULL,
    FOREIGN KEY (meme_id) REFERENCES memes(meme_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_meme_type UNIQUE(user_id, meme_id, type)
);

-- Downloads Table
CREATE TABLE downloads (
    download_id INT AUTO_INCREMENT PRIMARY KEY,
    meme_id INT NOT NULL,
    user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meme_id) REFERENCES memes(meme_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Shares Table
CREATE TABLE shares (
    share_id INT AUTO_INCREMENT PRIMARY KEY,
    meme_id INT NOT NULL,
    user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meme_id) REFERENCES memes(meme_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
