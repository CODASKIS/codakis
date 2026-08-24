CREATE TABLE IF NOT EXISTS lecon_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidat_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    lecon_id UUID NOT NULL REFERENCES lecons(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (candidat_id, lecon_id)
);

CREATE INDEX IF NOT EXISTS idx_lecon_progress_candidat ON lecon_progress(candidat_id);
