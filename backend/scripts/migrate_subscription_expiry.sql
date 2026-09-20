-- Colonnes abonnement / confirmation fournisseur / rappels d'expiration
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS billing_period TEXT;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS provider_checkout_id TEXT;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS reminder_7d_sent_at TIMESTAMPTZ;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS reminder_3d_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_paiements_expires_at ON paiements(expires_at)
  WHERE purpose = 'subscription' AND status = 'completed';

-- OTP : hash SHA-256 (64 hex) + compteur de tentatives
ALTER TABLE codes_verification ALTER COLUMN code TYPE VARCHAR(128);
ALTER TABLE codes_verification ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
