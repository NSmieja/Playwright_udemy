const { test, expect } = require('@playwright/test');

// TESTS WITH DATA FROM .env FILE MUST BE RUN VIA THE TERMINAL 
// using .env file - https://medium.com/@dlasanthax/how-to-use-env-files-in-playwright-beb635bf90e8
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../1_udemy/.env' });  // or just dotenv.config(); if it is in the same location
// dotenv.config({ path: path.resolve(__dirname, '../1_udemy/.env') });

const email = process.env.EMAIL;
const password = process.env.PASSWORD;
// console.log("EMAIL:", process.env.EMAIL);
// console.log("PASSWORD:", process.env.PASSWORD);
console.log("Resolved .env path:", path.resolve(__dirname, '../1_udemy/.env'));


// commend to run the test in terminal: npx playwright test tests/01_client_app.spec.js 


// Section 4, no. 15 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110360#overview

test("My attempt to extract data after login", async ({ page }) => {
    // console.log("EMAIL:", process.env.EMAIL);
    // console.log("PASSWORD:", process.env.PASSWORD);

    // await page.goto("https://rahulshettyacademy.com/client/auth/login");
    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator("#userEmail").fill(email);  // may use email: "jane.doe@example.com" instead .env data
    await page.fill("#userPassword", password);  // may use password: "Password1" instead .env data
    await page.locator("[name='login']").click();

    // 1. method for waiting for the page to load all content (can be fluky)
    await page.waitForLoadState("networkidle");

    const cardTitlesLocator = page.locator(".card-body b");

    // 2. method for waiting for the page to load all desired content 
    await cardTitlesLocator.last().waitFor();

    const allTitles = await cardTitlesLocator.allTextContents();
    console.log("☑️ All product titles:", allTitles);
    expect(allTitles).toContain("IPHONE 13 PRO");  // NOTE: list of products may have changed
});


test("My second attempt (revision) to extract data after login", async ({ page }) => {
    // console.log("EMAIL:", process.env.EMAIL);
    // console.log("PASSWORD:", process.env.PASSWORD);

    await page.goto("https://rahulshettyacademy.com/client");
    await page.getByPlaceholder("email@example.com").fill(email);   // may use email: "jane.doe@example.com" instead .env data
    await page.locator('[type="password"]').fill(password);   // may use password: "Password1" instead .env data
    await page.locator('[name="login"]').click();

    // await page.waitForLoadState("networkidle");  // NOTE: not always reliable, better use below one method
    await page.locator(".card-body").last().waitFor()
    console.log("Number of elements:", await page.locator(".card-body").count());
    console.log("Product titles:", await page.locator(".card-body h5 b").allTextContents());
    console.log("First product name:", await page.locator(".card-body b").first().textContent());
});


test('From the course: @Web Client App login', async ({ page }) => {
    //js file- Login js, DashboardPage
    const email = "anshika@gmail.com";
    const productName = 'ZARA COAT 3';
    const products = page.locator(".card-body");
    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator("#userEmail").fill(email);
    await page.locator("#userPassword").fill("Iamking@000");
    await page.locator("[value='Login']").click();
    await page.waitForLoadState('networkidle');
    await page.locator(".card-body b").first().waitFor();
    const titles = await page.locator(".card-body b").allTextContents();
    console.log(titles);

    const count = await products.count();
    for (var i = 0; i < count; i++) {
        if (await products.nth(i).locator("b").textContent() === productName) {
            // add to cart
            await products.nth(i).locator("text= Add to Cart").click();
            break;
        }
    };
});
