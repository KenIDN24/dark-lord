import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MONOLOGUE =
  "The moat's done. Filled it Tuesday. The drawbridge—you know what, we'll do ropes, ropes are fine. I've had this skull throne since the Second Age and it still squeaks on the left arm, but the carpenter I trust is dead, so. The prophecy says a chosen one will rise against me, which, good, let him rise, he can have the east wing, the damp gets in. Bring the villagers Thursday. Not Thursday. Wednesday, but early, before the sun's properly up, I'm not doing the full laugh in daylight anymore.";

const outDir = process.env.OUTPUT_DIR ?? "/output";
const entry = MONOLOGUE;

// Runtime guard: sealed scorer gate is 1-600 characters, single entry text.
if (entry.length < 1 || entry.length > 600) {
  throw new Error(`entry length ${entry.length} outside sealed gate 1-600`);
}
if (entry.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
// UTF-8 byte length sanity: must stay within the same 600-byte spirit.
if (Buffer.byteLength(entry, "utf8") > 600) {
  throw new Error(`entry is ${Buffer.byteLength(entry, "utf8")} UTF-8 bytes, over 600`);
}

// Judge-brief guards: tiredness must live in voice/rhythm/deflection,
// never in an explicit "I am tired" statement; the monologue must open
// on the moat setup and close on the daylight-laugh punchline.
if (!entry.startsWith("The moat's done.")) {
  throw new Error("monologue must open with the moat setup");
}
if (!entry.endsWith("I'm not doing the full laugh in daylight anymore.")) {
  throw new Error("monologue must close with the daylight-laugh punch");
}
if (/i am (so |very |really )?tired|i'm (so |very |really )?tired|i feel tired|i am exhausted/i.test(entry)) {
  throw new Error("brief forbids stating tiredness outright");
}
// Villain spine must still be present: scheme + history + threat.
for (const beat of ["skull throne", "prophecy", "chosen one"]) {
  if (!entry.includes(beat)) {
    throw new Error(`monologue is missing villain beat: ${beat}`);
  }
}

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, entry, "utf8");

// Round-trip check: the written file must be byte-identical to the monologue.
const roundTrip = readFileSync(outPath, "utf8");
if (roundTrip !== entry) {
  throw new Error("round-trip mismatch: entry.txt differs from the monologue");
}

const words = entry.split(/\s+/).filter(Boolean).length;
console.log(`entry ok: ${entry.length} chars, ${words} words, 1 file`);
