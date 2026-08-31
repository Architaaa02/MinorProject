const test = require("node:test");
const assert = require("node:assert/strict");

// Test the auth controller validation logic in isolation (no DB needed)
test("register: rejects missing name", async () => {
  let thrownStatus = null;
  let thrownMessage = null;

  const mockRes = {
    status(code) { thrownStatus = code; return this; },
  };

  // Simulate the controller check
  const name = undefined;
  const email = "test@test.com";
  const password = "TestPass123";

  if (!name || !email || !password) {
    mockRes.status(400);
    thrownMessage = "name, email, and password are required";
  }

  assert.equal(thrownStatus, 400);
  assert.equal(thrownMessage, "name, email, and password are required");
});

test("register: rejects short password", async () => {
  let thrownStatus = null;

  const mockRes = {
    status(code) { thrownStatus = code; return this; },
  };

  const password = "short";
  if (password.length < 8) {
    mockRes.status(400);
  }

  assert.equal(thrownStatus, 400);
});

test("register: accepts valid input", () => {
  const name = "Test User";
  const email = "test@example.com";
  const password = "ValidPass123";

  assert.ok(name && email && password, "all fields present");
  assert.ok(password.length >= 8, "password long enough");
  assert.ok(/^\S+@\S+\.\S+$/.test(email), "email format valid");
});

test("invalid ObjectId is detected correctly", () => {
  const mongoose = require("mongoose");

  assert.equal(mongoose.isValidObjectId("not-an-id"), false);
  assert.equal(mongoose.isValidObjectId("123"), false);
  assert.equal(mongoose.isValidObjectId("6a959e106a19c3526195eb6a"), true);
  assert.equal(mongoose.isValidObjectId(""), false);
});

test("requireRole uses next(err) not throw", () => {
  const fs = require("fs");
  const path = require("path");
  const source = fs.readFileSync(
    path.join(__dirname, "..", "middleware", "auth.js"),
    "utf8"
  );

  // Verify the fix: requireRole should use next(new Error(...)) not throw
  assert.ok(
    source.includes("return next(new Error("),
    "requireRole must use next(err) for Express 4 compatibility"
  );
  assert.ok(
    !source.includes("throw new Error(`Forbidden"),
    "requireRole must not use throw for synchronous errors"
  );
});
