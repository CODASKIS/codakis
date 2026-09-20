-- Fichiers joints aux pièces Consort
ALTER TABLE pieces_consort ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE pieces_consort ADD COLUMN IF NOT EXISTS file_name TEXT;

-- RSVP candidat sur les séances pratiques
ALTER TABLE seances_pratiques ADD COLUMN IF NOT EXISTS participation VARCHAR(16) NOT NULL DEFAULT 'en_attente';
