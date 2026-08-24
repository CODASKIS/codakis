-- Quiz intégrés au parcours cours (ordre + visibilité section)
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 100;
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS in_course_path BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE quiz SET sort_order = 100 WHERE sort_order IS NULL;
UPDATE quiz SET in_course_path = TRUE WHERE in_course_path IS NULL;
