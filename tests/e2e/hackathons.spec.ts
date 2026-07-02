import { expect, test } from "@playwright/test";

test("opens the hackathons browse page from the home nav", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Hackathons", exact: true })
    .click();

  await expect(page).toHaveURL(/\/hackathons$/);
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" })
  ).toBeVisible();
  await expect(page.getByText("Where").first()).toBeVisible();
  await expect(page.getByText("When").first()).toBeVisible();
  await expect(page.getByText("Theme").first()).toBeVisible();
  await expect(page.getByText("Team").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Search hackathons" })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Browse events" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hack the North" })
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(18);

  await page.locator("summary").filter({ hasText: "Where" }).click();
  await expect(page.getByText("Suggested locations")).toBeVisible();
});
