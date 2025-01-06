const { test, expect } = require("@playwright/test")

// Section 11 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110842#overview
// Saving browser Storage data in .json file after login through UI first, to re-use cookies, local storage data etc. in all tests (with just one initial login to get the storage data from browser)


let webContext;


test.beforeAll(async ({ browser }) => {
    // NOTE! We neet to set cookies for the whole browser, not only for a single page, so we need to use context for the browser not the fixture page itself
    const context = await browser.newContext();  // NOTE! We need to use browser context level and not page level here!
    const page = await context.newPage();

    // login with using UI and not API:
    const email = "anshika@gmail.com";
    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator("#userEmail").fill(email);
    await page.locator("#userPassword").fill("Iamking@000");
    await page.locator("[value='Login']").click();
    await page.waitForLoadState('networkidle');

    // storing browser data inside json file
    const filepath = "./utils/state.json";
    await context.storageState({ path: filepath });  // this method will capture all storage data created in the browser when login 

    // invoking browser with full storage by injecting data from .json file
    webContext = await browser.newContext({ storageState: filepath });
})


test("SCENARIO: Login to the page with products", async () => {
    // creating a page with the full browser storage injected (instead of page fixture)
    const page = await webContext.newPage();  // no need to login with credentials as we use browser with full storage data

    // proceeding with test
    await page.goto("https://rahulshettyacademy.com/client");

    await page.locator(".card-body b").first().waitFor();
    console.log("Number of elements:", await page.locator(".card-body").count());
    console.log("First product name:", await page.locator(".card-body b").first().textContent());
    console.log("Product titles:", await page.locator(".card-body h5 b").allTextContents());
});


test("SCENARIO: Adding a product to the cart", async () => {
    // creating a page with the full browser storage injected (instead of page fixture)
    const page = await webContext.newPage();  // no need to login with credentials as we use browser with full storage data

    // proceeding with test
    await page.goto("https://rahulshettyacademy.com/client");

    await page.locator(".card-body b").last().waitFor();
    const product = "IPHONE 13 PRO";
    const allProducts = await page.locator(".card-body b").allTextContents();
    for (var i = 1; i < allProducts.length; i++) {
        console.log(`'${allProducts[i]}'`);
        if (allProducts[i].toLowerCase() === product.toLowerCase()) {
            await page.getByText(" Add to Cart").nth(i).click();
            break
        }
    };
    await expect(page.locator(".btn-custom label")).toBeVisible();
    await expect(page.locator(".btn-custom label")).toHaveText("1");
});