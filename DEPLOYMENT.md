# Mettre la démo en ligne

Objectif : une URL publique permanente, accessible même PC éteint,
sans carte bancaire.

**Architecture** — l'interface Angular est compilée **dans** le JAR
Spring Boot. Un seul service à héberger, un seul port, aucune
configuration CORS.

```
┌──────────────────────────┐        ┌─────────────────┐
│  Render (service web)    │───────▶│  Neon           │
│  JAR = Angular + API     │        │  PostgreSQL 17  │
└──────────────────────────┘        └─────────────────┘
         ▲
         │  https://wifakbank-rh.onrender.com
```

Comptez 30 à 45 minutes.

---

## Étape 1 — Base de données (Neon)

1. Créez un compte sur **https://neon.tech** (gratuit, sans carte).
2. **Create project** → nom `wifakbank-rh`, région **Europe (Frankfurt)**.
3. Ouvrez **Connection string** et choisissez le format **Java / JDBC**.
   Vous obtenez une chaîne de la forme :

   ```
   jdbc:postgresql://ep-xxx.eu-central-1.aws.neon.tech/neondb?user=USER&password=PASS&sslmode=require
   ```

4. Notez séparément les trois éléments :

   | Élément | Où le lire |
   |---|---|
   | URL | jusqu'à `/neondb`, **plus** `?sslmode=require` |
   | Utilisateur | valeur de `user=` |
   | Mot de passe | valeur de `password=` |

> Neon fournit PostgreSQL 17 : la contrainte « version 10 minimum » est respectée.

---

## Étape 2 — Service web (Render)

1. Créez un compte sur **https://render.com** et connectez votre GitHub.
2. **New +** → **Web Service** → dépôt `elegharbi/wifakbank-rh-system`.
3. Renseignez :

   | Champ | Valeur |
   |---|---|
   | Name | `wifakbank-rh` |
   | Region | Frankfurt |
   | Branch | `main` |
   | Runtime | **Docker** |
   | Instance Type | **Free** |

   Render détecte le `Dockerfile` à la racine : ni build command ni
   start command à saisir.

---

## Étape 3 — Variables d'environnement

Dans **Environment**, ajoutez :

| Clé | Valeur | Obligatoire |
|---|---|---|
| `SPRING_DATASOURCE_URL` | l'URL JDBC de l'étape 1 | oui |
| `SPRING_DATASOURCE_USERNAME` | l'utilisateur Neon | oui |
| `SPRING_DATASOURCE_PASSWORD` | le mot de passe Neon | oui |
| `JPA_DDL_AUTO` | `update` | recommandé |
| `HUGGINGFACE_API_TOKEN` | votre nouveau jeton | pour l'assistant |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | compte SMTP | pour les e-mails |

`PORT` est fourni automatiquement par Render : **ne le définissez pas**.

### `JPA_DDL_AUTO` : `create` ou `update` ?

| Valeur | Effet |
|---|---|
| `create` | Schéma recréé à chaque démarrage. Données de démonstration toujours fraîches, **mais toute saisie disparaît** au redémarrage. |
| `update` | Schéma conservé. Ce que les visiteurs saisissent persiste. |

Sur le palier gratuit, le service s'endort après 15 minutes d'inactivité
et redémarre à la visite suivante. Avec `create`, **chaque réveil remet la
base à zéro**. Préférez `update` pour une démo partagée.

Les comptes de démonstration sont créés au premier démarrage dans les deux cas.

---

## Étape 4 — Déployer

**Create Web Service**. Le premier build prend 8 à 12 minutes
(compilation Angular puis Maven). Suivez les journaux ; attendez :

```
Started RhSystemApplication in X seconds
```

Votre URL : `https://wifakbank-rh.onrender.com`

---

## Étape 5 — Vérifier

1. Ouvrez l'URL → la page d'accueil s'affiche.
2. Connectez-vous avec `admin` / `admin123`.
3. Rafraîchissez sur `/admin/users` → la page doit se recharger
   correctement (le repli SPA est en place).
4. Testez la bascule clair/sombre.

---

## À savoir sur le palier gratuit

| Point | Conséquence |
|---|---|
| Mise en veille | Après 15 min sans visite. La première visite suivante prend **environ 50 secondes**. |
| Heures | 750 h/mois, suffisant pour un service permanent. |
| Base Neon | 0,5 Go, largement suffisant. |

> **Avant une soutenance**, ouvrez le lien 2 minutes avant de commencer :
> le service sera réveillé et la démonstration instantanée.

---

## Sécurité — à faire avant de partager

1. **Révoquez les anciens secrets.** Le jeton Hugging Face et le mot de
   passe d'application Gmail ont existé en clair dans le dépôt de travail.
   Régénérez-les et ne renseignez que les nouveaux chez Render.
2. **Changez les mots de passe de démonstration** si le lien circule
   au-delà de votre jury (`admin123`, `rh1234`…).
3. Ne recréez jamais `application-local.properties` dans un commit :
   il est exclu par `.gitignore`.

---

## Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Build échoue sur `npm ci` | `package-lock.json` désynchronisé | `npm install --legacy-peer-deps` en local, puis committez le lock |
| `Connection refused` vers la base | URL Neon sans `?sslmode=require` | Ajoutez le paramètre |
| Page blanche, 404 sur les `.js` | Build Angular absent de l'image | Vérifiez l'étape `COPY --from=frontend` du `Dockerfile` |
| 404 en rafraîchissant `/profile` | Repli SPA inactif | `SpaWebConfig.java` doit être présent |
| Première visite très lente | Service endormi | Comportement normal du palier gratuit |
| Données disparues | `JPA_DDL_AUTO=create` | Passez à `update` |

---

## Alternative : lien temporaire

Pour montrer la démo en direct depuis votre PC, sans hébergement :

```bash
# 1. Lancez le JAR
java -jar target/rh_system-0.0.1-SNAPSHOT.jar

# 2. Dans un second terminal, ouvrez un tunnel
npx localtunnel --port 8081
```

Le lien fourni reste actif tant que les deux commandes tournent.
