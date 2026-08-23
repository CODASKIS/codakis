-- Créneaux moniteur, limites de charge et notifications

ALTER TABLE moniteurs_auto_ecole ADD COLUMN IF NOT EXISTS max_seances_semaine INTEGER NOT NULL DEFAULT 12;
ALTER TABLE moniteurs_auto_ecole ADD COLUMN IF NOT EXISTS capacite_creneau INTEGER NOT NULL DEFAULT 2;

CREATE TABLE IF NOT EXISTS creneaux_moniteur (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auto_ecole_id UUID NOT NULL REFERENCES auto_ecoles(id) ON DELETE CASCADE,
    moniteur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    capacite_max INTEGER NOT NULL DEFAULT 2 CHECK (capacite_max BETWEEN 1 AND 2),
    statut VARCHAR(32) NOT NULL DEFAULT 'ouvert',
    lieu TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creneaux_moniteur ON creneaux_moniteur(moniteur_id);
CREATE INDEX IF NOT EXISTS idx_creneaux_ecole ON creneaux_moniteur(auto_ecole_id);
CREATE INDEX IF NOT EXISTS idx_creneaux_starts ON creneaux_moniteur(starts_at);

ALTER TABLE seances_pratiques ADD COLUMN IF NOT EXISTS creneau_id UUID REFERENCES creneaux_moniteur(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title_fr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    body_fr TEXT NOT NULL,
    body_en TEXT NOT NULL,
    payload JSONB,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(utilisateur_id, lu);
