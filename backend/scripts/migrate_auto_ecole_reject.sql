-- Colonnes pour le refus d'inscription auto-école (PostgreSQL)
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS est_refusee BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS motif_refus TEXT;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS refusee_le TIMESTAMPTZ;
ALTER TABLE auto_ecoles ADD COLUMN IF NOT EXISTS refusee_par UUID REFERENCES utilisateurs(id);
