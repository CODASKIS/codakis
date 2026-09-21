-- Forfaits mensuels : durée de validité et échéance de l'inscription (idempotent)
ALTER TABLE forfaits ADD COLUMN IF NOT EXISTS duree_mois INTEGER NOT NULL DEFAULT 1;

ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS reminder_7d_sent_at TIMESTAMPTZ;
ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS reminder_3d_sent_at TIMESTAMPTZ;

-- Les inscriptions déjà payées reçoivent une échéance calculée depuis leur forfait.
-- Le GREATEST garantit au moins 7 jours pour renouveler : personne n'expire rétroactivement.
UPDATE inscriptions AS i
SET expires_at = GREATEST(
      i.enrolled_at + (COALESCE(f.duree_mois, 1) || ' month')::interval,
      now() + INTERVAL '7 days'
    )
FROM forfaits AS f
WHERE i.forfait_id = f.id AND i.expires_at IS NULL;

UPDATE inscriptions
SET expires_at = GREATEST(enrolled_at + INTERVAL '1 month', now() + INTERVAL '7 days')
WHERE expires_at IS NULL;
