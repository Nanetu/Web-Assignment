CREATE DATABASE zedmemes;
USE zedmemes;
CREATE TABLE users (
user_id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE memes (
meme_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
filename VARCHAR(255) NOT NULL,
timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id)
	ON DELETE CASCADE
);
CREATE TABLE reactions (
reactions_id INT AUTO_INCREMENT PRIMARY KEY,
meme_id INT NOT NULL,
user_id INT NOT NULL,
type ENUM('Like', 'Upvote', 'Share', 'Download') NOT NULL,
FOREIGN KEY (meme_id) REFERENCES memes(meme_id)
	ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);
USE ZedMemes;

ALTER TABLE memes ADD title VARCHAR(255) NOT NULL;
ALTER TABLE memes ADD category ENUM('Trending', 'Fresh', 'Viral') DEFAULT 'Fresh';
ALTER TABLE reactions ADD CONSTRAINT unique_user_meme_type UNIQUE(user_id, meme_id, type
USE ZedMemes;
ALTER TABLE memes MODIFY COLUMN category ENUM('Trending', 'Fresh', 'Viral', 'Other') DEFAULT 'Fresh';
USE ZedMemes;
ALTER TABLE reactions MODIFY COLUMN type ENUM('Like', 'Upvote') NOT NULL;
USE ZedMemes;
CREATE TABLE downloads (
    download_id INT AUTO_INCREMENT PRIMARY KEY,
    meme_id     INT NOT NULL,
    user_id     INT,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meme_id) REFERENCES memes(meme_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE shares (
    share_id   INT AUTO_INCREMENT PRIMARY KEY,
    meme_id    INT NOT NULL,
    user_id    INT,
    timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meme_id) REFERENCES memes(meme_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);





