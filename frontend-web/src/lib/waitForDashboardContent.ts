function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForDocumentReady(): Promise<void> {
  if (document.readyState === "complete") return;
  await new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

/** Pages publiques — document + polices + premier rendu. */
export async function waitForPublicPageReady(): Promise<void> {
  await waitForDocumentReady();
  await document.fonts.ready.catch(() => undefined);
  await nextPaint();
}
