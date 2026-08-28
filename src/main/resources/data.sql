-- ====================================================
-- Données initiales — Système RH Wifak Bank
-- ====================================================

-- Départements Wifak Bank
INSERT INTO departments (name, description)
SELECT 'Direction Générale', 'Direction générale et gouvernance de la banque'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Direction Générale');

INSERT INTO departments (name, description)
SELECT 'Direction des Ressources Humaines', 'Gestion du personnel, recrutement et formation'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Direction des Ressources Humaines');

INSERT INTO departments (name, description)
SELECT 'Direction des Systèmes d''Information', 'Infrastructure IT, développement et cybersécurité'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Direction des Systèmes d''Information');

INSERT INTO departments (name, description)
SELECT 'Direction Commerciale', 'Développement commercial et relation client'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Direction Commerciale');

INSERT INTO departments (name, description)
SELECT 'Direction Marketing et Digital', 'Marketing, communication et transformation digitale'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Direction Marketing et Digital');

-- Postes Vacants liés au sujet PFE (RH, Digital, IA, Services)
INSERT INTO job_positions (title, department, description, status)
SELECT 'Chargé de Recrutement Digital', 'Direction des Ressources Humaines', 'Gestion du processus de recrutement via la plateforme Wifak Bank RH.', 'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Chargé de Recrutement Digital');

INSERT INTO job_positions (title, department, description, status)
SELECT 'Spécialiste IA et Chatbots', 'Direction des Systèmes d''Information', 'Optimisation des services internes via l''intelligence artificielle.', 'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Spécialiste IA et Chatbots');

INSERT INTO job_positions (title, department, description, status)
SELECT 'Gestionnaire de Paie', 'Direction des Ressources Humaines', 'Gestion des salaires et édition des fiches de paie numériques.', 'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Gestionnaire de Paie');

INSERT INTO job_positions (title, department, description, status)
SELECT 'Responsable Performance & Engagement', 'Direction des Ressources Humaines', 'Suivi de la performance des employés et gestion des bonus.', 'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Responsable Performance & Engagement');

INSERT INTO job_positions (title, department, description, status)
SELECT 'Analyste Transformation Digitale', 'Direction Marketing et Digital', 'Accompagnement de la banque dans sa transition vers le zéro papier.', 'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Analyste Transformation Digitale');

INSERT INTO job_positions (title, department, description, status)
SELECT 'Conseiller Clientèle Bancaire', 'Direction Commerciale', 'Gestion de la relation client au sein du réseau d''agences.', 'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM job_positions WHERE title = 'Conseiller Clientèle Bancaire');

-- ====================================================
-- Utilisateurs de test par défaut (sans colonne department texte)
-- department_id est géré par le DbSeeder Java
-- ====================================================

INSERT INTO users (username, password, email, role, first_name, last_name, password_changed, active, deleted, performance_score)
SELECT 'admin', '$2a$10$slYQmyNdGzin7olVN3p5Be5xh3iZ3c2q7mJ6c0R7k.9PV3OLG7xfW', 'admin@wifakbank.com', 'ADMIN', 'Directeur', 'Général', true, true, false, 1000
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password, email, role, first_name, last_name, password_changed, active, deleted, performance_score)
SELECT 'employe', '$2a$10$t8kF4qL7pMqN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3', 'employe@wifakbank.com', 'EMPLOYEE', 'Employé', 'Wifak', true, true, false, 1000
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'employe');

INSERT INTO users (username, password, email, role, first_name, last_name, password_changed, active, deleted, performance_score)
SELECT 'candidat', '$2a$10$dZ7jK2pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5mL8pN5m', 'candidat@gmail.com', 'CANDIDATE', 'Nouveau', 'Candidat', true, true, false, 1000
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'candidat');

-- ====================================================
-- Employés liés aux utilisateurs
-- ====================================================

-- [obsolete: no Employee entity; employees are Users] INSERT INTO employees (name, email, phone, department, user_id, performance_score)
-- [obsolete: no Employee entity; employees are Users] SELECT 'Employé Wifak', 'employe@wifakbank.com', '55123456', 'Direction des Systèmes d''Information', (SELECT id FROM users WHERE username = 'employe'), 1250
-- [obsolete: no Employee entity; employees are Users] WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'employe@wifakbank.com');

-- ====================================================
-- Employés supplémentaires (Mock Data)
-- ====================================================

-- Ajout des utilisateurs
INSERT INTO users (username, password, email, role, first_name, last_name, password_changed, active, deleted, performance_score)
SELECT 'ahmed.tounsi', '$2a$10$t8kF4qL7pMqN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3', 'ahmed.tounsi@wifakbank.com', 'EMPLOYEE', 'Ahmed', 'Tounsi', true, true, false, 850
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'ahmed.tounsi');

INSERT INTO users (username, password, email, role, first_name, last_name, password_changed, active, deleted, performance_score)
SELECT 'sara.benali', '$2a$10$t8kF4qL7pMqN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3', 'sara.benali@wifakbank.com', 'EMPLOYEE', 'Sara', 'Ben Ali', true, true, false, 1100
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'sara.benali');

INSERT INTO users (username, password, email, role, first_name, last_name, password_changed, active, deleted, performance_score)
SELECT 'karim.mansour', '$2a$10$t8kF4qL7pMqN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3', 'karim.mansour@wifakbank.com', 'EMPLOYEE', 'Karim', 'Mansour', true, true, false, 950
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'karim.mansour');

INSERT INTO users (username, password, email, role, first_name, last_name, password_changed, active, deleted, performance_score)
SELECT 'asma.trabelsi', '$2a$10$t8kF4qL7pMqN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3qN3', 'asma.trabelsi@wifakbank.com', 'EMPLOYEE', 'Asma', 'Trabelsi', true, true, false, 1050
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'asma.trabelsi');

-- Ajout des profils employés associés
-- [obsolete] INSERT INTO employees (name, email, phone, department, user_id, performance_score)
-- [obsolete] SELECT 'Ahmed Tounsi', 'ahmed.tounsi@wifakbank.com', '21111222', 'Direction Commerciale', (SELECT id FROM users WHERE username = 'ahmed.tounsi'), 850
-- [obsolete] WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'ahmed.tounsi@wifakbank.com');

-- [obsolete] INSERT INTO employees (name, email, phone, department, user_id, performance_score)
-- [obsolete] SELECT 'Sara Ben Ali', 'sara.benali@wifakbank.com', '22333444', 'Direction des Ressources Humaines', (SELECT id FROM users WHERE username = 'sara.benali'), 1100
-- [obsolete] WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'sara.benali@wifakbank.com');

-- [obsolete] INSERT INTO employees (name, email, phone, department, user_id, performance_score)
-- [obsolete] SELECT 'Karim Mansour', 'karim.mansour@wifakbank.com', '23555666', 'Direction des Systèmes d''Information', (SELECT id FROM users WHERE username = 'karim.mansour'), 950
-- [obsolete] WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'karim.mansour@wifakbank.com');

-- [obsolete] INSERT INTO employees (name, email, phone, department, user_id, performance_score)
-- [obsolete] SELECT 'Asma Trabelsi', 'asma.trabelsi@wifakbank.com', '24777888', 'Direction Marketing et Digital', (SELECT id FROM users WHERE username = 'asma.trabelsi'), 1050
-- [obsolete] WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'asma.trabelsi@wifakbank.com');
