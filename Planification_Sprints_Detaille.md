# Planification Détaillée des Sprints — Système de Gestion RH (Wifak Bank)

Ce document présente le découpage et le contenu détaillé de chaque **Sprint** du projet de gestion des ressources humaines de **Wifak Bank**, conformément au cycle de développement agile **Scrum**.

---

## 🚀 Sprint 1 : Socle Technique, Authentification & Gouvernance (Admin & Candidat)

* **Durée** : 3 semaines (Semaines 1 à 3)
* **Objectif du Sprint** : Mettre en place l'architecture applicative globale (Spring Boot & Angular), le système de sécurité JWT, l'inscription directe des candidats et les fonctionnalités d'administration CRUD (comptes utilisateurs et départements).

### 📋 Sprint Backlog — Sprint 1

| Code US | Rôle | User Story | Priorité |
| :--- | :--- | :--- | :--- |
| **US1.1** | Tous | Authentification sécurisée par identifiant/email et mot de passe avec génération de token JWT. | Haute |
| **US1.2** | Candidat | Inscription directe et autonome des candidats avec dépôt de CV au format PDF et confirmation par email. | Haute |
| **US1.3** | Tous | Procédure de réinitialisation de mot de passe par email en cas d'oubli via mot de passe temporaire. | Haute |
| **US1.4** | Directeur RH | Modification obligatoire du mot de passe temporaire à la première connexion du Directeur RH. | Haute |
| **US2.1** | Admin | **Création, modification et suppression (CRUD)** des comptes utilisateurs (Admin, DRH, Employé, Candidat). | Haute |
| **US2.2** | Admin | Ajout d'un compte Directeur RH par l'Admin avec envoi automatique des identifiants par email. | Haute |
| **US2.3** | Admin | Activation, suspension et blocage des accès des comptes utilisateurs. | Haute |
| **US3.1** | Admin | **Création, modification et suppression (CRUD)** des départements de Wifak Bank et désignation du chef de département. | Haute |
| **US4.1** | Tous | Consultation et mise à jour du profil utilisateur (nom, prénom, contact, avatar). | Haute |
| **US4.2** | Candidat | Gestion des compétences, formations, diplômes et mise à jour du fichier CV PDF. | Haute |

### 🛠️ Tâches Techniques & Livrables du Sprint 1
1. **Backend** : Configuration du projet Spring Boot, Security & JWT, entités JPA (`User`, `Role`, `Department`), Repositories et Services.
2. **Frontend** : Layouts dédiés (`AdminLayoutComponent`, `Layout`), Gardiens de routes (`authGuard`, `roleGuard`), formulaires d'authentification et d'inscription.
3. **Livrable** : Module d'authentification opérationnel, console de gouvernance Admin et espace candidat fonctionnels.

---

## 📅 Sprint 2 : Gestion des Congés & Événements Internes (Directeur RH & Employé)

* **Durée** : 3 semaines (Semaines 4 à 6)
* **Objectif du Sprint** : Implémenter la gestion dématérialisée des congés avec système de notifications emails SMTP et développer le module d'organisation des événements internes géré par le Directeur RH.

### 📋 Sprint Backlog — Sprint 2

| Code US | Rôle | User Story | Priorité |
| :--- | :--- | :--- | :--- |
| **US5.1** | Employé | Soumission d'une demande de congé (dates de début/fin, motif, type) avec accusé de réception automatique par email. | Haute |
| **US5.2** | Employé | Consultation du statut (En attente, Validé, Refusé) et de l'historique des demandes de congé personnelles. | Haute |
| **US5.3** | Directeur RH | Consultation du tableau de bord des congés, **validation ou refus** des demandes avec notification email au collaborateur. | Haute |
| **US8.1** | Directeur RH | **Création, modification et planification des événements internes** (séminaires, hackathons, team building). | Moyenne |
| **US8.2** | Employé / Cand. | Consultation de l'agenda des événements internes et marquage de participation. | Moyenne |

