const { test, expect } = require("@playwright/test")

// Section 9 (udemy) -  https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110666#overview


test("Navigating between pages", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await page.goto("https://google.com");
    await page.goBack();
    await page.goForward();
})


test("Validating hidden and visible elements on the page", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await expect(page.locator("#displayed-text")).toBeVisible();
    await page.locator("#hide-textbox").click();
    await expect(page.locator("#displayed-text")).toBeHidden();

});


// https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110670#overview
test("Handling JAVA popups (dialogs)", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");

    // setting listener on JAVA popup (dialog) window with action to click OK (.accept()) when it will shown up (to click Cancel use .dismiss() method instead)
    // NOTE: first you must set a listener (page.on() method) who will listen if given action occure, and then click on button that will trigger that action
    page.on("dialog", dialog => dialog.accept());   // clicking on JAVA popup window on OK button, if it will occure
    await page.locator("#confirmbtn").click();      // triggering the popup window to show up
});


test("Hovering", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await expect(page.locator(".mouse-hover-content a").first()).not.toBeVisible();

    await page.locator("#mousehover").hover();
    await expect(page.locator(".mouse-hover-content a").first()).toBeVisible();
});


// https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110680#overview
test("Testing frames (parent - child frames - iframe / frameset tag)", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");

    // we can check if on the page is tag named iframe or frameset

    // switching to the child frame by frame name or frame id
    // creating a framePage const with child frame loactor
    const framePage = page.frameLocator("#courses-iframe");
    // to use the child frame object (framePage) instead of main frame object (page) 
    await framePage.locator("li a[href*='lifetime-access']:visible").click();  // li is from parent css, a is a tag of desired locator, href is attribute name from desired locator, visible is to select only visible element on the page
    expect(await framePage.locator(".text").first().locator("h2 span").textContent()).toBe("13,522");  // or
    expect(await framePage.locator(".text h2").first().textContent()).toContain("13,522");  // or
    expect(await framePage.locator("h2").first().textContent()).toContain("13,522");

    // extracting user number from whole header text (alternative way)
    const fullText = await framePage.locator(".text h2").first().textContent();
    const userNumber = fullText.split(" ")[1].trim();
    console.log("☑️ User number:", userNumber);
    expect(userNumber).toBe("13,522");
});
