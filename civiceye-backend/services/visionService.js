/**
 * AI Detection Module (Section V.C / VII.B).
 *
 * Forwards a submitted image to the Google Cloud Vision API and returns a
 * ranked list of descriptive labels with confidence scores.
 */

let visionClient = null;

const DEFAULT_VISION_TIMEOUT_MS = 10000;

class VisionTimeoutError extends Error {
  constructor(message = "Google Cloud Vision request timed out") {
    super(message);
    this.name = "VisionTimeoutError";
    this.code = "VISION_TIMEOUT";
  }
}

function getVisionTimeoutMs() {
  const configured = Number(process.env.VISION_TIMEOUT_MS);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  return DEFAULT_VISION_TIMEOUT_MS;
}

function getClient() {
  if (visionClient) return visionClient;

  // Lazy require so the server can still boot without Vision credentials.
  const vision = require("@google-cloud/vision");
  visionClient = new vision.ImageAnnotatorClient();
  return visionClient;
}

/**
 * @param {Buffer} imageBuffer - raw image bytes
 * @returns {Promise<Array<{description: string, score: number}>>}
 */
async function detectLabels(imageBuffer) {
  if (!imageBuffer || !imageBuffer.length) {
    throw new Error("No image data provided for Vision analysis");
  }

  const client = getClient();
  const timeoutMs = getVisionTimeoutMs();

  try {
    const [result] = await client.labelDetection(
      {
        image: { content: imageBuffer },
      },
      {
        timeout: timeoutMs,
      },
    );

    const annotations = result.labelAnnotations || [];

    return annotations.map((a) => ({
      description: a.description,
      score: a.score,
    }));
  } catch (err) {
    if (
      err &&
      (err.code === 4 ||
        err.code === "DEADLINE_EXCEEDED" ||
        err.code === "DEADLINE_EXCEEDED".toString())
    ) {
      throw new VisionTimeoutError();
    }

    throw err;
  }
}

function __setVisionClientForTests(client) {
  visionClient = client;
}

function __resetVisionClientForTests() {
  visionClient = null;
}

module.exports = {
  detectLabels,
  getVisionTimeoutMs,
  VisionTimeoutError,
  DEFAULT_VISION_TIMEOUT_MS,
  __setVisionClientForTests,
  __resetVisionClientForTests,
};
