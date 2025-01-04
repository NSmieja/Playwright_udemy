const { test, expect } = require('@playwright/test');
const { escape } = require('querystring');

// Section 8, no. 39 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/42325460#overview


test("SCENARIO: Calendar validations", async ({ page }) => {
    const url = "https://rahulshettyacademy.com/seleniumPractise/#/offers";
    const month = "4";
    const day = "15";
    const year = "2027";
    const expectedList = [month, day, year];

    await test.step("STEP 1: Navigating to the page with calendar", async () => {
        await page.goto(url);
        await page.waitForLoadState("networkidle");
    });

    await test.step("STEP 2: Selecting date", async () => {
        await page.locator(".react-date-picker__inputGroup").click();
        await page.locator(".react-calendar__navigation__label").waitFor();
        await page.locator(".react-calendar__navigation__label").click();
        await page.locator(".react-calendar__navigation__label").click();
        await page.locator(".react-calendar__decade-view__years").getByRole("button", { name: year }).click();
        await page.locator(".react-calendar__year-view__months").getByRole("button").nth(Number(month) - 1).click();
        // await page.locator(".react-calendar__month-view__days").getByRole("button", { name: day }).click();  // or
        await page.locator("//abbr[text()='" + day + "']").click();  // by using xpath
    });

    await test.step("STEP 3: Validating the date", async () => {
        // method 1
        expect(await page.locator(".react-date-picker__inputGroup").locator("input[name='day']").getAttribute("value")).toBe(day);
        expect(await page.locator(".react-date-picker__inputGroup").locator("input[name='month']").getAttribute("value")).toBe(month);
        expect(await page.locator(".react-date-picker__inputGroup").locator("input[name='year']").getAttribute("value")).toBe(year);

        // method 2
        const inputs = page.locator(".react-date-picker__inputGroup input");
        for (let i = 0; i < await inputs.length; i++) {
            const value = inputs[i].getAttribute("value");
            await expect(value).toEqual(expectedList[i]);
        }
    });
});


test("SCENARIO: Calendar with child page", async ({ browser }) => {

    // 1 - Navigate to the desired page
    // - primary page
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://rahulshettyacademy.com/seleniumPractise/#/");

    // - secondary page
    const newPageLink = page.locator("[href='#/offers']")
    const [newPage] = await Promise.all(
        [
            context.waitForEvent("page"),  // listen for any new pages to open
            newPageLink.click(),  // opens link to a new page in separate window
        ]
    );

    // - assertion
    await newPage.locator(".react-date-picker").waitFor();
    await expect(newPage.getByText("Delivery Date")).toBeVisible();

    // 2- Selecting the date
    const year = "2027";
    const monthName = "November";
    const monthNumber = 11;
    const day = "15";
    const expectedResult = "2027-11-15"

    await newPage.locator(".react-date-picker").click();
    await newPage.locator(".react-calendar__navigation__label").waitFor();

    await newPage.locator(".react-calendar__navigation__label__labelText").click();
    await newPage.locator(".react-calendar__navigation__label__labelText").click();

    // - year
    await newPage.locator(".react-calendar__decade-view__years button").getByText(year).click();  // or
    // await newPage.locator(".react-calendar__decade-view__years").getByRole("button", { name: year }).click();

    // - month
    await newPage.locator(".react-calendar__year-view__months__month").nth(monthNumber - 1).click();  // or
    // await newPage.locator(".react-calendar__year-view__months button").getByText(monthName).click();

    // - day
    // await newPage.locator(".react-calendar__month-view__days").getByRole("button", { name: day }).click()  // or
    // await newPage.locator(".react-calendar__month-view__days button").getByText(day).click();  // or
    await newPage.locator(`//abbr[text()="${day}"]`).click();

    // 3 - Assertions
    await expect(newPage.locator(".react-date-picker__inputGroup input").first()).toHaveValue(expectedResult);
    await expect(newPage.locator(".react-date-picker__inputGroup").locator("input[name='year']")).toHaveValue(year);
    await expect(newPage.locator(".react-date-picker__inputGroup").locator("input[name='month']")).toHaveValue(String(monthNumber));
    await expect(newPage.locator(".react-date-picker__inputGroup").locator("input[name='day']")).toHaveValue(day);
});
