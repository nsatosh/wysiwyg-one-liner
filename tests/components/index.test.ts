import fs from "fs";
import path from "path";

const FIRST_LINE = { x: 200, y: 10 };
const CENTER = { x: 200, y: 200 };

const SCREENSHOT_DIR = "tmp";

function screenshot(filename: string) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR);
  }

  return page.screenshot({
    path: path.join(SCREENSHOT_DIR, filename)
  });
}

beforeEach(async () => {
  await page.goto("http://localhost:8080/");
});

test("Start editing from scratch", async () => {
  await page.mouse.move(CENTER.x, CENTER.y);
  await page.waitFor(10);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitFor(10);

  await page.keyboard.type("abc");
  await expect(page).toMatch("abc");
});

test("Cursor position is correct even if whitespace is inputted", async () => {
  await page.mouse.move(FIRST_LINE.x, FIRST_LINE.y);
  await page.waitFor(10);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitFor(10);

  await page.keyboard.type("abc");
  await page.keyboard.press("Space");
  await page.keyboard.type("def");

  await screenshot(
    "Cursor-position-is-correct-even-if-whitespace-is-inputted.png"
  );
});
