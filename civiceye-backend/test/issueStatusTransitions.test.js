const test = require("node:test");
const assert = require("node:assert/strict");

const fs = require("fs");
const path = require("path");

const controllerPath = path.join(
  __dirname,
  "..",
  "controllers",
  "issueController.js"
);

const source = fs.readFileSync(controllerPath, "utf8");

function getTransitions() {
  const match = source.match(
    /const ALLOWED_STATUS_TRANSITIONS = \{([\s\S]*?)\n\};/
  );

  assert.ok(match, "ALLOWED_STATUS_TRANSITIONS must exist in issueController.js");

  const objectText = `{${match[1]}}`;

  return Function(`"use strict"; return (${objectText});`)();
}

test("Submitted can transition to In Progress", () => {
  const transitions = getTransitions();
  assert.equal(transitions.Submitted.includes("In Progress"), true);
});

test("Submitted can transition to Rejected", () => {
  const transitions = getTransitions();
  assert.equal(transitions.Submitted.includes("Rejected"), true);
});

test("In Progress can transition to Resolved", () => {
  const transitions = getTransitions();
  assert.equal(transitions["In Progress"].includes("Resolved"), true);
});

test("In Progress can transition to Rejected", () => {
  const transitions = getTransitions();
  assert.equal(transitions["In Progress"].includes("Rejected"), true);
});

test("Submitted cannot transition directly to Resolved", () => {
  const transitions = getTransitions();
  assert.equal(transitions.Submitted.includes("Resolved"), false);
});

test("Resolved cannot transition to In Progress", () => {
  const transitions = getTransitions();
  assert.equal(transitions.Resolved.includes("In Progress"), false);
});

test("Rejected cannot transition to Submitted", () => {
  const transitions = getTransitions();
  assert.equal(transitions.Rejected.includes("Submitted"), false);
});

test("Resolved cannot transition to Rejected", () => {
  const transitions = getTransitions();
  assert.equal(transitions.Resolved.includes("Rejected"), false);
});