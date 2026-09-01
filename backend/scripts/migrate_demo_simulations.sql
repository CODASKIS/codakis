-- Scènes de simulation de test sur leçons et questions existantes (idempotent)
-- Les blocs ne sont ajoutés que si data-codakis-simulation est absent.

UPDATE lecons
SET body = body || E'\n<h2>Simulation de conduite</h2><p>Circulation dense : repérez les priorités.</p><div data-codakis-simulation="heavy-traffic"></div>'
WHERE slug = 'signalisation-approfondissement'
  AND body NOT LIKE '%%data-codakis-simulation%%';

UPDATE lecons
SET body = body || E'\n<h2>Simulation de conduite</h2><p>Carrefour : priorité à droite et feux.</p><div data-codakis-simulation="intersection"></div>'
WHERE slug = 'priorites-approfondissement'
  AND body NOT LIKE '%%data-codakis-simulation%%';

UPDATE lecons
SET body = body || E'\n<h2>Simulation de conduite</h2><p>Scène urbaine : piétons et trafic.</p><div data-codakis-simulation="draft"></div>'
WHERE slug = 'circulation-introduction'
  AND body NOT LIKE '%%data-codakis-simulation%%';

UPDATE lecons
SET body = body || E'\n<h2>Simulation de conduite</h2><p>Virage serré : adaptez la vitesse.</p><div data-codakis-simulation="curve"></div>'
WHERE slug = 'vitesse-approfondissement'
  AND body NOT LIKE '%%data-codakis-simulation%%';

UPDATE lecons
SET body = body || E'\n<h2>Simulation de conduite</h2><p>Obstacles : choisissez la trajectoire.</p><div data-codakis-simulation="dodge"></div>'
WHERE slug = 'comportement-approfondissement'
  AND body NOT LIKE '%%data-codakis-simulation%%';

UPDATE lecons
SET body = body || E'\n<h2>Simulation de conduite</h2><p>Voie bloquée : ralentissez.</p><div data-codakis-simulation="blocked"></div>'
WHERE slug = 'signalisation-synthese'
  AND body NOT LIKE '%%data-codakis-simulation%%';

UPDATE lecons
SET body = body || E'\n<h2>Simulation de conduite</h2><p>Approche carrefour.</p><div data-codakis-simulation="intersection"></div>'
WHERE slug = 'priorites-introduction'
  AND body NOT LIKE '%%data-codakis-simulation%%';

UPDATE lecons
SET body = body || E'\n<h2>Simulation de conduite</h2><p>Trafic urbain et piétons.</p><div data-codakis-simulation="draft"></div>'
WHERE slug = 'circulation-approfondissement'
  AND body NOT LIKE '%%data-codakis-simulation%%';

UPDATE questions
SET prompt = prompt || E'\n\n<h2>Simulation interactive</h2><p>Visualisez le carrefour.</p><div data-codakis-simulation="intersection"></div>'
WHERE LOWER(prompt) LIKE '%%intersection%%'
  AND prompt NOT LIKE '%%data-codakis-simulation%%';

UPDATE questions
SET prompt = prompt || E'\n\n<h2>Simulation interactive</h2><p>Observez les piétons.</p><div data-codakis-simulation="draft"></div>'
WHERE (LOWER(prompt) LIKE '%%piéton%%' OR LOWER(prompt) LIKE '%%passage clouté%%')
  AND prompt NOT LIKE '%%data-codakis-simulation%%';

UPDATE questions
SET prompt = prompt || E'\n\n<h2>Simulation interactive</h2><p>Circulation dense.</p><div data-codakis-simulation="heavy-traffic"></div>'
WHERE LOWER(prompt) LIKE '%%panneau triangulaire%%'
  AND prompt NOT LIKE '%%data-codakis-simulation%%';

UPDATE questions
SET prompt = prompt || E'\n\n<h2>Simulation interactive</h2><p>Adaptez votre vitesse.</p><div data-codakis-simulation="curve"></div>'
WHERE LOWER(prompt) LIKE '%%vitesse maximale%%'
  AND prompt NOT LIKE '%%data-codakis-simulation%%';

UPDATE questions
SET prompt = prompt || E'\n\n<h2>Simulation interactive</h2><p>Priorité à droite.</p><div data-codakis-simulation="intersection"></div>'
WHERE LOWER(prompt) LIKE '%%prioritaire%%'
  AND prompt NOT LIKE '%%data-codakis-simulation%%';
