const test = require("node:test");
const assert = require("node:assert/strict");

const visionService = require("../services/visionService");

function createStubClient(response) {
  return {
    labelDetection: async (...args) => {
      createStubClient.lastArgs = args;

      if (response instanceof Error) {
        throw response;
      }

      return response;
    },
  };
}

function setClient(client) {
  visionService.__setVisionClientForTests(client);
}

function resetEnvironment() {
  delete process.env.VISION_TIMEOUT_MS;
}

test.afterEach(() => {
  resetEnvironment();
  visionService.__resetVisionClientForTests();
});

test("successful Vision request returns mapped labels", async () => {
  setClient(
    createStubClient([
      {
        labelAnnotations: [
          { description: "pothole", score: 0.95 },
          { description: "road", score: 0.88 },
        ],
      },
    ]),
  );

  const labels = await visionService.detectLabels(Buffer.from("image"));

  assert.deepEqual(labels, [
    { description: "pothole", score: 0.95 },
    { description: "road", score: 0.88 },
  ]);
});

test("Vision request receives configured timeout", async () => {
  process.env.VISION_TIMEOUT_MS = "5000";

  const client = createStubClient([
    {
      labelAnnotations: [],
    },
  ]);

  setClient(client);

  await visionService.detectLabels(Buffer.from("image"));

  assert.equal(createStubClient.lastArgs[1].timeout, 5000);
});

test("missing VISION_TIMEOUT_MS uses 10000ms default", () => {
  delete process.env.VISION_TIMEOUT_MS;

  assert.equal(visionService.getVisionTimeoutMs(), 10000);
});

test("invalid VISION_TIMEOUT_MS uses 10000ms default", () => {
  process.env.VISION_TIMEOUT_MS = "not-a-number";

  assert.equal(visionService.getVisionTimeoutMs(), 10000);
});

test("zero VISION_TIMEOUT_MS uses 10000ms default", () => {
  process.env.VISION_TIMEOUT_MS = "0";

  assert.equal(visionService.getVisionTimeoutMs(), 10000);
});

test("negative VISION_TIMEOUT_MS uses 10000ms default", () => {
  process.env.VISION_TIMEOUT_MS = "-5000";

  assert.equal(visionService.getVisionTimeoutMs(), 10000);
});

test("Vision timeout error is distinguishable", async () => {
  const timeoutError = new Error("deadline exceeded");
  timeoutError.code = 4;

  setClient(createStubClient(timeoutError));

  await assert.rejects(
    () => visionService.detectLabels(Buffer.from("image")),
    (error) => {
      assert.equal(error.name, "VisionTimeoutError");
      assert.equal(error.code, "VISION_TIMEOUT");
      return true;
    },
  );
});

test("generic Vision failure is propagated", async () => {
  const error = new Error("Vision service unavailable");

  setClient(createStubClient(error));

  await assert.rejects(
    () => visionService.detectLabels(Buffer.from("image")),
    (received) => {
      assert.equal(received, error);
      return true;
    },
  );
});
