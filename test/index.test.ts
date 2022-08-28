import { expect, test } from "@playwright/test"

test("worker", async ({ page }) => {
  await page.goto("http://localhost:3001")
  for (let i = 0; i < 10; i++) {
    const eleId = `#worker-result-${i}`
    await page.waitForSelector(eleId)

    const workerResult = await page.$(eleId)

    expect(await workerResult?.textContent()).toBe(String(i * 2 + 2))
  }

})
