import { expect, type Page, test } from "@playwright/test";
import path from "node:path";

const JOB_ID = "11111111-1111-4111-8111-111111111111";
const CLEANED_URL = "http://localhost:8000/downloads/cleaned.csv";
const CSV_PATH = path.join(process.cwd(), "tests", "fixtures", "sample-sales.csv");

test("uploads a CSV, renders analysis, insights, and downloads cleaned CSV", async ({ page }) => {
  await authenticatePage(page);
  await mockBackend(page);
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(CSV_PATH);
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByText("Rows")).toBeVisible();
  await expect(page.getByText("4")).toBeVisible();
  await expect(page.getByText("Revenue grew in North")).toBeVisible();
  await expect(page.locator("article").filter({ hasText: "AI" })).toHaveCount(3);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download cleaned CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("cleaned");
});

/** Authenticate the browser session and return no content. */
async function authenticatePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("ai_analyst_access_token", "test-access-token");
    localStorage.setItem("ai_analyst_refresh_token", "test-refresh-token");
  });
}

/** Mock backend routes and return no content. */
async function mockBackend(page: Page): Promise<void> {
  await page.route("**/health", (route) => route.fulfill({ json: buildEnvelope({ service: "api", status: "ok" }) }));
  await page.route("**/api/v1/files/upload", (route) => route.fulfill({ json: buildEnvelope({ job_id: JOB_ID, status: "queued" }) }));
  await page.route(`**/api/v1/jobs/${JOB_ID}/status`, (route) => route.fulfill({ json: buildEnvelope(buildJobStatus()) }));
  await page.route("**/api/v1/insights/stream", (route) => route.fulfill({
    body: buildInsightStream(),
    contentType: "text/event-stream",
  }));
  await page.route(CLEANED_URL, (route) => route.fulfill({
    body: "region,revenue,units\nNorth,1200,10\n",
    contentType: "text/csv",
    headers: { "Content-Disposition": 'attachment; filename="cleaned.csv"' },
  }));
}

/** Build and return an API envelope. */
function buildEnvelope<TData>(data: TData): { data: TData; error: null; success: true } {
  return { data, error: null, success: true };
}

/** Build and return a completed job status payload. */
function buildJobStatus() {
  return { error_msg: null, job_id: JOB_ID, result_json: buildJobResult(), status: "done" };
}

/** Build and return a completed job result payload. */
function buildJobResult() {
  return {
    column_meta: { region: { dtype: "object" }, revenue: { dtype: "int64" }, units: { dtype: "int64" } },
    download_urls: { cleaned_csv: CLEANED_URL, original: "http://localhost:8000/downloads/original.csv" },
    filename: "sample-sales.csv",
    insights: [],
    job_id: JOB_ID,
    preview: [
      { region: "North", revenue: 1200, units: 10 },
      { region: "South", revenue: 900, units: 8 },
      { region: "West", revenue: 1500, units: 12 },
      { region: "East", revenue: 700, units: 6 },
    ],
    shape: [4, 3],
    status: "done",
  };
}

/** Build and return deterministic SSE insight events. */
function buildInsightStream(): string {
  return [
    buildInsightEvent("start", "1", "Revenue grew in North", "trend"),
    buildInsightEvent("chunk", "1", undefined, undefined, "North revenue leads the sample."),
    buildInsightEvent("start", "2", "South needs attention", "warning"),
    buildInsightEvent("chunk", "2", undefined, undefined, "South has lower sales velocity."),
    buildInsightEvent("start", "3", "Units track revenue", "info"),
    buildInsightEvent("chunk", "3", undefined, undefined, "Units and revenue move together."),
    buildInsightEvent("done"),
  ].join("");
}

/** Build and return one SSE event line. */
function buildInsightEvent(
  event: string,
  id?: string,
  headline?: string,
  kind?: string,
  body?: string,
): string {
  return `data: ${JSON.stringify({ body, event, headline, id, kind })}\n\n`;
}
