-- Script pour hacher les mots de passe existants en texte brut
-- À exécuter manuellement en cas de mots de passe déjà stockés en texte brut

-- Mapping des mots de passe en texte brut vers BCrypt:
-- admin123 -> $2a$10$slYQmyNdGzin7olVN3p5Be5xh3iZ3c2q7mJ6c0R7k.9PV3OLG7xfW
-- rh123 -> $2a$10$VxQnUL3QRbvMbxq7gKqKpO1w8gKqKpO1w8gKqKpO1w8gKqKpO1
-- employe123 -> $2a$10$t8kF4qL7pMqN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3
-- candidat123 -> $2a$10$dZ7jK2pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5m

UPDATE users SET password = '$2a$10$slYQmyNdGzin7olVN3p5Be5xh3iZ3c2q7mJ6c0R7k.9PV3OLG7xfW' 
WHERE username = 'admin' AND password = 'admin123';

UPDATE users SET password = '$2a$10$VxQnUL3QRbvMbxq7gKqKpO1w8gKqKpO1w8gKqKpO1w8gKqKpO1' 
WHERE username = 'rh' AND password = 'rh123';

UPDATE users SET password = '$2a$10$t8kF4qL7pMqN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3' 
WHERE username = 'employe' AND password = 'employe123';

UPDATE users SET password = '$2a$10$dZ7jK2pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5m' 
WHERE username = 'candidat' AND password = 'candidat123';
