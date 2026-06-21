import { test, expect } from "@playwright/test";

/**
 * Helper: creates a poll and navigates to its page.
 * Returns once we're on /polls/<slug>.
 */
async function createPoll(
  page: any,
  question: string,
  options: string[],
  hideResults = false
) {
  await page.goto("/");
  await page.fill('input[name="question"]', question);

  const optionInputs = page.locator('input[name="option"]');
  for (let i = 0; i < options.length; i++) {
    if (i >= 2) {
      await page.click('button:has-text("Add option")');
    }
    await optionInputs.nth(i).fill(options[i]);
  }

  if (hideResults) {
    await page.check("#hideResults");
  }

  await Promise.all([
    page.waitForURL(/\/polls\/[a-zA-Z0-9_-]{6}$/),
    page.click('button:has-text("Create")'),
  ]);
}

test.describe("Ranked Poll E2E Journeys", () => {
  test("should create a new poll, vote on it, and see results", async ({ page }) => {
    // 1. Create poll
    await createPoll(page, "E2E Test Poll", ["JavaScript", "TypeScript"]);

    // 2. Verify we're on the Vote Page — the rank button is present
    await expect(page.locator('[aria-label="Rank JavaScript"]')).toBeVisible();

    // 3. Rank the first option by clicking its labeled + button
    await page.click('[aria-label="Rank JavaScript"]');
    await expect(page.locator("text=1 ranked")).toBeVisible();

    // 4. Submit ballot and wait for results to appear
    await Promise.all([
      page.waitForResponse((res: any) => res.url().includes("submitVoteAction") || res.status() === 200),
      page.click('button:has-text("Submit Ballot")'),
    ]);

    // 5. After router.refresh(), ResultsDisplay is shown — look for "Results Calculated"
    await expect(page.getByText("Results Calculated")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("ballot cast")).toBeVisible();
  });

  test("should allow changing a vote after submission", async ({ page }) => {
    // 1. Create, vote, and confirm results are shown
    await createPoll(page, "Change Vote Test", ["Option A", "Option B"]);
    await page.click('[aria-label="Rank Option A"]');
    await page.click('button:has-text("Submit Ballot")');
    await expect(page.getByText("Results Calculated")).toBeVisible({ timeout: 15000 });

    // 2. Click Change Vote — should append ?action=vote to URL
    await page.click('button:has-text("Change Vote")');
    await expect(page).toHaveURL(/.*\?action=vote/);

    // 3. We should be back on the voting form
    await expect(page.locator('[aria-label="Rank Option A"]')).toBeVisible();
  });

  test("should respect 'Hide results until closed' setting for non-creators", async ({ page, browser }) => {
    // 1. Create a private poll
    await createPoll(page, "Private E2E Poll", ["React", "Vue"], true);
    const pollUrl = page.url();

    // 2. New browser context = separate user (no shared cookies/localStorage)
    const voterContext = await browser.newContext();
    const voterPage = await voterContext.newPage();
    await voterPage.goto(pollUrl);

    // 3. Rank and submit
    await voterPage.click('[aria-label="Rank React"]');
    await voterPage.click('button:has-text("Submit Ballot")');

    // 4. Should see privacy notice, NOT the results tabs
    await expect(
      voterPage.getByRole("heading", { name: "Results are Private" })
    ).toBeVisible({ timeout: 15000 });
    await expect(voterPage.getByRole("tab", { name: "Overview" })).not.toBeVisible();

    await voterContext.close();
  });
});
