import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import process from "process";
import ts from "typescript";

// Fetch tsWorker for our TypeScript version from the CDN. This is required for the playground
const SCRIPT_URL = `https://typescript.azureedge.net/cdn/${ts.version}/monaco/min/vs/language/typescript/tsWorker.js`;
const TARGET_FILE = path.join("static", "cdn.tsWorker.js");

async function fetchPlaygroundTsWorker() {
    const response = await fetch(SCRIPT_URL);

    if (response.ok)
    {
        const writeStream = fs.createWriteStream(TARGET_FILE);
        await new Promise((resolve, reject) => {
            response.body.pipe(writeStream);
            response.body.on("error", reject);
            writeStream.on("finish", resolve);
        });
    }
    else
    {
        throw new Error(`Failed to fetch TS worker from ${SCRIPT_URL} (${response.status}):\n ${await response.text()}`);
    }
}

console.log(`Fetching latest tsWorker for TS ${ts.version}`);

fetchPlaygroundTsWorker()
    .then(() => console.log(`Done! Wrote ${TARGET_FILE}`))
    .catch(err => {
        console.error(`${err}`);
        process.exitCode = 1;
    })