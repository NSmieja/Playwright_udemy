const { test, expect } = require('@playwright/test');

// Section 5 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110482#overview


test("Child window handling", async ({ browser }) => {
    // primary page
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

    // link to a secondary page
    const documentLink = page.locator("[href*='https://rahulshettyacademy.com/documents-request']");
    const newPageText = "Please email us at mentor@rahulshettyacademy.com with below template to receive response";

    // clicking on the link to a new page (redirect to new window) and checking if the page has certain info

    // we need another context for another (secondary) page
    // we need 2 things to be done parallel:
    // 1. wait for the page to be redirected before assiginig it to a variable
    // 2. click on the redirect button
    // none of those things can be done before each one

    // now I need a new context for my new page which was opened in new window
    // statuses of primise: pending / rejected / fulfilled
    // with promise it will wait for all the steps to be fulfilled parallel 
    const [newPage] = await Promise.all(
        [
            context.waitForEvent("page"),  // listen for any new pages to open
            documentLink.click(),  // opens link to a new page in separate window
        ]
    )
    const textOnPage = await newPage.locator(".red").textContent();  // Note: css class is "im-para red" which means there are 2 classes: 'im-para' and 'red'
    console.log(textOnPage);

    // pulling out email address from paragraph text
    const domainName = textOnPage.split("@")[1].split(" ")[0].split(".")[0]; // we only want to extract domain name from the email
    console.log(domainName);
    await expect(newPage.locator(".im-para.red")).toHaveText(newPageText);

    // switching back to the main (parent) page to enter username into field
    await page.locator("#username").fill(domainName);
    console.log(await page.locator("#username").textContent());
});
