-- Type de permis + parcours souhaité pour les candidats (idempotent)
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS type_permis VARCHAR(8);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS parcours_souhaite VARCHAR(32);
