const {test} = require("@playwright/test");

test("delete", async({page}) => {
    await page.goto("https://github.com/Empactr/VK_QA_internship/issues?q=is%3Aissue+is%3Aclosed");
})