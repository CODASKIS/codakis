-- Pièces du dossier Consort (PostgreSQL)
CREATE TABLE IF NOT EXISTS pieces_consort (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers_administratifs(id) ON DELETE CASCADE,
    piece_key VARCHAR(32) NOT NULL,
    statut VARCHAR(16) NOT NULL DEFAULT 'missing',
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_piece_dossier_key UNIQUE (dossier_id, piece_key)
);

-- Initialiser les 6 pièces pour les dossiers existants sans pièces
INSERT INTO pieces_consort (id, dossier_id, piece_key, statut)
SELECT gen_random_uuid(), d.id, piece.key, 'missing'
FROM dossiers_administratifs d
CROSS JOIN (
    VALUES ('id'), ('birth'), ('medical'), ('photos'), ('address'), ('stamps')
) AS piece(key)
WHERE NOT EXISTS (
    SELECT 1 FROM pieces_consort p WHERE p.dossier_id = d.id
)
ON CONFLICT DO NOTHING;
