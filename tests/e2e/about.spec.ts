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

  await stage.scrollIntoViewIfNeeded();
  await expect(stage.getByRole("heading", { name: "Hack Canada" })).toBeVisible();
  await expect(
    stage.getByRole("heading", { name: "Hackathons Canada" })
  ).toBeHidden();
  await expect(
    sectionNav.getByRole("button", { name: "Hack Canada" })
  ).toHaveAttribute("aria-current", "true");
  await expect(stage.getByText("Hours of hacking")).toBeVisible();

  await sectionNav.getByRole("button", { name: "Hackathons Canada" }).click();
  await expect(
    stage.getByRole("heading", { name: "Hackathons Canada" })
  ).toBeVisible();
  await expect(stage.getByRole("heading", { name: "Hack Canada" })).toBeHidden();
  await expect(
    sectionNav.getByRole("button", { name: "Hackathons Canada" })
  ).toHaveAttribute("aria-current", "true");

  await sectionNav
    .getByRole("button", { name: "Hackathons North America" })
    .click();
  await expect(
    stage.getByRole("heading", { name: "Hackathons North America" })
  ).toBeVisible();
  await expect(
    sectionNav.getByRole("button", { name: "Hackathons North America" })
  ).toHaveAttribute("aria-current", "true");
});
