const PLOTLY_SCRIPT_ID = "plotly-cdn-script";
const PLOTLY_SCRIPT_URL = "https://cdn.plot.ly/plotly-2.35.3.min.js";

let plotlyLoadPromise: Promise<BrowserPlotly> | null = null;

/** Preload Plotly and return no content. */
export function preloadPlotly(): void {
  void loadPlotly();
}

/** Load Plotly from CDN and return the browser API. */
export async function loadPlotly(): Promise<BrowserPlotly> {
  if (window.Plotly) {
    return window.Plotly;
  }

  plotlyLoadPromise = plotlyLoadPromise ?? loadPlotlyScript();
  return plotlyLoadPromise;
}

/** Load the Plotly script and return the browser API. */
function loadPlotlyScript(): Promise<BrowserPlotly> {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(PLOTLY_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      resolveExistingScript(existingScript, resolve, reject);
      return;
    }

    const script = document.createElement("script");
    script.id = PLOTLY_SCRIPT_ID;
    script.src = PLOTLY_SCRIPT_URL;
    script.onload = () => resolveLoadedPlotly(resolve, reject);
    script.onerror = () => reject(new Error("Plotly script failed."));
    document.head.appendChild(script);
  });
}

/** Resolve an existing Plotly script and return no content. */
function resolveExistingScript(script: HTMLScriptElement, resolve: (plotly: BrowserPlotly) => void, reject: (reason: Error) => void): void {
  if (window.Plotly) {
    resolve(window.Plotly);
    return;
  }

  script.addEventListener("load", () => resolveLoadedPlotly(resolve, reject), { once: true });
  script.addEventListener("error", () => reject(new Error("Plotly script failed.")), { once: true });
}

/** Resolve the loaded Plotly object and return no content. */
function resolveLoadedPlotly(resolve: (plotly: BrowserPlotly) => void, reject: (reason: Error) => void): void {
  if (window.Plotly) {
    resolve(window.Plotly);
    return;
  }

  reject(new Error("Plotly failed to load."));
}
