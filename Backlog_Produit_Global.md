# Backlog Produit Global — Système de Gestion RH (Wifak Bank)

Dans le cadre de la méthodologie agile **Scrum**, le Backlog Produit regroupe l'ensemble des besoins fonctionnels du système exprimés sous forme de **User Stories** (Histoires Utilisateurs). Les besoins sont structurés par **Épopées (Epics)** et priorisés selon la valeur métier apportée à **Wifak Bank**.

---

## Tableau du Backlog Produit

| Épopée (Epic) | Code US | Rôle / Acteur | User Story (Description du besoin) | Priorité |
| :--- | :--- | :--- | :--- | :--- |
| **Epic 1 : Authentification & Sécurité** | **US1.1** | Tous les rôles | En tant qu'utilisateur, je veux m'authentifier via mon identifiant/email et mon mot de passe pour accéder à mon tableau de bord sécurisé. | Haute |
| | **US1.2** | Candidat | En tant que candidat, je veux créer mon compte de façon autonome (inscription directe) avec upload de mon CV au format PDF et confirmation automatique par email. | Haute |
| | **US1.3** | Tous les rôles | En tant qu'utilisateur, je veux pouvoir réinitialiser mon mot de passe par email en cas d'oubli via un mot de passe temporaire sécurisé. | Haute |
| | **US1.4** | Directeur RH | En tant que Directeur Ressources Humaines, je veux modifier mon mot de passe temporaire dès ma première connexion au portail. | Haute |
| **Epic 2 : Gouvernance & Gestion des Comptes (Admin)** | **US2.1** | Administrateur | En tant qu'administrateur, je veux **créer, modifier et supprimer** les comptes utilisateurs (Admin, Directeur RH, Employé, Candidat). | Haute |
| | **US2.2** | Administrateur | En tant qu'administrateur, je veux ajouter un compte Directeur RH et lui transmettre ses identifiants générés automatiquement par email. | Haute |
| | **US2.3** | Administrateur | En tant qu'administrateur, je veux activer, bloquer ou suspendre l'accès de n'importe quel compte utilisateur du système. | Haute |
| **Epic 3 : Gestion des Départements (Admin)** | **US3.1** | Administrateur | En tant qu'administrateur, je veux **créer, modifier et supprimer** des départements (Informatique, RH, Finance, etc.) et leur désigner un responsable. | Haute |
| **Epic 4 : Profils Utilisateurs & Espace Candidat** | **US4.1** | Tous les rôles | En tant qu'utilisateur, je veux consulter et mettre à jour mes informations personnelles (prénom, nom, email, téléphone, avatar). | Haute |
| | **US4.2** | Candidat | En tant que candidat, je veux gérer mes compétences, formations, expériences professionnelles et mettre à jour mon fichier CV PDF. | Haute |
| **Epic 5 : Gestion des Congés (DRH & Employé)** | **US5.1** | Employé | En tant qu'employé, je veux soumettre une demande de congé (dates, motif, type) et recevoir un accusé de réception par email. | Haute |
| | **US5.2** | Employé | En tant qu'employé, je veux suivre le statut de mes demandes de congé (En attente, Validé, Refusé) et consulter mon solde. | Haute |
| | **US5.3** | Directeur RH | En tant que Directeur Ressources Humaines, je veux consulter, **valider ou refuser** les demandes de congé avec envoi d'email automatique à l'employé. | Haute |
| **Epic 6 : Recrutement & Offres d'emploi (DRH & Candidat)** | **US6.1** | Directeur RH | En tant que Directeur RH, je veux créer, modifier, publier et fermer des offres d'emploi destinées au recrutement externe. | Haute |
| | **US6.2** | Candidat | En tant que candidat, je veux rechercher et consulter les offres d'emploi disponibles publiées par Wifak Bank. | Haute |
| | **US6.3** | Candidat | En tant que candidat, je veux postuler à une offre d'emploi avec transmission automatique de mes coordonnées et de mon CV. | Haute |
| | **US6.4** | Directeur RH | En tant que Directeur RH, je veux consulter les candidatures reçues, visualiser les CVs via le lecteur intégré et mettre à jour leur statut. | Haute |
| **Epic 7 : Formations (DRH & Employé)** | **US7.1** | Directeur RH | En tant que Directeur RH, je veux programmer des sessions de formation (titre, dates, formateur, capacité) pour les collaborateurs. | Haute |
| | **US7.2** | Employé | En tant qu'employé, je veux consulter les formations ouvertes et demander une inscription. | Haute |
| | **US7.3** | Directeur RH | En tant que Directeur RH, je veux approuver ou rejeter les demandes d'inscription aux formations et notifier les employés par email. | Haute |
| **Epic 8 : Événements Internes (DRH & Collaborateurs)** | **US8.1** | Directeur RH | En tant que Directeur RH, je veux **créer, modifier et planifier des événements internes** (séminaires, hackathons, team building). | Moyenne |
| | **US8.2** | Employé / Candidat | En tant qu'employé ou candidat, je veux consulter le calendrier des événements et marquer ma participation. | Moyenne |
| **Epic 9 : Performance & Gamification (DRH & Employé)** | **US9.1** | Directeur RH | En tant que Directeur RH, je veux attribuer des points de performance (+/-) aux employés avec justification textuelle. | Haute |
| | **US9.2** | Employé | En tant qu'employé, je veux consulter mon score de performance, l'historique de mes points et mon rang sur le classement (leaderboard). | Haute |
| **Epic 10 : Chatbot IA & Assistances RH** | **US10.1** | Employé / DRH | En tant qu'utilisateur, je veux interagir avec le Chatbot IA Wifak RH pour poser mes questions sur les réglementations internes. | Haute |
| | **US10.2** | Tous les rôles | En tant qu'utilisateur, je veux recevoir des notifications emails automatiques pour toutes les transactions clés. | Haute |
| **Epic 11 : Tableaux de Bord Dédiés par Rôle** | **US11.1** | Administrateur | En tant qu'administrateur, je veux un tableau de bord analytique axé sur la gouvernance (comptes, départements, rôles, activités récents). | Haute |
| | **US11.2** | Directeur RH | En tant que Directeur RH, je veux un tableau de bord opérationnel synthétisant les KPI RH (congés, recrutements, formations, événements). | Haute |
| | **US11.3** | Employé | En tant qu'employé, je veux un tableau de bord personnel regroupant mes congés, mes points, mes formations et événements. | Moyenne |
| | **US11.4** | Candidat | En tant que candidat, je veux un espace carrière résumé montrant mes dossiers de postulation et mes alertes. | Moyenne |
