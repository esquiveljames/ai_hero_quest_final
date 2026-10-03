/* =====================================================================
   tools/sync-worker-choices.js
   ---------------------------------------------------------------------
   After editing config/questions.js, run this ONCE so the server knows
   the new choice codes:

       node tools/sync-worker-choices.js

   It rewrites the CHOICES block in server/worker.js. Then paste the
   updated worker.js into Cloudflare again (README, Step 3).
   ===================================================================== */
const fs = require("fs");
const path = require("path");

global.window = {};                                         // questions.js expects a browser "window"
require(path.join(__dirname, "../config/questions.js"));
const QUESTIONS = window.HQ_QUESTIONS;

// Build one line per option:  q1_help: "scene text -> option label",
const lines = [];
for (const q of QUESTIONS) {
  for (const o of q.options) {
    const text = `${q.text} -> ${o.label}`.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    lines.push(`  ${o.id}: "${text}",`);
  }
}
const block = "const CHOICES = {\n" + lines.join("\n").replace(/,$/, "") + "\n};";

const workerPath = path.join(__dirname, "../server/worker.js");
const worker = fs.readFileSync(workerPath, "utf8");
const updated = worker.replace(/const CHOICES = \{[\s\S]*?\n\};/, block);
fs.writeFileSync(workerPath, updated);
console.log(`Synced ${lines.length} choices from ${QUESTIONS.length} questions into server/worker.js`);
