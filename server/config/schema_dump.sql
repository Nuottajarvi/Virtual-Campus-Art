CREATE DATABASE IF NOT EXISTS pnuottaj;
USE pnuottaj;
DROP TABLE IF EXISTS models;
CREATE TABLE models (model_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY , title VARCHAR(35), filename TEXT NOT NULL, created_at DATETIME, rating INT, location INT);