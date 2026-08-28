-- Migration de la base de données RH System
-- Cette migration restructure la base de données pour une meilleure gestion des rôles et éliminer la redondance des données

-- 1. Créer la table roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- 2. Ajouter les rôles de base
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Administrateur système'),
('HR', 'Responsable Ressources Humaines'),
('EMPLOYEE', 'Employé'),
('CANDIDATE', 'Candidat'),
('TRAINER', 'Formateur')
ON CONFLICT (name) DO NOTHING;

-- 3. Mettre à jour la table users pour ajouter la colonne role_id et les nouvelles colonnes
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id BIGINT REFERENCES roles(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS performance_score INTEGER DEFAULT 1000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Migrer les rôles existants d'Employee vers Users s'ils existent
UPDATE users u
SET role_id = (SELECT id FROM roles WHERE name = 'EMPLOYEE')
WHERE u.role = 'EMPLOYEE' AND u.role_id IS NULL;

UPDATE users u
SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
WHERE u.role = 'ADMIN' AND u.role_id IS NULL;

UPDATE users u
SET role_id = (SELECT id FROM roles WHERE name = 'HR')
WHERE u.role = 'HR' AND u.role_id IS NULL;

UPDATE users u
SET role_id = (SELECT id FROM roles WHERE name = 'CANDIDATE')
WHERE u.role = 'CANDIDATE' AND u.role_id IS NULL;

-- 5. Mettre à jour les clés étrangères des tables dépendantes
-- Changer employee_id en user_id pour leaves
ALTER TABLE leaves DROP CONSTRAINT IF EXISTS leaves_employee_id_fkey;
ALTER TABLE leaves RENAME COLUMN employee_id TO user_id;
ALTER TABLE leaves ADD CONSTRAINT leaves_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Changer employee_id en user_id pour point_logs
ALTER TABLE point_logs DROP CONSTRAINT IF EXISTS point_logs_employee_id_fkey;
ALTER TABLE point_logs RENAME COLUMN employee_id TO user_id;
ALTER TABLE point_logs ADD CONSTRAINT point_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Changer employee_id en user_id pour participations
ALTER TABLE participations DROP CONSTRAINT IF EXISTS participations_employee_id_fkey;
ALTER TABLE participations RENAME COLUMN employee_id TO user_id;
ALTER TABLE participations ADD CONSTRAINT participations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Changer employee_id en user_id pour training_registrations
ALTER TABLE training_registrations DROP CONSTRAINT IF EXISTS training_registrations_employee_id_fkey;
ALTER TABLE training_registrations RENAME COLUMN employee_id TO user_id;
ALTER TABLE training_registrations ADD CONSTRAINT training_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Changer employee_id en user_id pour evaluations
ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_employee_id_fkey;
ALTER TABLE evaluations RENAME COLUMN employee_id TO user_id;
ALTER TABLE evaluations ADD CONSTRAINT evaluations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Changer employee_id en user_id pour salaries
ALTER TABLE salaries DROP CONSTRAINT IF EXISTS salaries_employee_id_fkey;
ALTER TABLE salaries RENAME COLUMN employee_id TO user_id;
ALTER TABLE salaries ADD CONSTRAINT salaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 6. Migrer les données des performances depuis Employee vers Users
UPDATE users u
SET performance_score = e.performance_score
FROM employees e
WHERE e.user_id = u.id
AND u.performance_score = 1000; -- Seulement si performance_score n'a pas déjà été mis à jour

-- 7. Supprimer l'ancienne table employees (si vous êtes sûr)
-- DROP TABLE IF EXISTS employees CASCADE;

-- 8. Créer un index sur les colonnes fréquemment interrogées
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_leaves_user_id ON leaves(user_id);
CREATE INDEX IF NOT EXISTS idx_point_logs_user_id ON point_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_participations_user_id ON participations(user_id);
CREATE INDEX IF NOT EXISTS idx_training_registrations_user_id ON training_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_salaries_user_id ON salaries(user_id);

-- Migration terminée
COMMIT;
