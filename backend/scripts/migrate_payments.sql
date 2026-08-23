CREATE TABLE IF NOT EXISTS paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    auto_ecole_id UUID REFERENCES auto_ecoles(id) ON DELETE SET NULL,
    forfait_id UUID REFERENCES forfaits(id) ON DELETE SET NULL,
    plan_id TEXT,
    purpose TEXT NOT NULL DEFAULT 'subscription',
    amount_fcfa INTEGER NOT NULL,
    channel TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    receipt_number TEXT,
    message TEXT,
    inscription_id UUID REFERENCES inscriptions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_paiements_utilisateur ON paiements(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_paiements_reference ON paiements(reference);