### 🛠️ Tâches Techniques & Livrables du Sprint 2
1. **Backend** : Entités `Leave`, `Event`, `Participation`, contrôleurs `LeaveController`, `EventController` et service d'envoi d'emails JavaMailSender.
2. **Frontend** : Interfaces de demande de congé pour l'employé, console de gestion des congés pour le DRH et composant `Events` réservé au DRH pour l'administration.
3. **Livrable** : Module de congés fonctionnel de bout en bout et module événementiel opérationnel.

---

## 💼 Sprint 3 : Recrutement, Candidatures & Formations (Directeur RH & Collaborateurs)

* **Durée** : 4 semaines (Semaines 7 à 10)
* **Objectif du Sprint** : Développer le portail de recrutement externe (offres et suivi des candidats) et le système d'inscription/validation des formations du personnel.

### 📋 Sprint Backlog — Sprint 3

| Code US | Rôle | User Story | Priorité |
| :--- | :--- | :--- | :--- |
| **US6.1** | Directeur RH | Création, modification, publication et clôture des offres d'emploi de Wifak Bank. | Haute |
| **US6.2** | Candidat | Consultation et recherche des opportunités de carrière sur la plateforme. | Haute |
| **US6.3** | Candidat | Postulation en ligne à une offre d'emploi avec envoi automatique du dossier au service RH. | Haute |
| **US6.4** | Directeur RH | Consultation des candidatures reçues, examen des CVs via le visionneur PDF intégré et mise à jour de l'état du dossier. | Haute |
| **US7.1** | Directeur RH | Organisation des programmes de formation (titre, dates, formateur, capacité) et gestion des inscriptions. | Haute |
| **US7.2** | Employé | Inscription aux sessions de formation proposées dans le catalogue interne. | Haute |
| **US7.3** | Directeur RH | Validation des inscriptions aux formations avec confirmation automatique par email aux employés. | Haute |

### 🛠️ Tâches Techniques & Livrables du Sprint 3
1. **Backend** : Entités `JobOffer`, `Application`, `Training`, `TrainingRegistration`, visionneuse de fichiers CV et logiques de filtres.
2. **Frontend** : Espace carrières, composant `CvViewer`, tableau de suivi des candidatures pour le DRH et catalogue de formations.
3. **Livrable** : Module de recrutement et gestion des formations prêt pour la production.

---

## 🏆 Sprint 4 : Gamification, Chatbot IA & Tableaux de Bord (Tous Rôles)

* **Durée** : 4 semaines (Semaines 11 à 14)
* **Objectif du Sprint** : Intégrer le système d'évaluation et de points de performance, le Chatbot IA Wifak RH et finaliser les tableaux de bord analytiques adaptés à chaque profil d'utilisateur.

### 📋 Sprint Backlog — Sprint 4

| Code US | Rôle | User Story | Priorité |
| :--- | :--- | :--- | :--- |
| **US9.1** | Directeur RH | Évaluation des collaborateurs et attribution de points de performance (+/-) avec motif explicatif. | Haute |
| **US9.2** | Employé | Consultation du solde de points, de l'historique et du classement des employés les plus engagés (Leaderboard). | Haute |
| **US10.1** | Employé / DRH | Interaction avec le Chatbot IA RH pour obtenir des réponses instantanées sur les procédures et avantages de Wifak Bank. | Haute |
| **US10.2** | Tous | Envoi de notifications emails pour toutes les interactions clés du système. | Haute |
| **US11.1** | Admin | Tableau de bord analytique de gouvernance (statistiques utilisateurs, départements, rôles, activités récents). | Haute |
| **US11.2** | Directeur RH | Tableau de bord synthétique RH (KPI congés, recrutements, candidatures, formations, événements). | Haute |
| **US11.3** | Employé | Tableau de bord personnel réunissant congés, points, événements et formations. | Moyenne |
| **US11.4** | Candidat | Espace candidat synthétique réunissant postulations et profil. | Moyenne |

### 🛠️ Tâches Techniques & Livrables du Sprint 4
1. **Backend** : Services de gamification (`PerformanceService`), endpoints pour le Chatbot IA et contrôleurs de statistiques synthétiques (`AdminService`).
2. **Frontend** : Composant `Chatbot`, cartes de statistiques dynamiques, graphiques de répartition par rôle et tableaux de bords finaux.
3. **Livrable** : Application complète, testée, validée et prête pour le déploiement et le rapport de PFE.
