# Cleanova Solutions - Application de gestion

Application complete de gestion pour une entreprise de services de nettoyage
(inspiree de Cleanova Solutions) : site public, reservation en ligne, espaces
client / cleaner / admin, gestion des services, des cleaners, des clients,
des reservations, des avis et des partenaires.

- **Frontend** : React 18 (Vite), React Router, Axios, TailwindCSS, Context API, Chart.js
- **Backend** : Node.js, Express.js, PostgreSQL (pg), JWT, bcrypt, Multer, PDFKit
- **Base de donnees** : PostgreSQL

Cette application a ete entierement testee de bout en bout (backend API,
build frontend, et parcours utilisateur reels via navigateur automatise)
avant livraison.

## 1. Prerequis

- Node.js 18+ et npm
- PostgreSQL 14+ installe et demarre

## 2. Installation

### 2.1 Base de donnees

```bash
# Creer la base de donnees (adapter l'utilisateur si besoin)
createdb cleanova
```

### 2.2 Backend

```bash
cd backend
cp .env.example .env
# Editez .env : renseignez au minimum PGUSER / PGPASSWORD / PGDATABASE et JWT_SECRET

npm install
npm run db:init    # cree les tables
npm run db:seed    # insere des donnees de demonstration
npm run dev         # demarre l'API sur http://localhost:5000 (nodemon)
# ou: npm start pour un lancement sans rechargement automatique
```

### 2.3 Frontend

```bash
cd frontend
cp .env.example .env   # optionnel en dev (le proxy Vite redirige /api vers localhost:5000)
npm install
npm run dev             # demarre l'app sur http://localhost:5173
```

Ouvrez http://localhost:5173 dans votre navigateur.

### 2.4 Comptes de demonstration (mot de passe unique: `Password123!`)

| Role    | Email                     | Notes                                  |
|---------|---------------------------|-----------------------------------------|
| Admin   | admin@cleanova.ca       | Acces complet a l'administration        |
| Client  | client@cleanova.ca      | Compte client avec historique           |
| Cleaner | cleaner@cleanova.ca     | Cleaner deja approuve                   |
| Cleaner | cleaner2@cleanova.ca    | Cleaner en attente de validation admin  |

## 3. Structure du projet

```
finapropre-app/
├── backend/
│   ├── src/
│   │   ├── config/        # connexion PostgreSQL
│   │   ├── controllers/   # logique metier par ressource
│   │   ├── routes/        # definition des routes Express
│   │   ├── middleware/    # auth JWT, roles, upload, erreurs
│   │   ├── utils/         # token, email, facture PDF, export CSV
│   │   ├── database/      # schema.sql, init.js, seed.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/           # images uploadees (services, cleaners, partenaires)
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/images/  # illustrations centralisees (hero, services, atouts, partenaires)
    │   ├── components/     # Navbar, Footer, cartes, modales, layouts...
    │   ├── pages/          # pages publiques + client/ + cleaner/ + admin/
    │   ├── context/        # AuthContext, ToastContext
    │   ├── services/       # client Axios (api.js)
    │   └── utils/          # helpers (devise, dates, badges de statut, images par defaut)
    ├── .env.example
    └── package.json
```

### 3.1 Charte visuelle

- **Marque** : Cleanova Solutions (nom court : Cleanova).
- **Couleur principale** : vert (`brand-700 = #15803d`), definie dans
  `frontend/tailwind.config.js` - un seul endroit a modifier pour changer
  toute la palette du site.
- **Images** : le fond du hero (`src/assets/images/hero-bg.jpg`) et toutes
  les illustrations (services, "pourquoi nous choisir", partenaires) sont
  des creations originales stockees dans `src/assets/images/`, chargees par
  defaut quand un service, un avantage ou un partenaire n'a pas d'image
  uploadee. Elles peuvent etre remplacees par vos propres visuels/photos en
  gardant le meme nom de fichier, ou via l'upload d'image dans
  l'administration (services et partenaires).

## 4. Fonctionnalites livrees

**Site public** : accueil avec hero, carousel de services, section "pourquoi
nous choisir", partenaires defilants, page services (filtrable par
categorie + recherche), page partenaires, inscription client et cleaner,
connexion.

**Espace client** : tableau de bord (statistiques, reservations recentes),
historique complet avec filtres, creation de reservation en 4 etapes
(service → details → cleaner optionnel → recapitulatif), paiement simule,
annulation, avis apres prestation terminee, edition du profil.

**Espace cleaner** : tableau de bord (missions realisees, note moyenne,
gains, missions a venir), liste des missions avec acceptation/refus,
gestion de la disponibilite et du tarif horaire.

