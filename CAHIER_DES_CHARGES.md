# Cahier des charges - Système RH Wifak Bank

## 1. Contexte
Ce projet est un système de gestion des ressources humaines pour Wifak Bank, développé en backend Java/Spring Boot et frontend Angular. L'application couvre les fonctions RH essentielles : recrutement, gestion des utilisateurs, événements, annonces et suivi des candidats.

## 2. Objectif
Offrir une plateforme centralisée pour :
- gérer les candidats et leurs candidatures,
- administrer les comptes RH et administrateurs,
- publier des annonces et événements,
- suivre les formations, congés, salaires et performances,
- offrir un accès sécurisé par rôle.

## 3. Périmètre
### 3.1. Technologies
- Backend : Spring Boot 3.2.5, Java 17, Maven
- Frontend : Angular 20.3.10
- Base de données : PostgreSQL (driver présent)
- Authentification : JWT, Spring Security
- Envoi d'emails : Spring Boot Mail

### 3.2. Modules identifiés
- Authentification / gestion des sessions
- Gestion des utilisateurs et rôles
- Gestion des candidats
- Gestion des annonces
- Gestion des événements
- Gestion des postes et départements
- Gestion des congés
- Gestion des formations
- Gestion de la performance et des évaluations
- Gestion des salaires
- Gestion des points de participation
- Messagerie ou chat interne

## 4. Acteurs
- **Administrateur** : superviseur global, gestion des comptes, suppression d'utilisateurs et administration du portail.
- **Responsable RH** : gestion du recrutement, des événements, des formations et suivi des candidats.
- **Candidat** : crée un compte, consulte les offres, postule et suit ses candidatures.

## 5. Exigences fonctionnelles
### 5.1. Authentification et sécurité
- Connexion via nom d'utilisateur ou email + mot de passe.
- Génération et renouvellement de JWT.
- Enregistrement des candidats avec confirmation par email.
- Création de comptes RH par les administrateurs avec mot de passe temporaire envoyé par email.
- Changement et réinitialisation de mot de passe.
- Gestion des rôles : ADMIN, HR, CANDIDATE.

### 5.2. Gestion des utilisateurs
- Liste des utilisateurs accessibles aux admins.
- Création de responsables RH.
- Suppression d'utilisateurs.
- Affichage des rôles sur l'interface.

### 5.3. Gestion des candidats
- Consultation de la liste des candidatures.
- Enregistrement des candidatures avec CV et données de contact.
- Envoi d'un email de confirmation de candidature.

### 5.4. Annonces et événements
- Publication, récupération et suppression d'annonces.
- Publication, mise à jour, récupération et suppression d'événements.
- Consultation des annonces et événements par les candidats.

### 5.5. Gestion des emplois et départements
- Gestion des postes de travail.
- Gestion des départements.
- Association des employés et responsables aux départements.

### 5.6. Gestion des formations et congés
- Création et suivi des formations.
- Inscription aux formations.
- Gestion des demandes de congés.
- Validation ou refus des congés selon rôle.

### 5.7. Gestion des performances
- Suivi des performances.
- Enregistrement des évaluations.
- Notifications ou actions basées sur la performance.

### 5.8. Salaire et participation
- Consultation et gestion des données de salaire.
- Gestion des points et participation des employés ou candidats.

### 5.9. Communication interne
- Fonctionnalité de chat pour les échanges entre utilisateurs.
- Historique des messages.

## 6. Exigences non fonctionnelles
- Interface responsive et adaptée aux profils.
- API REST JSON.
- Sécurité des données et des endpoints.
- Journalisation des erreurs côté backend.
- Utilisation d’une base PostgreSQL.
- Support de CORS (pour le frontend Angular).
- Temps de réponse raisonnable (< 1s pour les actions CRUD simples).

## 7. Contraintes techniques
- Stockage des mots de passe chiffrés.
- JWT stocké côté client et renouvellement via endpoint `/api/auth/refresh`.
- Envoi d'emails opérationnel pour : inscription, ajout RH, candidature, réinitialisation de mot de passe.
- Architecture modulaire basée sur contrôleurs Spring Boot.
- Frontend généré via Angular CLI.

## 8. Scénarios utilisateurs principaux
### SC01 - Candidat
- S'inscrire sur le portail.
- Se connecter.
- Consulter les annonces et événements.
- Postuler à une offre.
- Recevoir un email de confirmation de candidature.

### SC02 - Responsable RH
- Se connecter.
- Consulter la liste des candidats.
- Créer des offres ou événements.
- Suivre les participants et les formations.
- Gérer les demandes de congés.

### SC03 - Administrateur
- Se connecter.
- Gérer les comptes utilisateurs.
- Ajouter/supprimer des responsables RH.
- Consulter les statistiques globales.

## 9. Livraison attendue
- Application backend packagée en `jar`.
- Frontend Angular buildable avec `ng build`.
- Documentation de l’API si possible.
- Guide d’installation local avec configuration PostgreSQL.

## 10. Architecture base de données (RESTRUCTURÉE - Juin 2026)

### ✅ Changements effectués
- **Création de la table `roles`** : gestion centralisée des rôles (ADMIN, HR, EMPLOYEE, CANDIDATE, TRAINER).
- **Enrichissement de `users`** : 
  - Ajout de relation ManyToOne vers RoleEntity
  - Ajout du champ `performance_score` (anciennement dans Employee)
  - Ajout des timestamps `created_at` et `updated_at`
- **Migration de toutes les références** :
  - `leaves.employee_id` → `leaves.user_id`
  - `point_logs.employee_id` → `point_logs.user_id`
  - `participations.employee_id` → `participations.user_id`
  - `training_registrations.employee_id` → `training_registrations.user_id`
  - `evaluations.employee_id` → `evaluations.user_id`
  - `salaries.employee_id` → `salaries.user_id`
- **Élimination de la redondance** : table `employees` marquée pour suppression progressive.
- **Intégrité garantie** : clés étrangères cascadées et indices créés.

### Principales tables
- **roles** : ADMIN, HR, EMPLOYEE, CANDIDATE, TRAINER
- **users** : utilisateurs centralisés avec FK vers roles
- **leaves** : congés (user_id)
- **point_logs** : historique des points (user_id)
- **participations** : participations aux événements (user_id)
- **training_registrations** : enregistrements aux formations (user_id)
- **evaluations** : évaluations (user_id + evaluator_id)
- **salaries** : salaires (user_id)
- ~~**employees**~~ : DÉPRÉCIÉE (données migrées vers users)

## 11. Recommandations d'amélioration
- Renforcer la sécurité des cookies JWT (`HttpOnly`, `Secure`).
- Ajouter des tests unitaires et d'intégration.
- Mettre en place une gestion des erreurs plus structurée côté backend.
- Compléter la documentation métier pour les modules RH.
- Prévoir une évolution vers un déploiement Docker ou Kubernetes.
- Finaliser la suppression de la table employees après tests complets.

---

**Dernière mise à jour** : Juin 2026 - Restructuration complète de la base de données avec centralisation des utilisateurs et gestion des rôles via table relationnelle.