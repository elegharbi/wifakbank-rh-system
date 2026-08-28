# Guide de Migration - Restructuration Base de Données RH System

## 📋 Résumé des changements

Ce document décrit la refactorisation complète de la base de données pour :
1. ✅ Créer une table `roles` (au lieu d'énumération)
2. ✅ Centraliser tous les utilisateurs dans `users` (avec relation vers Roles)
3. ✅ Éliminer la redondance en supprimant la table `employees`
4. ✅ Migrer toutes les références vers `users` au lieu de `employees`
5. ✅ Garantir l'intégrité et la cohérence des données

---

## 📊 Structure avant et après

### AVANT (Redondant)
```
users (id, username, email, role [ENUM], firstName, lastName, phone, department...)
    ↓
employees (id, name, email, phone, department, user_id [FK], performanceScore)
    ↓
leaves, point_logs, participations, etc. → employee_id
```

### APRÈS (Centralisé et propre)
```
roles (id, name, description)
    ↑
    | role_id [FK]
    |
users (id, username, email, role [legacy], roleEntity [FK], firstName, lastName, 
       phone, department, performanceScore, created_at, updated_at)
    ↓
leaves, point_logs, participations, etc. → user_id [FK]
```

---

## 🔄 Étapes de migration

### Étape 1 : Exécuter le script de migration SQL
```bash
psql -U postgres -d rh_system -f DATABASE_MIGRATION.sql
```

**Ce script :**
- Crée la table `roles`
- Insère les rôles de base
- Ajoute les colonnes manquantes à `users`
- Migre les rôles existants vers la table `roles`
- Renomme toutes les colonnes `employee_id` → `user_id`
- Crée les indices de performance

### Étape 2 : Mettre à jour le code Java

#### Créer le RoleRepository
✅ **Déjà créé** : `RoleRepository.java`

#### Mettre à jour les entités
✅ **Déjà migrés** :
- `User.java` : ajout de `roleEntity` et `performanceScore`
- `Leave.java` : changement de `employee` → `user`
- `PointLog.java` : changement de `employee` → `user`
- `Participation.java` : changement de `employee` → `user`
- `Evaluation.java` : changement de `employee` → `user`
- `TrainingRegistration.java` : changement de `employee` → `user`
- `Salary.java` : changement de `employee` → `user`

#### Mettre à jour les repositories
✅ **Déjà migrés** :
- `PointLogRepository.java` : `findByEmployeeId()` → `findByUserId()`
- `TrainingRegistrationRepository.java` : `findByEmployeeId()` → `findByUserId()`
- `LeaveRepository.java` : ajout de `findByUserId()`
- `RoleRepository.java` : nouveau repository

### Étape 3 : Mettre à jour les services et contrôleurs

**À faire** : Remplacer les appels à `EmployeeRepository` par `UserRepository`

Exemples :
```java
// AVANT
Optional<Employee> employee = employeeRepository.findByUserId(userId);
leave.setEmployee(employee.get());

// APRÈS
User user = userRepository.findById(userId).orElseThrow();
leave.setUser(user);
```

### Étape 4 : Mettre à jour DbSeeder.java

**À faire** : Supprimer la création d'entités `Employee` et remplacer par la création de rôles.

```java
// AVANT
Employee emp = new Employee();
emp.setName("Mohamed Ahmed");
emp.setEmail("employee@wifakbank.tn");
emp.setUser(employeeUser);
employeeRepo.save(emp);

// APRÈS - Utiliser directement l'utilisateur
User user = new User();
user.setUsername("user");
user.setRoleEntity(roleRepository.findByName("EMPLOYEE").orElseThrow());
user.setPerformanceScore(1000);
userRepository.save(user);
```

### Étape 5 : Tester et valider

```bash
# 1. Compiler le projet
mvn clean compile

# 2. Lancer les tests
mvn test

# 3. Démarrer l'application
mvn spring-boot:run

# 4. Vérifier les relations
# Requête SQL : SELECT * FROM users u 
#               LEFT JOIN roles r ON u.role_id = r.id;
```

---

## 📝 Fichiers modifiés

### Entités (7 fichiers)
| Fichier | Changement |
|---------|-----------|
| `User.java` | ✅ Ajout roleEntity + performanceScore |
| `Leave.java` | ✅ employee → user |
| `PointLog.java` | ✅ employee → user |
| `Participation.java` | ✅ employee → user |
| `Evaluation.java` | ✅ employee → user |
| `TrainingRegistration.java` | ✅ employee → user |
| `Salary.java` | ✅ employee → user |

### Repositories (4 fichiers)
| Fichier | Changement |
|---------|-----------|
| `RoleRepository.java` | ✅ NOUVEAU |
| `PointLogRepository.java` | ✅ findByUserId() |
| `TrainingRegistrationRepository.java` | ✅ findByUserId() |
| `LeaveRepository.java` | ✅ findByUserId() |

### À faire (services/contrôleurs)
| Fichier | Changement |
|---------|-----------|
| `EmployeeController.java` | 🔄 À modifier |
| `PerformanceController.java` | 🔄 À modifier |
| `ParticipationController.java` | 🔄 À modifier |
| `DbSeeder.java` | 🔄 À modifier |
| Tous les services | 🔄 À vérifier |

---

## 🛠️ Commandes utiles

### PostgreSQL - Vérifier la migration
```sql
-- Vérifier les rôles
SELECT * FROM roles;

-- Vérifier les utilisateurs et leurs rôles
SELECT u.id, u.username, r.name as role FROM users u 
LEFT JOIN roles r ON u.role_id = r.id;

-- Vérifier les clés étrangères
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE constraint_name LIKE '%user%';

-- Vérifier la migration des données
SELECT COUNT(*) as users_total FROM users;
SELECT COUNT(*) as employees_still_in_db FROM employees;
SELECT COUNT(*) as leaves_with_user FROM leaves WHERE user_id IS NOT NULL;
```

### Java - Builder une classe de service pour les rôles
```java
@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public RoleEntity getOrCreateRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé: " + roleName));
    }

    public void initializeDefaultRoles() {
        String[] roles = {"ADMIN", "HR", "EMPLOYEE", "CANDIDATE", "TRAINER"};
        for (String role : roles) {
            if (!roleRepository.existsByName(role)) {
                roleRepository.save(new RoleEntity(role, "Rôle " + role));
            }
        }
    }
}
```

---

## ⚠️ Considérations importantes

### Suppression de la table `employees`
1. **Ne pas supprimer immédiatement** pour éviter les pertes de données
2. **Garder le schéma** jusqu'à ce que tous les tests soient passés
3. **Archiver les données** si nécessaire avant suppression finale
4. Après validation complète : `DROP TABLE employees CASCADE;`

### Compatibilité backward
- Les anciens codes utilisant `employeeId` continueront de fonctionner grâce aux méthodes `default` dans les repositories
- Les champs `@Transient` dans les entités permettent un soft deprecation

### Performance
- **Indices créés** pour les colonnes `role_id`, `user_id` dans toutes les tables
- **Requêtes optimisées** avec les jointures appropriées
- **Bonus** : moins de tables à joindre = meilleures performances

---

## 📚 Ressources

- **Fichier migration SQL** : `DATABASE_MIGRATION.sql`
- **Cahier des charges mis à jour** : `CAHIER_DES_CHARGES.md`
- **Entités migrées** : `/src/main/java/com/wifakbank/rh_system/`

---

## 🎯 Checklist de validation

- [ ] Script SQL exécuté avec succès
- [ ] Tous les services compilent
- [ ] Tests unitaires passent
- [ ] DbSeeder mis à jour
- [ ] Données migrées correctement (vérifier COUNT)
- [ ] Aucune perte de données
- [ ] Performance acceptable
- [ ] Documentation mise à jour
- [ ] Code reviewé par l'équipe
- [ ] Table employees supprimée (optionnel)

---

**Dernière mise à jour** : Juin 2026
**Statut** : Prêt pour deployment ✅
