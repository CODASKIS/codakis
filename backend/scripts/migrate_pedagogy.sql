-- Contenu pédagogique CEMAC : thèmes, leçons, questions, quiz et examens
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) UNIQUE NOT NULL,
    title_fr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lecons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    slug VARCHAR(220) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    excerpt TEXT,
    cover_image_url TEXT,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    author_id UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    image_url TEXT,
    explanation TEXT,
    difficulty SMALLINT NOT NULL DEFAULT 1,
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE quiz ADD COLUMN IF NOT EXISTS duree_minutes SMALLINT NOT NULL DEFAULT 10;

CREATE TABLE IF NOT EXISTS reponses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    label VARCHAR(4) NOT NULL,
    texte TEXT NOT NULL,
    est_correcte BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    UNIQUE (question_id, label)
);

CREATE TABLE IF NOT EXISTS quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    question_count SMALLINT NOT NULL DEFAULT 10,
    duree_minutes SMALLINT NOT NULL DEFAULT 10,
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    quiz_id UUID NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (quiz_id, question_id)
);

CREATE TABLE IF NOT EXISTS examens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duree_minutes SMALLINT NOT NULL DEFAULT 30,
    nb_questions SMALLINT NOT NULL DEFAULT 40,
    max_erreurs SMALLINT NOT NULL DEFAULT 5,
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS examen_questions (
    examen_id UUID NOT NULL REFERENCES examens(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (examen_id, question_id)
);

CREATE TABLE IF NOT EXISTS tentatives_quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidat_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
    score SMALLINT NOT NULL,
    nb_correctes SMALLINT NOT NULL,
    nb_total SMALLINT NOT NULL,
    reussi BOOLEAN NOT NULL DEFAULT FALSE,
    reponses_json JSONB NOT NULL DEFAULT '[]',
    termine_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tentatives_examen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidat_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    examen_id UUID NOT NULL REFERENCES examens(id) ON DELETE CASCADE,
    score SMALLINT NOT NULL,
    nb_erreurs SMALLINT NOT NULL,
    reussi BOOLEAN NOT NULL DEFAULT FALSE,
    duree_sec INTEGER,
    reponses_json JSONB NOT NULL DEFAULT '[]',
    termine_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
