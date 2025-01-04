const { test, expect } = require('@playwright/test');

// Section 5 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110404#overview

// +see: 05 (file), section 8 (udemy)
test("UI Controls", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    await page.locator("#username").fill("rahulshettyacademy");
    await page.locator("[type='password']").fill("learning");

    // dropdown list
    // const dropdown = page.locator('[css="3"]');  // or
    const dropdown = page.locator("select.form-control");
    await dropdown.selectOption("teach");
    // assertion (from chatgpt)
    expect(await dropdown.locator('option:checked').textContent()).toBe("Teacher");

    // radio buttons
    // await page.locator("[value='user']").click();  // or 
    await page.locator(".radiotextsty").last().click();
    await page.locator("#okayBtn").click();
    // assertion for radio button
    console.log(await page.locator("[value='user']").isChecked());
    await expect(page.locator("[value='user']")).toBeChecked();

    // checkbox
    await page.locator("#terms").click();
    // assertion for checked box
    await expect(page.locator("#terms")).toBeChecked();  // or
    expect(await page.locator("#terms").isChecked()).toBeTruthy();
    // assertion for not checked box
    await page.locator("#terms").uncheck();
    await expect(page.locator("#terms")).not.toBeChecked();
    expect(await page.locator("#terms").isChecked()).toBeFalsy();

    // blinking text on the page
    const documentLink = page.locator("[href*='https://rahulshettyacademy.com/documents-request']");
    // there is no method to determine if it is blinking or not
    await expect(documentLink).toHaveAttribute("class", "blinkingText");
});
