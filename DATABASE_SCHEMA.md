# Architecture Base de Données - Système RH Wifak Bank

## 📊 Vue d'ensemble

Le système RH utilise une architecture relationnelle propre et normalisée avec PostgreSQL. Les utilisateurs sont centralisés dans la table `users` avec une gestion des rôles via la table `roles`.

---

## 🔗 Diagramme Entité-Relation (ERD)

```
┌─────────────────┐
│     roles       │
├─────────────────┤
│ id (PK)         │
│ name (UNIQUE)   │
│ description     │
└────────┬────────┘
         │ (1:N)
         │
    ┌────▼─────────────────────┐
    │       users             │
    ├─────────────────────────┤
    │ id (PK)                 │
    │ username (UNIQUE)       │
    │ email (UNIQUE)          │
    │ password                │
    │ phone (UNIQUE)          │
    │ firstName               │
    │ lastName                │
    │ department              │
    │ profileImage            │
    │ performanceScore        │
    │ passwordChanged         │
    │ role_id (FK → roles)    │
    │ created_at              │
    │ updated_at              │
    └────┬──────┬──────┬──────┬──────┬────────┬─────────┘
         │      │      │      │      │        │
    ┌────▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌──▼──┐ ┌─────▼──┐
    │leaves │ │point│ │part│ │trai│ │eval│ │sala│ │announce│
    │       │ │logs │ │ipal│ │ning│ │uat│ │ries│ │ments   │
    │       │ │     │ │    │ │reg │ │ion│ │    │ │        │
    └───────┘ └─────┘ └────┘ └────┘ └────┘ └────┘ └────────┘
```

---

## 📋 Description des tables

### 1. **roles** - Gestion des rôles
```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);
```

**Rôles disponibles** :
- `ADMIN` : Administrateur système
- `HR` : Responsable RH
- `EMPLOYEE` : Employé
- `CANDIDATE` : Candidat
- `TRAINER` : Formateur

---

### 2. **users** - Utilisateurs centralisés
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    department VARCHAR(255),
    profileImage VARCHAR(255),
    performanceScore INTEGER DEFAULT 1000,
    passwordChanged BOOLEAN DEFAULT false,
    role VARCHAR(50),  -- Legacy (deprecated)
    role_id BIGINT REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

**Champs clés** :
- `performanceScore` : Score de performance de l'utilisateur (anciennement dans Employee)
- `role_id` : Relation vers la table roles
- `role` : Énumération legacy (sera progressivement retiré)
- `created_at` / `updated_at` : Audit trails

---

### 3. **leaves** - Gestion des congés
```sql
CREATE TABLE leaves (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    startDate VARCHAR(255),
    endDate VARCHAR(255),
    reason VARCHAR(255),
    leaveType VARCHAR(255),
    status VARCHAR(50)  -- PENDING, APPROVED, REJECTED
);

CREATE INDEX idx_leaves_user_id ON leaves(user_id);
```

**Relation** : `leaves.user_id` → `users.id` (N:1)

---

### 4. **point_logs** - Historique des points
```sql
CREATE TABLE point_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pointsChanged INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL
);

CREATE INDEX idx_point_logs_user_id ON point_logs(user_id);
```

**Relation** : `point_logs.user_id` → `users.id` (N:1)

---

### 5. **participations** - Participation aux événements
```sql
CREATE TABLE participations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id BIGINT REFERENCES events(id),
    registrationDate TIMESTAMP
);

CREATE INDEX idx_participations_user_id ON participations(user_id);
```

**Relations** :
- `participations.user_id` → `users.id` (N:1)
- `participations.event_id` → `events.id` (N:1)

---

### 6. **training_registrations** - Enregistrements aux formations
```sql
CREATE TABLE training_registrations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_id BIGINT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    status VARCHAR(50),  -- PENDING, APPROVED, REJECTED
    registrationDate TIMESTAMP NOT NULL
);

CREATE INDEX idx_training_registrations_user_id ON training_registrations(user_id);
```

**Relations** :
- `training_registrations.user_id` → `users.id` (N:1)
- `training_registrations.training_id` → `trainings.id` (N:1)

---

### 7. **evaluations** - Évaluations des utilisateurs
```sql
CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    feedback VARCHAR(255) NOT NULL,
    strengthPoints VARCHAR(255),
    improvementAreas VARCHAR(255),
    evaluationDate VARCHAR(255),
    evaluator_id BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);
```

**Relations** :
- `evaluations.user_id` → `users.id` (N:1) [personne évaluée]
- `evaluations.evaluator_id` → `users.id` (N:1) [évaluateur]

