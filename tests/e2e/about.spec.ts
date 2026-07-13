import { expect, test } from "@playwright/test";

test("pins the about showcase and swaps sections on scroll", async ({ page }) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", {
      name: "We build the hackathon ecosystem we wanted as students.",
    })
  ).toBeVisible();

  const stage = page.locator("[data-about-stage]");
  const sectionNav = page.getByRole("navigation", { name: "About sections" });
  const scrollHint = page.locator("[data-about-scroll-hint]");

  await stage.scrollIntoViewIfNeeded();

  // HC25 is the first (active) section by default.
  await expect(
    sectionNav.getByRole("button", { name: "HC25" })
  ).toHaveAttribute("aria-current", "true");
  await expect(scrollHint).toHaveCount(1);

  await sectionNav
    .getByRole("button", { name: "HNA" })
    .click();
  await expect(
    sectionNav.getByRole("button", { name: "HNA" })
  ).toHaveAttribute("aria-current", "true");
  await expect(scrollHint).toHaveCount(0);

  await sectionNav.getByRole("button", { name: "Corporate" }).click();
  await expect(
    sectionNav.getByRole("button", { name: "Corporate" })
  ).toHaveAttribute("aria-current", "true");
});
