ALTER TABLE paiements ADD COLUMN IF NOT EXISTS commission_fcfa INTEGER;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS school_payout_fcfa INTEGER;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS commission_rate_pct INTEGER;
