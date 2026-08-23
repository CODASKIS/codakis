-- Profil public auto-école : logo, site web, description et infos d'inscription
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS raison_sociale_legale TEXT;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS rccm TEXT;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS site_web TEXT;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS telephone TEXT;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS nombre_moniteurs INTEGER;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS nombre_vehicules INTEGER;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS annees_experience INTEGER;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS fonction_gerant TEXT;
