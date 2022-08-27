import { expect, test } from "@playwright/test"

test("worker", async ({ page }) => {
  await page.goto("http://localhost:3001")
  await page.waitForSelector("#worker-result")

  const workerResult = await page.$("#worker-result")

  expect(await workerResult?.textContent()).toBe("11")

})
