-- Forfaits, inscriptions candidats et séances pratiques

CREATE TABLE IF NOT EXISTS forfaits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auto_ecole_id UUID NOT NULL REFERENCES auto_ecoles(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    label_fr TEXT NOT NULL,
    label_en TEXT NOT NULL,
    prix INTEGER NOT NULL DEFAULT 0,
    heures_conduite INTEGER,
    description_fr TEXT,
    description_en TEXT,
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forfaits_ecole ON forfaits(auto_ecole_id);

CREATE TABLE IF NOT EXISTS inscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidat_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    auto_ecole_id UUID NOT NULL REFERENCES auto_ecoles(id) ON DELETE CASCADE,
    forfait_id UUID REFERENCES forfaits(id) ON DELETE SET NULL,
    forfait_type VARCHAR(32) NOT NULL,
    forfait_label TEXT NOT NULL,
    statut VARCHAR(32) NOT NULL DEFAULT 'confirmee',
    payment_ref TEXT,
    heures_conduite_total INTEGER NOT NULL DEFAULT 0,
    heures_conduite_restantes INTEGER NOT NULL DEFAULT 0,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inscriptions_ecole ON inscriptions(auto_ecole_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_candidat ON inscriptions(candidat_id);

CREATE TABLE IF NOT EXISTS seances_pratiques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscription_id UUID NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
    auto_ecole_id UUID NOT NULL REFERENCES auto_ecoles(id) ON DELETE CASCADE,
    candidat_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    moniteur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    statut VARCHAR(32) NOT NULL DEFAULT 'planifiee',
    lieu TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seances_ecole ON seances_pratiques(auto_ecole_id);
CREATE INDEX IF NOT EXISTS idx_seances_moniteur ON seances_pratiques(moniteur_id);
CREATE INDEX IF NOT EXISTS idx_seances_inscription ON seances_pratiques(inscription_id);
