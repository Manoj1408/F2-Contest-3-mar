var request = require("request");
var puppeteer = require("puppeteer");
var fs = require("fs");

async function extractData() {
  var browser = await puppeteer.launch({ headless: false });

  var page = await browser.newPage();

  await page.goto("https://www.github.com/trending");

  await page.waitForSelector(".Box-row");

  var popular_repos = await page.evaluate(function () {
    var reposElements = Array.from(document.querySelectorAll(".Box-row"));

    return reposElements.map((repo) => {
      const title = repo.querySelector("h1 > a").innerText;
      const description = repo.querySelector("p").innerText;
      const stars = repo.querySelector(".f6 > .Link--muted").innerText.trim();
      const forks = repo
        .querySelector(".Link--muted:nth-child(2)")
        .innerText.trim();
      const language = repo.querySelector(".color-fg-muted > span").innerText;
      const url = repo.querySelector("h1 > a").href;
      return {
        title,
        description,
        url,
        stars,
        forks,
      };
    });
  });

  fs.writeFileSync("results.json", JSON.stringify(popular_repos, null, 2));
  // console.log(popular_repos);

  await page.evaluate(function () {
    document.querySelector("a[href='/trending/developers']").click();
  });

  await page.waitForSelector(".select-menu-list");
  await page.select(".select-menu-list", "javascript");
  await page.waitForSelector(".Box-row");
  const trending_developers = await page.evaluate(function () {
    const developersElements = Array.from(
      document.querySelectorAll(".Box-row")
    );
    return developersElements.map((dev) => {
      const name = dev.querySelector(".h3 > a").innerText.trim();
      const username = dev.querySelector("p > a").innerText;
      const popular_repo_name = dev.querySelector("h1 > a").innerText;
      const popular_repo_description = dev.querySelector("p.f4").innerText;
      const popular_repo_url = dev.querySelector("h1 > a").href;
      return {
        name,
        username,
        popular_repo_name,
        popular_repo_description,
        popular_repo_url,
      };
    });
  });
  fs.writeFileSync(
    "trending_developers.json",
    JSON.stringify(trending_developers, null, 2)
  );
  console.log(`Extracted ${trending_developers.length} trending developers`);

  await browser.close();
}

extractData();
