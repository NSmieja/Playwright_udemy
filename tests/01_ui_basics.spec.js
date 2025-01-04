const { test, expect } = require('@playwright/test');

// Section 3.7+ (udemy)

test("Fixture: browser", async function ({ browser }) {
    // browser - plugins / cookies / proxy / other things I can inject to the context
    const context = await browser.newContext();  // creates browser instance in incognito mode 
    const page = await context.newPage();  // creates new page
    await page.goto("https://playwright.dev/docs/intro")  // going to given url
});

test("Test title exists", async ({ page }) => {
    await page.goto("https://www.google.com/");
    let pageTitle = await page.title();
    console.log(pageTitle);
    await expect(page).toHaveTitle("Google");
});


// Section 4 (udemy)

test("Extracting data from page after login", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/")  // going to given url

    // css, xpath - to identify elements on the webpage
    // signing user (with incorrect username)
    await page.locator("#username").fill("rahulshetty");  // correct username is rahulshettyacademy
    // await page.locator("[type='password']").fill("learning");
    await page.locator(".form-control").nth(1).fill("learning");
    await page.locator("#signInBtn").click();

    // validating error message with incorrect username given
    const locator = page.locator("[style*='block']");  // error popup
    console.log(await locator.textContent());  // (with auto-wait mechanism)
    await expect(locator).toHaveText("Incorrect username/password.");


    // signing user (with correct username)
    const username = page.locator("#username");
    await username.fill("");  // erasing content of the form from previous use 
    await username.fill("rahulshettyacademy");
    // await page.locator("[type='password']").fill("learning");  // I already entered password in line 17
    await page.locator("#signInBtn").click();

    // validating if first item on the page is 'iphone X' (https://rahulshettyacademy.com/angularpractice/shop)
    const cardTitles = page.locator(".card-body a");
    await page.waitForSelector(".card-body a");           // NOTE: if I will not wait for it, the count will be 0 instead of 4 and the list will be empty (it is not)
    console.log(await cardTitles.allTextContents());      // should not be []
    console.log(await cardTitles.count());                // should be 4 (not 0)
    console.log(await cardTitles.first().textContent());  // first element of the list (with auto-wait mechanism)
    console.log(await cardTitles.nth(1).textContent());   // second element of the list (with auto-wait mechanism)
    await expect(cardTitles.nth(0)).toHaveText("iphone X");
    await expect(page.locator(".card-title").first()).toHaveText("iphone X");

    // extracting the list of all products on the page
    // !! NOTE!!!! the method .allTextContents() does not have build in wait mechanism
    // !! https://playwright.dev/docs/actionability
    // !! It will give us false [] result if we will not call any other method with auto-wait mechanism before calling this method
    const allTitles = await cardTitles.allTextContents();  // result: [ 'iphone X', 'Samsung Note 8', 'Nokia Edge', 'Blackberry' ]
    console.log(allTitles);

    // there are 2 ways of dealing with page not loading desired content before performing test:
    // 1) method for waiting for the page to load all content (BUT it can be fluky)
    await page.waitForLoadState("networkidle");
    // 2) method for waiting for the page to load all desired content 
    await cardTitles.last().waitFor();
    // and then perform the assertion
    // assertion code here
});
