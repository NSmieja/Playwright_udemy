const { test, expect } = require('@playwright/test');

// Section 8 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/39602630#overview

// +see: 02 (file), section 5 (udemy)
test("Playwright special locators", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/angularpractice/");

    // checkbox
    // - classic locator
    await page.locator(".form-check-input").first().check();  // or
    await page.locator("#exampleCheck1").uncheck();  // or
    // - getByLabel locator
    await page.getByLabel("Check me out if you Love IceCreams!").check();  // Playwright will look for a place to clisk within this line, not only within label

    // radio button
    // - classic locator
    await page.locator(".form-check-input").nth(2).check();  // or
    await page.locator("#inlineRadio1").check();  // or
    // - getByLabel locator
    await page.getByLabel("Employed").check();

    // dropdown list
    // - classic locator
    await page.getByLabel("Gender").selectOption("Female");  // or
    // - getByLabel locator
    await page.getByLabel("Gender").selectOption("Male");

    // form field (typing)
    // - classic locator
    await page.locator("#exampleInputPassword1").fill("sth123");  // or
    // - getByLabel locator
    // await page.getByLabel("Password").fill("another_password");  // NOTE! NOT recomended for typing field (not always work, only if input tag is inside label tag)
    // - getByPlaceholder locator
    await page.getByPlaceholder("Password").fill("abc");

    // date field
    await page.locator("[name='bday']").pressSequentially("22112020");

    // submitting the form
    // - classic locator
    // await page.locator("[type='submit']").click();  // or
    // - getByRole locator
    await page.getByRole("button", { name: "Submit" }).click();
    // assertions
    await expect(page.getByText("The Form has been submitted successfully!")).toBeVisible();

    // closing the alert message
    // await page.locator(".close").click();  // or
    await page.locator(".alert-success a").click();
    // assertions
    await expect(page.locator(".alert-success")).not.toBeVisible();

    // redirecting th the Shop page
    // - classic locator
    // await page.locator(".nav-link").nth(1).click(); // or
    // - getByRole locator
    await page.getByRole("link", { name: "Shop" }).click();
    // assertions
    expect(page.url()).toBe("https://rahulshettyacademy.com/angularpractice/shop");

    // we want to add Nokia Edge to the cart
    // instead of for loop we will use combination of locators and filters
    await expect(page.locator(".nav-link").last()).toContainText("0");
    await page.locator("app-card").filter({ hasText: "Nokia Edge" }).getByRole("button").click();
    await expect(page.locator(".nav-link").last()).toContainText("1");

});

