# Backlog Produit & Planification des Sprints — Wifak Bank RH

Dans le cadre de la méthodologie agile **Scrum** adoptée pour le système de gestion des ressources humaines de **Wifak Bank**, le backlog produit regroupe l'ensemble des besoins fonctionnels sous forme de **User Stories**. Chaque besoin est attribué à un acteur, priorisé et associé à son **Sprint**.

---

## 1. Tableau du Backlog Produit Réparti

| Épopée (Epic) | ID US | Acteur | User Story | Priorité | Sprint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Authentification & Sécurité** | US1.1 | Tous | En tant qu’utilisateur, je veux m’authentifier et accéder à mon tableau de bord spécifique selon mon rôle (Admin, DRH, Employé, Candidat). | Haute | **Sprint 1** |
| | US1.2 | Candidat | En tant que candidat, je veux créer mon compte directement via un formulaire d'inscription avec import de mon CV PDF. | Haute | **Sprint 1** |
| | US1.3 | Tous | En tant qu'utilisateur, je veux réinitialiser mon mot de passe par email en cas d'oubli. | Haute | **Sprint 1** |
| | US1.4 | DRH | En tant que Directeur RH, je veux changer mon mot de passe temporaire dès ma première connexion. | Haute | **Sprint 1** |
| **2. Gouvernance Utilisateurs** | US2.1 | Admin | En tant qu’administrateur, je veux **créer, modifier et supprimer** les comptes utilisateurs (Admin, DRH, Employé, Candidat). | Haute | **Sprint 1** |
| | US2.2 | Admin | En tant qu’administrateur, je veux ajouter un compte Directeur RH et lui envoyer ses identifiants par email. | Haute | **Sprint 1** |
| | US2.3 | Admin | En tant qu’administrateur, je veux pouvoir activer, bloquer ou suspendre l'accès d'un compte utilisateur. | Haute | **Sprint 1** |
| **3. Gestion Départements** | US3.1 | Admin | En tant qu’administrateur, je veux **créer, modifier et supprimer** les départements de la banque et désigner leur chef. | Haute | **Sprint 1** |
| **4. Profils & CV** | US4.1 | Tous | En tant qu’utilisateur, je veux modifier mes informations personnelles (nom, email, photo de profil). | Haute | **Sprint 1** |
| | US4.2 | Candidat | En tant que candidat, je veux gérer mes compétences, formations, expériences et importer mon CV PDF. | Haute | **Sprint 1** |
| **5. Gestion des Congés** | US5.1 | Employé | En tant qu'employé, je veux soumettre une demande de congé (dates, motif) et recevoir un accusé par email. | Haute | **Sprint 2** |
| | US5.2 | Employé | En tant qu'employé, je veux consulter l'historique et le statut de mes demandes de congé. | Haute | **Sprint 2** |
| | US5.3 | DRH | En tant que Directeur RH, je veux consulter, **valider ou refuser** les demandes de congé des employés avec alerte email. | Haute | **Sprint 2** |
| **6. Événements Internes** | US6.1 | DRH | En tant que Directeur RH, je veux **créer, modifier et planifier des événements internes** (séminaires, team building). | Moyenne | **Sprint 2** |
| | US6.2 | Employé | En tant qu'employé, je veux consulter les événements à venir et marquer ma participation. | Moyenne | **Sprint 2** |
| **7. Recrutement & Offres** | US7.1 | DRH | En tant que Directeur RH, je veux créer, modifier, publier et clôturer des offres d’emploi. | Haute | **Sprint 3** |
| | US7.2 | Candidat | En tant que candidat, je veux rechercher et consulter les offres d’emploi disponibles chez Wifak Bank. | Haute | **Sprint 3** |
| | US7.3 | Candidat | En tant que candidat, je veux postuler à une offre d'emploi en soumettant ma candidature et mon CV PDF. | Haute | **Sprint 3** |
| | US7.4 | DRH | En tant que Directeur RH, je veux consulter les candidatures reçues, consulter les CVs via le lecteur PDF et gérer les statuts. | Haute | **Sprint 3** |
| **8. Formations** | US8.1 | DRH | En tant que Directeur RH, je veux planifier des sessions de formation et fixer les capacités. | Haute | **Sprint 3** |
| | US8.2 | Employé | En tant qu'employé, je veux consulter le catalogue des formations et effectuer une demande d'inscription. | Haute | **Sprint 3** |
| | US8.3 | DRH | En tant que Directeur RH, je veux valider ou refuser les demandes d'inscription aux formations avec notification email. | Haute | **Sprint 3** |
| **9. Performance & Points** | US9.1 | DRH | En tant que Directeur RH, je veux attribuer des points de performance aux employés avec justification. | Haute | **Sprint 4** |
| | US9.2 | Employé | En tant qu'employé, je veux consulter mon solde de points et mon rang sur le classement (leaderboard). | Haute | **Sprint 4** |
| **10. Chatbot IA & Alertes** | US10.1 | Employé/DRH | En tant qu'utilisateur, je veux échanger avec le Chatbot IA Wifak RH pour obtenir des réponses rapides sur les procédures. | Haute | **Sprint 4** |
| | US10.2 | Tous | En tant qu'utilisateur, je veux recevoir des notifications par email pour toutes les actions système importantes. | Haute | **Sprint 4** |
| **11. Tableaux de Bord** | US11.1 | Admin | En tant qu’administrateur, je veux consulter un tableau de bord de gouvernance (statistiques utilisateurs, départements, rôles). | Haute | **Sprint 4** |
| | US11.2 | DRH | En tant que Directeur RH, je veux consulter un tableau de bord synthétique des KPI RH (congés, candidatures, formations). | Haute | **Sprint 4** |
| | US11.3 | Employé | En tant qu'employé, je veux consulter mon tableau de bord personnel (congés, points, formations, événements). | Moyenne | **Sprint 4** |
| | US11.4 | Candidat | En tant que candidat, je veux consulter mon espace dédié avec le suivi de mes postulations. | Moyenne | **Sprint 4** |

---

## 2. Synthèse de la Planification des Sprints

| Sprint | User Stories Incluses | Fonctionnalités & Objectif Métier | Durée Estimée |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | US1.1 → US4.2 | Socle technique, Authentification JWT, Inscription directe Candidat, Gouvernance Admin (Créer, Modifier, Supprimer les comptes et départements), Profils. | 3 semaines |
| **Sprint 2** | US5.1 → US6.2 | Module de gestion des congés (soumission employé, validation DRH, notifications email) et Module des Événements internes (création par le DRH). | 3 semaines |
| **Sprint 3** | US7.1 → US8.3 | Module de Recrutement (offres d'emploi, candidatures, postulation, lecteur de CV PDF) et Module de gestion des formations. | 4 semaines |
| **Sprint 4** | US9.1 → US11.4 | Gamification (points & classement), Intégration du Chatbot IA Wifak RH, Tableaux de bord analytiques par rôle et finalisation. | 4 semaines |
