-- Réaligne les comptes candidats de démonstration :
--   candidat@demo.codakis.cm  → compte gratuit (pas d'abonnement plateforme), PAS d'inscription auto-école
--   premium@demo.codakis.cm   → abonnement premium + inscription Auto-École Volant Vert
--
-- Idempotent : safe to re-run on every API startup.
-- Usage : psql "$DATABASE_URL" -f scripts/migrate_demo_accounts.sql

-- candidat@demo : retirer un éventuel abonnement payant (garde la ligne pour éviter
-- un conflit de référence DEMO-SUB-* au prochain INSERT).
UPDATE paiements p
SET status = 'failed',
    message = 'Abonnement démo retiré — compte gratuit (2 thèmes CEMAC)'
FROM utilisateurs u
WHERE p.utilisateur_id = u.id
  AND u.email = 'candidat@demo.codakis.cm'
  AND p.purpose = 'subscription'
  AND p.status = 'completed';

-- premium@demo : garantir un abonnement premium completed
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
  )
  AND NOT EXISTS (
    SELECT 1 FROM paiements p
    WHERE p.reference = 'DEMO-SUB-' || substr(replace(u.id::text, '-', ''), 1, 8)
  );

-- Si la référence existe déjà (ex. statut failed), la réactiver en premium.
UPDATE paiements p
SET plan_id = 'premium',
    amount_fcfa = 15000,
    status = 'completed',
    completed_at = COALESCE(p.completed_at, NOW()),
    message = 'Abonnement premium de démonstration (accès plateforme CODAKIS)'
FROM utilisateurs u
WHERE p.utilisateur_id = u.id
  AND u.email = 'premium@demo.codakis.cm'
  AND p.reference = 'DEMO-SUB-' || substr(replace(u.id::text, '-', ''), 1, 8);

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

UPDATE paiements p
SET inscription_id = NULL
FROM inscriptions i, utilisateurs u
WHERE p.inscription_id = i.id
  AND i.candidat_id = u.id
  AND u.email = 'candidat@demo.codakis.cm';

DELETE FROM inscriptions i
USING utilisateurs u
WHERE i.candidat_id = u.id
  AND u.email = 'candidat@demo.codakis.cm';