---

### 8. **salaries** - Gestion des salaires
```sql
CREATE TABLE salaries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    baseAmount NUMERIC NOT NULL,
    bonusAmount NUMERIC DEFAULT 0,
    deductions NUMERIC DEFAULT 0,
    month VARCHAR(50),
    year VARCHAR(50),
    paymentDate TIMESTAMP
);

CREATE INDEX idx_salaries_user_id ON salaries(user_id);
```

**Relation** : `salaries.user_id` → `users.id` (N:1)

---

### 9. **candidates** - Candidatures
```sql
CREATE TABLE candidates (
    id BIGSERIAL PRIMARY KEY,
    fullName VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(15),
    cvUrl VARCHAR(255),
    jobPosition_id BIGINT REFERENCES jobpositions(id)
);
```

---

### 10. **announcements** - Annonces
```sql
CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 11. **events** - Événements
```sql
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    date VARCHAR(255),
    location VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 12. **jobpositions** - Postes de travail
```sql
CREATE TABLE jobpositions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(255)
);
```

---

### 13. **departments** - Départements
```sql
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);
```

---

### 14. **trainings** - Formations
```sql
CREATE TABLE trainings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    startDate VARCHAR(255),
    endDate VARCHAR(255),
    trainer_id BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_trainings_trainer_id ON trainings(trainer_id);
```

---

## 🔄 Migrer de Employee vers Users

### Entités dépréciées

La table `employees` est conservée pour compatibilité mais est progressivement remplacée par `users` :

```java
// ANCIEN CODE (deprecated)
Optional<Employee> emp = employeeRepository.findByUserId(userId);
leave.setEmployee(emp.get());

// NOUVEAU CODE (à utiliser)
User user = userRepository.findById(userId).orElseThrow();
leave.setUser(user);
```

---

## 🔐 Sécurité et Contraintes

### Contraintes d'intégrité
- ✅ Clés primaires sur tous les IDs
- ✅ Clés étrangères avec `ON DELETE CASCADE` pour les données enfants
- ✅ Contraintes UNIQUE sur `email`, `username`, `phone`
- ✅ Contraintes CHECK sur les scores (1-5) et montants (≥0)
- ✅ NOT NULL sur les colonnes obligatoires

### Indices de performance
- ✅ Index sur toutes les clés étrangères
- ✅ Index sur `email`, `username`, `role_id`
- ✅ Index sur les colonnes de recherche fréquente

---

## 📈 Requêtes courantes

### Récupérer un utilisateur avec son rôle
```sql
SELECT u.*, r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.id = 1;
```

### Compter les utilisateurs par rôle
```sql
SELECT r.name, COUNT(u.id) as count
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.name;
```

### Récupérer les congés d'un utilisateur
```sql
SELECT l.* FROM leaves l
WHERE l.user_id = 5
ORDER BY l.startDate DESC;
```

### Récupérer les formations d'un utilisateur
```sql
SELECT t.title, tr.status, tr.registrationDate
FROM training_registrations tr
JOIN trainings t ON tr.training_id = t.id
WHERE tr.user_id = 5
ORDER BY tr.registrationDate DESC;
```

### Utilisateurs avec meilleur score de performance
```sql
SELECT id, username, performanceScore
FROM users
WHERE performanceScore > 900
ORDER BY performanceScore DESC
LIMIT 10;
```

---

## 📝 Scripts de maintenance

### Backup
```bash
pg_dump -U postgres rh_system > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql -U postgres rh_system < backup_20260606.sql
```

### Vérifier l'intégrité
```sql
-- Identifier les utilisateurs sans rôle
SELECT * FROM users WHERE role_id IS NULL;

-- Identifier les enregistrements orphelins
SELECT * FROM leaves WHERE user_id NOT IN (SELECT id FROM users);
```

---

## 🚀 Performance

**Approche optimisée** :
1. Relations bien définies (N:1) plutôt que tables plate-jointe
2. Indices créés sur les colonnes clés
3. Dénormalisation minimale (performanceScore dans users)
4. Audit trails (created_at, updated_at) pour traçabilité

**Benchmark prévu** : < 50ms pour une requête complexe avec 3+ jointures

---

## 📚 Fichiers liés

- **Script de migration** : `DATABASE_MIGRATION.sql`
- **Guide de migration complet** : `MIGRATION_GUIDE.md`
- **Cahier des charges** : `CAHIER_DES_CHARGES.md`

---

**Version** : 1.0  
**Dernière mise à jour** : Juin 2026  
**Statut** : Prêt pour production ✅
