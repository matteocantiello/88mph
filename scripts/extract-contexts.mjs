import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "data", "charts");
const lines = [];

for (const country of fs.readdirSync(dir).sort()) {
  const cdir = path.join(dir, country);
  if (!fs.statSync(cdir).isDirectory()) continue;
  for (const file of fs.readdirSync(cdir).filter(f => f.endsWith(".json")).sort()) {
    const chart = JSON.parse(fs.readFileSync(path.join(cdir, file), "utf-8"));
    lines.push(`${country} | ${chart.year} | ${chart.context || ""}`);
  }
}

fs.writeFileSync(
  path.join(__dirname, "..", "data", "chart-contexts.txt"),
  lines.join("\n") + "\n"
);
console.log(`Wrote ${lines.length} entries to data/chart-contexts.txt`);
