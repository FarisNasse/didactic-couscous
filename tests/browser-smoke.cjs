const assert = require("node:assert/strict"),
  http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
const { chromium } = require(
  process.env.FORM_PLAYWRIGHT_MODULE || "playwright",
);
(async () => {
  const root = path.resolve(__dirname, "../dist-web");
  const server = http.createServer((req, res) => {
    let f = path.join(root, decodeURIComponent((req.url || "/").split("?")[0]));
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory())
      f = path.join(root, "index.html");
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "application/javascript",
        ".ttf": "font/ttf",
        ".png": "image/png",
        ".json": "application/json",
      }[path.extname(f)] || "application/octet-stream",
    );
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 430, height: 932 },
    timezoneId: "America/Los_Angeles",
  });
  page.setDefaultTimeout(8000);
  const external = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:") &&
      !r.url().startsWith("data:") &&
      !r.url().startsWith("blob:")
    )
      external.push(r.url());
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const body = () => page.locator("body").innerText();
  const click = (label) =>
    page.getByRole("button", { name: label, exact: true }).click();
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page
      .getByRole("textbox", { name: "What should we call you? (optional)" })
      .fill("Tester");
    await click("Continue");
    await page
      .getByRole("textbox", { name: "Age (optional, adults 18+)" })
      .fill("25");
    await page
      .getByRole("textbox", { name: "Height (cm, optional)" })
      .fill("170");
    await page.getByRole("radio", { name: "male", exact: true }).click();
    await click("Continue");
    await click("Start my journal");
    await page
      .getByRole("button", { name: "Log a measurement", exact: true })
      .waitFor();
    console.log("PASS onboarding");
    await click("Log a measurement");
    await page.getByRole("textbox", { name: "Value (kg)" }).fill("66.4");
    await click("Save measurement");
    await page.getByText("66.4 kg", { exact: true }).waitFor();
    await page.reload();
    await page.getByText("66.4 kg", { exact: true }).waitFor();
    console.log("PASS measurement persistence");
    await page.getByText("Nutrition", { exact: true }).last().click();
    await click("Log food");
    await page
      .getByRole("textbox", { name: "Find food or barcode" })
      .fill("Bananas");
    await page.getByText("Bananas, raw", { exact: true }).click();
    await page.getByRole("textbox", { name: "Portion in grams" }).fill("150");
    await click("Add to breakfast");
    await page.getByText("150 g · 134 kcal", { exact: true }).waitFor();
    console.log("PASS food portion and diary");
    await page.getByText("Training", { exact: true }).last().click();
    await click("Create plan");
    await page
      .getByRole("textbox", { name: "Plan name" })
      .fill("Smoke routine");
    await page
      .getByRole("switch", { name: "Bodyweight squat", exact: true })
      .click();
    await click("Save workout plan");
    await click("Start this plan");
    await page
      .getByRole("button", { name: "Record set", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Undo recorded set", exact: true })
      .first()
      .waitFor();
    await page.reload();
    await page.getByText("Session", { exact: true }).first().click();
    await page
      .getByRole("button", { name: "Undo recorded set", exact: true })
      .first()
      .waitFor();
    await click("Finish workout");
    await page.getByText("1 completed sets", { exact: false }).waitFor();
    console.log("PASS workout resume and completion");
    await page.getByText("Physique", { exact: true }).last().click();
    await click("Add routine");
    await page
      .getByRole("textbox", { name: "Routine name" })
      .fill("Morning mobility");
    await click("Save routine");
    await click("Mark done");
    await page
      .getByRole("button", { name: "Done · undo", exact: true })
      .waitFor();
    console.log("PASS personal care routine");
    await page.getByText("Health", { exact: true }).last().click();
    await click("Save check-in");
    await page.getByText("Check-in saved", { exact: true }).waitFor();
    console.log("PASS recovery check-in");
    await click("Log sleep");
    await page.getByRole("textbox", { name: "Value (h)" }).fill("7.5");
    await click("Save measurement");
    console.log("PASS metric route with query parameters");
    await page.getByText("Insights", { exact: true }).last().click();
    await click("Save priority");
    await page
      .getByRole("button", { name: "Saved priority", exact: true })
      .waitFor();
    console.log("PASS evidence insight action");
    await page
      .getByRole("button", { name: "Open settings", exact: true })
      .click();
    assert.ok((await body()).includes("Browser development preview"));
    await page.getByRole("radio", { name: "dark", exact: true }).click();
    await page.screenshot({
      path: path.join(require("node:os").tmpdir(), "form-settings-dark.png"),
      fullPage: true,
    });
    console.log("PASS settings and dark mode");
    await page
      .getByRole("switch", { name: "Hide weight", exact: true })
      .click();
    await page.getByRole("button", { name: "Go back", exact: true }).click();
    await page.getByText("Physique", { exact: true }).last().click();
    assert.equal(
      await page.getByText("Body weight", { exact: true }).count(),
      0,
    );
    console.log("PASS weight visibility preference");
    await page
      .getByRole("button", { name: "Open settings", exact: true })
      .click();
    await click("Export full journal (JSON)");
    const downloadPromise = page.waitForEvent("download");
    await click("Confirm");
    const download = await downloadPromise;
    const exported = path.join(
      require("node:os").tmpdir(),
      "form-smoke-export.json",
    );
    await download.saveAs(exported);
    const saved = JSON.parse(fs.readFileSync(exported, "utf8"));
    assert.equal(saved.format, "FORM");
    assert.equal(saved.data.measurements.length, 2);
    assert.equal(saved.data.workoutPlans.length, 1);
    console.log("PASS full JSON export");
    const chooserPromise = page.waitForEvent("filechooser");
    await click("Import a FORM export");
    await (await chooserPromise).setFiles(exported);
    await click("Merge these records");
    await page
      .getByText(
        "Journal imported. Review your profile and connection settings.",
        { exact: true },
      )
      .waitFor();
    fs.unlinkSync(exported);
    console.log("PASS validated JSON import");
    await click("Erase my FORM journal");
    await click("Confirm");
    await page.getByText(/Welcome to FORM · 1 of 3/i).waitFor();
    console.log("PASS journal erasure and return to onboarding");
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log("PASS zero page errors and zero external requests");
  } catch (e) {
    console.log("PAGE", await body());
    await page.screenshot({
      path: path.join(require("node:os").tmpdir(), "form-smoke-failure.png"),
      fullPage: true,
    });
    throw e;
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
