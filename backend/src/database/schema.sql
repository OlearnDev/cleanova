-- =====================================================================
-- Cleanova Solutions - Schema PostgreSQL
-- =====================================================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS cleaner_profiles CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS service_zones CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------------------------------------------------
-- Utilisateurs (admin / client / cleaner)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(190) UNIQUE NOT NULL,
  phone           VARCHAR(30),
  address         TEXT,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'client', 'cleaner')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ---------------------------------------------------------------------
-- Profils Cleaner (extension de users pour role = cleaner)
-- ---------------------------------------------------------------------
CREATE TABLE cleaner_profiles (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  years_experience   NUMERIC(4,1) DEFAULT 0,
  skills             TEXT,
  hourly_rate        NUMERIC(8,2) NOT NULL DEFAULT 0,
  photo_url          TEXT,
  availability       VARCHAR(20) NOT NULL DEFAULT 'partiel' CHECK (availability IN ('temps_plein', 'partiel')),
  status             VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'approuve', 'suspendu', 'refuse')),
  average_rating     NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_reviews      INTEGER NOT NULL DEFAULT 0,
  total_missions     INTEGER NOT NULL DEFAULT 0,
  total_earnings     NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cleaner_status ON cleaner_profiles(status);

-- ---------------------------------------------------------------------
-- Categories & Services
-- ---------------------------------------------------------------------
CREATE TABLE service_categories (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100) NOT NULL UNIQUE,
  slug    VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE services (
  id              SERIAL PRIMARY KEY,
  category_id     INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
  name            VARCHAR(150) NOT NULL,
  description     TEXT,
  price           NUMERIC(8,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  image_url       TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active);

-- ---------------------------------------------------------------------
-- Reservations
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
  id              SERIAL PRIMARY KEY,
  client_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id      INTEGER NOT NULL REFERENCES services(id),
  cleaner_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME NOT NULL,
  address         TEXT NOT NULL,
  notes           TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                    CHECK (status IN ('en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee', 'refusee')),
  total_price     NUMERIC(8,2) NOT NULL,
  payment_status  VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (payment_status IN ('en_attente', 'paye', 'echoue')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_cleaner ON bookings(cleaner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);

-- ---------------------------------------------------------------------
-- Avis / notation
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
  id              SERIAL PRIMARY KEY,
  booking_id      INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  client_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cleaner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reviews_cleaner ON reviews(cleaner_id);

-- ---------------------------------------------------------------------
-- Partenaires
-- ---------------------------------------------------------------------
CREATE TABLE partners (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  logo_url      TEXT,
  website_url   TEXT,
  category      VARCHAR(100),
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Zones d'intervention & plages horaires
-- ---------------------------------------------------------------------
CREATE TABLE service_zones (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE time_slots (
  id          SERIAL PRIMARY KEY,
  label       VARCHAR(50) NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- Parametres generaux (cle/valeur JSON)
-- ---------------------------------------------------------------------
CREATE TABLE settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       JSONB NOT NULL
);

-- ---------------------------------------------------------------------
-- Notifications internes (polling cote client)
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
