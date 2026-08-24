-- Réaligne les comptes candidats de démonstration :
--   candidat@demo.codakis.cm  → abonnement plateforme payé, PAS d'inscription auto-école
--   premium@demo.codakis.cm   → abonnement + inscription Auto-École Volant Vert
--
-- Usage : psql "$DATABASE_URL" -f scripts/migrate_demo_accounts.sql

BEGIN;

-- Abonnement plateforme pour candidat@demo (Pro)
INSERT INTO paiements (
    id, reference, utilisateur_id, purpose, plan_id, amount_fcfa, channel, phone,
    status, completed_at, message, created_at
)
SELECT
    gen_random_uuid(),
    'DEMO-SUB-' || substr(replace(u.id::text, '-', ''), 1, 8),
    u.id,
    'subscription',
    'pro',
    5000,
    'demo',
    '+237600000000',
    'completed',
    NOW(),
    'Abonnement pro de démonstration (accès plateforme CODAKIS)',
    NOW()
FROM utilisateurs u
WHERE u.email = 'candidat@demo.codakis.cm'
  AND NOT EXISTS (
    SELECT 1 FROM paiements p
    WHERE p.utilisateur_id = u.id
      AND p.purpose = 'subscription'
      AND p.status = 'completed'
  );

UPDATE paiements p
SET plan_id = 'pro', amount_fcfa = 5000, status = 'completed',
    message = 'Abonnement pro de démonstration (accès plateforme CODAKIS)'
FROM utilisateurs u
WHERE p.utilisateur_id = u.id
  AND u.email = 'candidat@demo.codakis.cm'
  AND p.purpose = 'subscription'
  AND p.status = 'completed';

-- Abonnement plateforme pour premium@demo (Premium)
INSERT INTO paiements (
    id, reference, utilisateur_id, purpose, plan_id, amount_fcfa, channel, phone,
    status, completed_at, message, created_at
)
SELECT
    gen_random_uuid(),
    'DEMO-SUB-' || substr(replace(u.id::text, '-', ''), 1, 8),
    u.id,
    'subscription',
    'premium',
    15000,
    'demo',
    '+237600000000',
    'completed',
    NOW(),
    'Abonnement premium de démonstration (accès plateforme CODAKIS)',
    NOW()
FROM utilisateurs u
WHERE u.email = 'premium@demo.codakis.cm'
  AND NOT EXISTS (
    SELECT 1 FROM paiements p
    WHERE p.utilisateur_id = u.id
      AND p.purpose = 'subscription'
      AND p.status = 'completed'
  );

UPDATE paiements p
SET plan_id = 'premium', amount_fcfa = 15000, status = 'completed',
    message = 'Abonnement premium de démonstration (accès plateforme CODAKIS)'
FROM utilisateurs u
WHERE p.utilisateur_id = u.id
  AND u.email = 'premium@demo.codakis.cm'
  AND p.purpose = 'subscription'
  AND p.status = 'completed';

-- Retirer l'inscription auto-école du candidat « code seul » (Luc Ngono)
DELETE FROM seances_pratiques sp
USING inscriptions i, utilisateurs u
WHERE sp.inscription_id = i.id
  AND i.candidat_id = u.id
  AND u.email = 'candidat@demo.codakis.cm';

DELETE FROM inscriptions i
USING utilisateurs u
WHERE i.candidat_id = u.id
  AND u.email = 'candidat@demo.codakis.cm';

COMMIT;
