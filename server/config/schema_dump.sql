DROP database IF EXISTS vca;
CREATE database vca;
USE vca;
CREATE TABLE models (model_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY , title VARCHAR(35), data LONGTEXT NOT NULL, created_at DATE);
CREATE TABLE ratings (rating_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, model INT NOT NULL REFERENCES models(model_id), rating INT, rated_at DATE);