**Administration** : tableau de bord avec graphique de revenus (Chart.js),
validation/suspension des cleaners, CRUD complet des services (avec upload
d'image et categories), gestion des clients (activation, historique), gestion
des reservations (attribution manuelle de cleaner, changement de statut,
export CSV, facture PDF par reservation), CRUD des partenaires (avec logo),
parametres generaux (coordonnees, prix par defaut), zones d'intervention et
plages horaires.

**Systeme d'avis** : notation 1 a 5 apres une prestation terminee, recalcul
automatique de la note moyenne du cleaner, moderation par l'admin.

## 5. Ce qui est simule (et comment l'activer en production)

Pour livrer une base saine et fonctionnelle immediatement sans dependre de
services tiers payants, certains elements sont **simules** mais le code est
deja structure pour brancher les vrais services :

- **Paiement (Stripe)** : `PUT /api/bookings/:id/pay` marque directement la
  reservation comme payee. Le point d'integration Stripe reel est commente
  dans `backend/src/controllers/bookingController.js` (fonction `payBooking`).
  Ajoutez vos cles dans `.env` (`STRIPE_SECRET_KEY`, `STRIPE_ENABLED=true`)
  et decommentez le bloc apres `npm install stripe`.
- **Emails de confirmation** : simules par un `console.log` dans
  `backend/src/utils/mailer.js`. Renseignez `SMTP_HOST` / `SMTP_USER` /
  `SMTP_PASS` dans `.env` et decommentez le bloc Nodemailer (`npm install
  nodemailer`) pour un envoi reel.
- **Notifications temps reel (Socket.io)** : une table `notifications` et des
  routes de polling (`GET /api/notifications`) existent deja ; l'ajout de
  Socket.io pour du push temps reel est une extension optionnelle non
  incluse par defaut (mentionnee comme optionnelle dans le cahier des
  charges).
- **Multi-langue (i18next)** : optionnel dans le cahier des charges, non
  inclus par defaut. L'ensemble des textes est actuellement en francais.

## 6. Documentation API (principaux endpoints)

Toutes les routes sont prefixees par `/api`. Les routes protegees exigent
l'entete `Authorization: Bearer <token>` obtenu via `/auth/login`.

### Authentification
- `POST /auth/register/client` - inscription client
- `POST /auth/register/cleaner` - candidature cleaner (multipart, champ `photo` optionnel)
- `POST /auth/login`
- `GET /auth/me` (protege)

### Services
- `GET /services`, `GET /services/:id`, `GET /services/categories`
- `POST /services`, `PUT /services/:id`, `DELETE /services/:id` (admin, multipart `image`)

### Cleaners
- `GET /cleaners`, `GET /cleaners/:id` (annuaire public)
- `PUT /cleaners/me/availability`, `GET /cleaners/me/stats`, `GET /cleaners/me/bookings`
- `PUT /cleaners/me/bookings/:id/respond` (`{ action: 'accept' | 'refuse' }`)

### Reservations
- `POST /bookings`, `GET /bookings/me`, `GET /bookings/:id`
- `PUT /bookings/:id/cancel`, `PUT /bookings/:id/pay`

### Avis
- `POST /reviews`, `GET /reviews/cleaner/:cleanerId`, `PUT /reviews/:id/moderate` (admin)

### Partenaires
- `GET /partners`
- `POST /partners`, `PUT /partners/:id`, `DELETE /partners/:id` (admin, multipart `logo`)

### Administration (toutes protegees, role admin)
- `GET /admin/stats`
- `GET /admin/cleaners`, `PUT /admin/cleaners/:id/status`, `PUT /admin/cleaners/:id`
- `GET /admin/clients`, `GET /admin/clients/:id/history`, `PUT /admin/clients/:id/active`
- `GET /admin/bookings`, `PUT /admin/bookings/:id/assign`, `PUT /admin/bookings/:id/status`
- `GET /admin/bookings/export/csv`, `GET /admin/bookings/:id/invoice` (PDF)
- `GET /admin/settings`, `PUT /admin/settings`
- `POST /admin/zones`, `DELETE /admin/zones/:id`
- `POST /admin/time-slots`, `DELETE /admin/time-slots/:id`

## 7. Deploiement en production - points d'attention

- Definissez un `JWT_SECRET` long et aleatoire, et des identifiants PostgreSQL dedies.
- Servez le frontend buile (`npm run build` dans `frontend/`, dossier `dist/`)
  via un serveur statique ou un CDN, et pointez `VITE_API_URL` vers l'URL
  publique de l'API.
- Placez l'API derriere HTTPS (reverse proxy Nginx/Caddy ou plateforme gerant
  le TLS automatiquement).
- Le dossier `backend/uploads/` doit etre persistant (volume) ou remplace par
  un stockage objet (S3, etc.) pour un environnement multi-instances.
- Ajoutez une sauvegarde reguliere de la base PostgreSQL.
