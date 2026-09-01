-- Retire les blocs simulation des leçons et questions (idempotent)
UPDATE lecons
SET body = regexp_replace(body, E'\n<h2>Simulation de conduite</h2><p>[^<]+</p><div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE body LIKE '%data-codakis-simulation%';

UPDATE questions
SET prompt = regexp_replace(prompt, E'\n\n<h2>Simulation interactive</h2><p>[^<]+</p><div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE prompt LIKE '%data-codakis-simulation%';

UPDATE questions
SET prompt = regexp_replace(prompt, E'<h2>Simulation interactive</h2><p>[^<]+</p><div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE prompt LIKE '%data-codakis-simulation%';

UPDATE lecons
SET body = regexp_replace(body, '<div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE body LIKE '%data-codakis-simulation%';

UPDATE lecons
SET body = regexp_replace(body, '<div data-codakis-simulation-ref="[^"]+"></div>', '', 'g')
WHERE body LIKE '%data-codakis-simulation-ref%';

UPDATE questions
SET prompt = regexp_replace(prompt, '<div data-codakis-simulation="[^"]+"></div>', '', 'g')
WHERE prompt LIKE '%data-codakis-simulation%';

UPDATE questions
SET prompt = regexp_replace(prompt, '<div data-codakis-simulation-ref="[^"]+"></div>', '', 'g')
WHERE prompt LIKE '%data-codakis-simulation-ref%';
