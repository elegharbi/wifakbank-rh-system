# Fonctionnalités, évolutions et identifiants

Document de référence du portail RH Wifak Bank : ce que fait l'application,
ce qui a été modifié, et comment s'y connecter.

---

## Sommaire

1. [Identifiants](#1-identifiants)
2. [Fonctionnalités par rôle](#2-fonctionnalités-par-rôle)
3. [Fonctionnalités transverses](#3-fonctionnalités-transverses)
4. [Design system](#4-design-system)
5. [Journal des évolutions](#5-journal-des-évolutions)
6. [Correctifs](#6-correctifs)
7. [Limites connues](#7-limites-connues)
8. [Notes techniques](#8-notes-techniques)

---

## 1. Identifiants

### Comptes applicatifs

Créés par `DbSeeder` au premier démarrage.

| Rôle | Identifiant | Mot de passe | Usage |
|---|---|---|---|
| `ADMIN` | `admin` | `admin123` | Administration complète |
| `HR` | `rh` | `rh1234` | Espace ressources humaines |
| `EMPLOYEE` | `emp1` | `emp123` | Collaborateur |
| `EMPLOYEE` | `emp2` | `emp123` | Collaborateur |
| `EMPLOYEE` | `emp3` | `emp123` | Collaborateur |
| `EMPLOYEE` | `user` | `user123` | Collaborateur |
| `CANDIDATE` | `candidat` | `candidat123` | Espace candidat |

Comptes supplémentaires issus de `data.sql` (sans mot de passe utilisable) :
`ahmed.tounsi`, `sara.benali`, `karim.mansour`, `asma.trabelsi`,
`youssef.b`, `ines.h`, `nader.l`.

### Services externes

Aucun secret n'est versionné. `application.properties` est exclu du dépôt ;
partez de `application.properties.example` et renseignez :

| Variable | Utilisée pour |
|---|---|
| `spring.datasource.username` / `password` | Connexion PostgreSQL |
| `huggingface.api.token` | Assistant RH (modèle Llama) |
| `spring.mail.username` / `password` | Notifications par e-mail |

> **Rotation requise.** Les versions précédentes du projet contenaient un
> jeton Hugging Face et un mot de passe d'application Gmail en clair dans
> `application.properties`. Ils ont été retirés du dépôt, mais **doivent être
> révoqués et régénérés** : ils ont circulé en clair.

---

## 2. Fonctionnalités par rôle

### Collaborateur (`EMPLOYEE`)

| Écran | Fonctions |
|---|---|
| **Tableau de bord** | Salutation selon l'heure, solde de congés, score, événements, formations — compteurs animés, notification de congé traité |
| **Mon profil** | Photo de profil (import, glisser-déposer, recadrage), coordonnées, changement de mot de passe |
| **Mes congés** | Demande (type, dates, motif, durée calculée), historique filtrable par statut |
| **Points & classement** | Score, palier, top 5, historique des gains et pertes |
| **Plan de formation** | Catalogue, inscription avec confirmation, suivi du statut RH |
| **Événements** | Calendrier, inscription et **annulation** d'inscription |

### Ressources humaines (`HR`)

Validation des congés, recrutement et candidatures, gestion des formations,
annonces, départements.

### Administrateur (`ADMIN`)

| Écran | Fonctions |
|---|---|
| **Tableau de bord** | Effectifs, candidats, départements, répartition par rôle, activité récente |
| **Utilisateurs** | Recherche, filtres rôle/statut, création, modification, suppression, pagination |
| **Départements** | Création, modification, suppression |
| **Paramètres** | Préférences générales, sécurité, notifications, apparence |

### Candidat (`CANDIDATE`)

Dépôt de candidature (CV PDF, lettre de motivation), suivi des postulations.

---

## 3. Fonctionnalités transverses

### Thème clair / sombre

- Bascule visible dans l'en-tête de **chaque** espace et sur les pages publiques
- Choix mémorisé (`localStorage`)
- À la première visite, suit le réglage du système d'exploitation
- `ThemeService` est la source unique : basculer à un endroit met tout à jour

### Assistant RH

- Bulle flottante ancrée en bas à droite
- **Historique** : les conversations sont enregistrées automatiquement,
  titrées d'après la première question, datées en relatif
  (« Aujourd'hui, 14:05 »), rouvrables et supprimables
- **Nouvelle conversation** sans perdre la précédente
- 30 conversations conservées ; si le stockage sature, repli sur les 8 plus récentes
- Cloisonnement par compte utilisateur
- Suggestions de démarrage, indicateur de saisie, défilement automatique

### Photo de profil

Import par clic ou glisser-déposer, validation du type et de la taille (5 Mo),
recadrage carré centré et redimensionnement à 320 px dans le navigateur.
Affichée simultanément dans le profil, le menu latéral et l'en-tête.

### Boîtes de dialogue

Toutes les fenêtres système (`confirm()`, `alert()`) ont été remplacées par un
composant maison : fond flouté, icône en relief, entrée ressort, fermeture par
`Échap`, ton neutre ou rouge selon la gravité. Chaque message nomme l'élément
concerné et annonce la conséquence.

### Bilingue

Français / arabe, bascule sur les pages publiques, choix mémorisé.

---

## 4. Design system

Défini dans `frontend/src/theme-wifak.css`.

### Palette — extraite du logo

| Jeton | Clair | Rôle |
|---|---|---|
| `--wf-blue` | `#0B5CA8` | Bleu de marque, surfaces et navigation |
| `--wf-blue-lit` | `#2B8FD8` | Bleu clair, dégradés |
| `--wf-red` | `#D62B24` | Rouge de marque, **actions** |
| `--wf-red-lit` | `#F0483F` | Rouge clair |
| `--wf-grey` | `#8E9295` | Gris de la flamme |
| `--wf-navy` | `#16265C` | Bleu nuit du logotype |

**Principe** : le bleu porte le décor, le rouge porte l'action.
`--wf-flame` reprend le dégradé bleu → rouge → gris de la flamme.

### Profondeur

Ombres empilées (`--wf-lift-1` à `--wf-lift-3`) plutôt qu'un flou unique.
Les pavés d'icônes combinent dégradé, liseré interne clair et ombre colorée
pour un effet de relief. Les ombres sont renforcées en thème sombre.

### Mouvement

Inclinaison 3D des cartes au survol, reflet balayant, entrées en cascade,
compteurs progressifs, plans de verre flottants et sol en perspective sur les
pages publiques. **Tout est désactivé sous `prefers-reduced-motion`.**

### Typographie

`Outfit` pour les titres et les chiffres, `Inter` pour le texte courant.

---

## 5. Journal des évolutions

### Mise en service

- Maven embarqué inutilisable : tous les `.jar` étaient exclus par `.gitignore`.
  Réextraction depuis l'archive.
- Installation de PostgreSQL 17 (l'instance disponible était une 9.3
  incompatible avec les colonnes `IDENTITY`).
- `data.sql` insérait dans une table `employees` inexistante — vestige d'une
  refonte antérieure, les employés étant des `User`. Blocs neutralisés.
- Ajout de `spring.sql.init.encoding=UTF-8` : les accents étaient corrompus
  (`Direction GÃ©nÃ©rale`).
- Suppression du script d'`index.html` qui vidait `localStorage` et
  `sessionStorage` à chaque chargement — il déconnectait l'utilisateur à
  chaque rafraîchissement.

### Interface collaborateur

Refonte du tableau de bord, du profil, des congés, des points, des formations
et des événements. Ajout de la photo de profil, du thème sombre, de
l'historique de l'assistant, des boîtes de dialogue maison.
Ajout de l'entrée « Événements » au menu latéral.

### Interface administrateur

Refonte de la coque (menu latéral clair, barre supérieure en verre), du
tableau de bord, des utilisateurs, des départements et des paramètres.
Ajout de la bascule de thème et remplacement des trois dernières fenêtres
système.

### Pages publiques

Accueil, connexion et inscription : passage au bleu de marque, ajout des
bascules thème et langue, décor 3D animé, transition coordonnée entre
connexion et inscription, densification du formulaire d'inscription qui
dépassait la hauteur d'écran.

### Identité

Favicon reconstruit à partir de la flamme du logo (`.ico` multi-tailles
16/32/48, PNG, icône Apple), fond blanc détouré par seuillage progressif.

---

## 6. Correctifs

| Problème | Cause | Correction |
|---|---|---|
| Assistant recouvrant le contenu | `.chatbot-container` sans règle de positionnement | Ancrage `fixed` en bas à droite |
| Bouton « Envoye » tronqué | Texte dans un cercle de 40 px | Bouton icône |
| Bouton d'édition invisible | Icônes Bootstrap non chargées | Passage à Font Awesome |
| Libellés illisibles en thème sombre | Portée des styles Angular plus forte que la feuille globale | `:host-context(.dark-mode)` |
| Fond clair persistant | `.login-page`, `.register-page`, `.hero`, `.stats-section` déclarés **deux fois** | Correction de la seconde déclaration |
| Contact insensible au thème sombre | Styles en attributs `style=` inline | Réécriture en classes |
| Boutons déplacés sur les pages publiques | `position: relative` écrasant `absolute` | Le décor ne touche plus au positionnement |
| Encadré blanc derrière la flamme | Fond blanc du logo copié au recadrage | Détourage par seuillage |
| Avatar figé sur « A » | Initiale codée en dur | Initiales réelles ou photo |
| Pastille de présence rognée | `overflow: hidden` sur le conteneur | Arrondi porté par l'image |

---

## 7. Limites connues

### Photo de profil — stockage local

`profile_image` est un `varchar(255)` : une image encodée en base64 n'y tient
pas. La photo est conservée dans le navigateur et ne suit donc pas
l'utilisateur d'un appareil à l'autre.

**Correction possible** — une ligne dans `User.java` :

```java
@Column(columnDefinition = "TEXT")
private String profileImage;
```

### Historique de l'assistant

Également conservé dans le navigateur, cloisonné par compte. Non synchronisé
entre appareils.

### Données incomplètes

Certains indicateurs affichent `0` et `/api/employees` renvoie `500`. Ces
points relèvent du service et des données, non de l'interface.

### Composants non routés

`components/admin/analytics`, `leaves` et `payroll` existent mais ne sont
rattachés à aucune route sous `/admin`.

### `ddl-auto=create`

Le schéma est recréé à chaque démarrage. À passer en `update` dès que des
données doivent survivre.

---

## 8. Notes techniques

### Styles Angular et thème sombre

L'encapsulation émulée ajoute un attribut à chaque sélecteur d'un style de
composant, ce qui augmente sa spécificité. Une règle globale
`body.dark-mode .form-group label` perd donc contre le
`.form-group[_ngcontent-x] label[_ngcontent-x]` du composant.

**Règle** : dans une feuille de composant, écrire
`:host-context(.dark-mode) .form-group label`.

### Déclarations en double

Plusieurs feuilles héritées déclarent deux fois le même sélecteur, la seconde
annulant discrètement la première. En cas de modification sans effet visible,
vérifier les doublons avant toute autre hypothèse.

### PostgreSQL 10 minimum

`GenerationType.IDENTITY` produit `GENERATED BY DEFAULT AS IDENTITY`,
introduit en PostgreSQL 10.

### Installation npm

`npm install --legacy-peer-deps` est obligatoire :
`@angular/animations` exige une version exacte de `@angular/core`.

### Proxy de développement

`frontend/proxy.conf.json` relaie `/api` vers `localhost:8081`.
Modifier ce fichier si le port de l'API change.
