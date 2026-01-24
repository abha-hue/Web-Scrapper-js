import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
const page = await browser.newPage();
await page.goto("https://www.naukri.com/it-jobs", {
  waitUntil: "networkidle2",
});

await page.waitForSelector(".srp-jobtuple-wrapper");

const jobs = await page.evaluate(() => {
  return Array.from(document.querySelectorAll(".srp-jobtuple-wrapper"))
    .map(job => {
      const titleEl = job.querySelector("a.title");
      const companyEl = job.querySelector(".comp-name");
      const expEl = job.querySelector(".expwdth");
      const locEl = job.querySelector(".locWdth, .locWdth2");
      const descEl = job.querySelector(".job-desc");
      const linkEl = job.querySelector("a.title");
      const postedEl = job.querySelector(".job-post-day");

      return {
        jobId: job.getAttribute("data-job-id"),
        title: titleEl?.innerText.trim() || null,
        company: companyEl?.innerText.trim() || null,
        experience: expEl?.innerText.trim() || null,
        location: locEl?.innerText.trim() || null,
        posted: postedEl?.innerText.trim() || null,
        link: linkEl?.href || null
      };
    });
});

console.log(jobs);
console.log("Total jobs scraped:", jobs.length);
