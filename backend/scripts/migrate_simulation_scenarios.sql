-- Scénarios de simulation de conduite (JSON persisté, génération IA admin)
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scenario_json JSONB NOT NULL,
    source VARCHAR(16) NOT NULL DEFAULT 'manual',
    created_by UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulation_scenarios_theme ON simulation_scenarios(theme_id);
