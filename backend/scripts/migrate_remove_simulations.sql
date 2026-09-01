-- Retire les blocs simulation des leçons et questions (idempotent)
-- Pas de LIKE '%...%' : psycopg interprète % comme placeholder via exec_driver_sql
UPDATE lecons
SET body = regexp_replace(body, E'\n<h2>Simulation de conduite</h2><p>[^<]+</p><div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE position('data-codakis-simulation' in body) > 0;

UPDATE questions
SET prompt = regexp_replace(prompt, E'\n\n<h2>Simulation interactive</h2><p>[^<]+</p><div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE position('data-codakis-simulation' in prompt) > 0;

UPDATE questions
SET prompt = regexp_replace(prompt, E'<h2>Simulation interactive</h2><p>[^<]+</p><div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE position('data-codakis-simulation' in prompt) > 0;

UPDATE lecons
SET body = regexp_replace(body, '<div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE position('data-codakis-simulation' in body) > 0;

UPDATE lecons
SET body = regexp_replace(body, '<div data-codakis-simulation-ref="[^"]+"></div>', '', 'g')
WHERE position('data-codakis-simulation-ref' in body) > 0;

UPDATE questions
SET prompt = regexp_replace(prompt, '<div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE position('data-codakis-simulation' in prompt) > 0;

UPDATE questions
SET prompt = regexp_replace(prompt, '<div data-codakis-simulation-ref="[^"]+"></div>', '', 'g')
WHERE position('data-codakis-simulation-ref' in prompt) > 0;
