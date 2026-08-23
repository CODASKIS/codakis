const POLL_MS = 48;
const SHELL_TIMEOUT_MS = 6000;
const CONTENT_TIMEOUT_MS = 10000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForCondition(test: () => boolean, timeoutMs: number): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (test()) return;
    await sleep(POLL_MS);
  }
}

async function waitForDocumentReady(): Promise<void> {
  if (document.readyState === "complete") return;
  await new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

async function waitForImages(root: ParentNode): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

/**
 * Attend le shell DashboardKit (Bootstrap), le contenu de page et les graphiques ApexCharts.
 */
export async function waitForDashboardReady(contentRoot: HTMLElement | null): Promise<void> {
  await waitForDocumentReady();
  await document.fonts.ready.catch(() => undefined);
  await sleep(0);

  await waitForCondition(() => document.body.classList.contains("dashboardkit-active"), SHELL_TIMEOUT_MS);

  await waitForCondition(
    () => Boolean(document.querySelector(".pc-sidebar")) && Boolean(document.querySelector(".pc-container")),
    SHELL_TIMEOUT_MS,
  );

  if (contentRoot) {
    await waitForCondition(() => contentRoot.childElementCount > 0, CONTENT_TIMEOUT_MS);
  }

  await nextPaint();

  if (contentRoot) {
    const chartSlots = contentRoot.querySelectorAll(".codakis-chart-wrap, .codakis-pie-card__chart");

    if (chartSlots.length > 0) {
      await waitForCondition(() => {
        const canvases = contentRoot.querySelectorAll(".apexcharts-canvas");
        return canvases.length >= chartSlots.length;
      }, CONTENT_TIMEOUT_MS);
    } else {
      await waitForCondition(
        () => Boolean(contentRoot.querySelector(".card, .row, .table")),
        CONTENT_TIMEOUT_MS,
      );
    }

    await waitForImages(contentRoot);
  }

  await nextPaint();
}

/** Pages publiques — document + polices + premier rendu. */
export async function waitForPublicPageReady(): Promise<void> {
  await waitForDocumentReady();
  await document.fonts.ready.catch(() => undefined);
  await nextPaint();
}
