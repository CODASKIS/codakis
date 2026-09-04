-- Gamification candidat : points (niveau dérivé côté API)
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;
