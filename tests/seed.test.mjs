import test from "node:test";
import assert from "node:assert/strict";

import { Rng, hashString, mulberry32, normalizeSeed } from "../assets/js/seed.js";

test("hashString is stable and changes with input", () => {
  assert.equal(hashString("softwave"), hashString("softwave"));
  assert.notEqual(hashString("softwave"), hashString("softwave "));
  assert.equal(hashString(""), 4261097152);
});

test("normalizeSeed handles strings, numbers and empties", () => {
  assert.equal(normalizeSeed(""), 1);
  assert.equal(normalizeSeed("   "), 1);
  assert.equal(normalizeSeed(42), 42);
  assert.equal(normalizeSeed(0), 1);
  assert.equal(normalizeSeed("rain"), hashString("rain"));
});

test("mulberry32 repeats the same sequence for the same seed", () => {
  const a = mulberry32(1234);
  const b = mulberry32(1234);
  const c = mulberry32(1235);
  let differs = false;
  for (let i = 0; i < 32; i += 1) {
    const value = a();
    assert.equal(value, b());
    assert.ok(value >= 0 && value < 1);
    if (value !== c()) differs = true;
  }
  assert.ok(differs);
});

test("Rng is deterministic, forked and bounded", () => {
  const a = new Rng("rainy study");
  const b = new Rng("rainy study");
  assert.equal(a.int(0, 100), b.int(0, 100));
  assert.equal(a.pick(["a", "b", "c"]), b.pick(["a", "b", "c"]));

  const forkA = a.fork("melody");
  const forkB = b.fork("melody");
  for (let i = 0; i < 12; i += 1) {
    assert.equal(forkA.float(), forkB.float());
  }

  const rng = new Rng("bounds");
  for (let i = 0; i < 100; i += 1) {
    assert.ok(rng.float(2, 3) >= 2 && rng.float(2, 3) <= 3);
    const integer = rng.int(4, 7);
    assert.ok(integer >= 4 && integer <= 7);
  }
});

test("weighted picks only offered values", () => {
  const rng = new Rng("weights");
  const options = [
    { value: "x", weight: 1 },
    { value: "y", weight: 4 }
  ];
  for (let i = 0; i < 50; i += 1) {
    assert.ok(["x", "y"].includes(rng.weighted(options)));
  }
});
