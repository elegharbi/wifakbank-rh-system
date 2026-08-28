# Tableau 1 – Cas d’Utilisation du Système RH Wifak Bank (Mise à Jour Conforme)

Ce tableau recense l'ensemble des cas d'utilisation (Use Cases) réels de la plateforme **Wifak Bank RH**, réalignés avec la séparation stricte des rôles : l'**Administrateur** (gouvernance technique : création, modification, suppression des comptes et départements), le **Directeur Ressources Humaines (DRH)** (gestion opérationnelle RH : congés, recrutements, formations, événements, gamification), l'**Employé**, le **Candidat** et le **Visiteur**.

---

| ID Cas d’utilisation | Titre du Cas d’Utilisation | Acteurs | Type |
| :--- | :--- | :--- | :--- |
| **UC-01** | S’authentifier | Visiteur, Administrateur, Directeur RH, Employé, Candidat | Principal |
| **UC-02** | Se déconnecter | Administrateur, Directeur RH, Employé, Candidat | Principal |
| **UC-03** | Réinitialiser le mot de passe | Visiteur, Tous les utilisateurs | Principal |
| **UC-04** | Modifier le mot de passe | Administrateur, Directeur RH, Employé, Candidat | Principal |
| **UC-05** | S’inscrire (Inscription directe Candidat) | Visiteur, Candidat | Principal |
| **UC-06** | Consulter le tableau de bord Admin | Administrateur | Principal |
| **UC-07** | Gouvernance des utilisateurs (Comptes & Rôles) | Administrateur | Principal |
| **UC-07a** | Créer un utilisateur (Admin, DRH, Employé, Candidat) | Administrateur | «extend» UC-07 |
| **UC-07b** | Modifier un utilisateur | Administrateur | «extend» UC-07 |
| **UC-07c** | Bloquer / Débloquer un utilisateur | Administrateur | «extend» UC-07 |
| **UC-07d** | Supprimer un utilisateur (Soft Delete) | Administrateur | «extend» UC-07 |
| **UC-08** | Gérer les départements (Créer, Modifier, Supprimer) | Administrateur | Principal |
| **UC-09** | Consulter le tableau de bord RH | Directeur RH | Principal |
| **UC-10** | Gérer les offres d’emploi (Créer, Modifier, Publier, Clôturer) | Directeur RH | Principal |
| **UC-11** | Gérer les candidatures & examiner les CVs (PDF Viewer) | Directeur RH | Principal |
| **UC-12** | Valider / Refuser les demandes de congés (avec alerte email) | Directeur RH | Principal |
| **UC-13** | Gérer le plan de formation & valider les inscriptions | Directeur RH | Principal |
| **UC-14** | Évaluer les employés (Attribution de points de performance) | Directeur RH | Principal |
| **UC-15** | Organiser et planifier les événements internes | Directeur RH | Principal |
| **UC-16** | Consulter le tableau de bord Employé | Employé | Principal |
| **UC-17** | Demander un congé & suivre son solde | Employé | Principal |
| **UC-18** | Consulter le catalogue des formations & s'inscrire | Employé | Principal |
| **UC-19** | Suivre ses points de performance & le classement (Leaderboard) | Employé | Principal |
| **UC-20** | Consulter le calendrier des événements & participer | Employé, Candidat | Principal |
| **UC-21** | Postuler à une offre d’emploi avec dépôt de CV PDF | Candidat | Principal |
| **UC-22** | Suivre l’état de sa candidature (Espace Carrière) | Candidat | Principal |
| **UC-23** | Interagir avec le Chatbot IA Wifak RH | Administrateur, Directeur RH, Employé, Candidat | Principal |
| **UC-24** | Consulter et mettre à jour son profil utilisateur | Administrateur, Directeur RH, Employé, Candidat | Principal |

---

### 📝 Modifications Majeures Apportées :
1. **Remplacement de "Responsable RH" par "Directeur RH"** pour respecter la nomenclature officielle du projet.
2. **Suppression du cas d'utilisation "Gérer la paie et les fiches de salaire" (ancien UC-09)** qui n'est pas inclus dans le périmètre fonctionnel du système.
3. **Recadrage de l'Admin sur le CRUD strict** (Créer, Modifier, Supprimer, Bloquer) des comptes et des départements.
4. **Attribution exclusive de la gestion des Événements Internes au Directeur RH** (UC-15).
5. **Ajout explicite de l'Inscription aux Formations par l'Employé** (UC-18) et de la consultation du calendrier des événements (UC-20).
