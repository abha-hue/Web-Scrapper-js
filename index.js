import puppeteer from "puppeteer";
import fs from "fs";
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

const detailedJobs = [];

for (const job of jobs) {
    if (!job.link) continue;

    const jobPage = await browser.newPage();

    try {
        await jobPage.goto(job.link, {
            waitUntil: "domcontentloaded",
            timeout: 6000
        });
        await jobPage.waitForSelector(
            ".styles_job-desc-container__txpYf",
            { timeout: 15000}
        );

        const details = await jobPage.evaluate(() => {
            const skills = Array.from(
                document.querySelectorAll(
                    ".styles_key-skill__GIPn_ span"
                )
            ).map(s => s.innerText.trim());
            const description =
                document.querySelector(
                    ".styles_JDC__dang-inner-html__h0K4t"
                )?.innerText.trim() || null;
            const otherDetails = {};
            document
                .querySelectorAll(".styles_other-details__oEN4O .styles_details__Y424J")
                .forEach(row => {
                    const label = row.querySelector("label")?.innerText.replace(":", "").trim();
                    const value = row.querySelector("span")?.innerText.trim();
                    if (label && value) {
                        otherDetails[label] = value;
                    }
                });

            return {
                skills,
                description,
                otherDetails
            };
        });
        const obj = new Object(...job, ...details);
        detailedJobs.push(obj);
        console.log(`Scraped details for: ${job.title}`);

    } catch (err) {
        console.log(`Failed job page: ${job.title}`);
    } finally {
        await jobPage.close();
    }

    await new Promise(r => setTimeout(r, 3000));
}
console.log(detailedJobs);

await browser.close();


fs.writeFileSync("naukri_jobs.json", JSON.stringify(detailedJobs, null, 2));