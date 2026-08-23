type Listener = () => void;

let generation = 0;
let readyGeneration = -1;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** Nouvelle navigation — le loader reste affiché. */
export function beginPageLoad(): void {
  generation += 1;
  readyGeneration = -1;
  notify();
}

/** Contenu dashboard prêt (shell + widgets + graphiques). */
export function markPageReady(): void {
  readyGeneration = generation;
  notify();
}

export function isPageReady(): boolean {
  return readyGeneration === generation;
}

export function subscribePageReady(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
