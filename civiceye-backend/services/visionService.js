/**
 * AI Detection Module (Section V.C / VII.B).
 *
 * Forwards a submitted image to the Google Cloud Vision API and returns a
 * ranked list of descriptive labels with confidence scores, per Algorithm 1
 * steps 4-5.
 *
 * Uses the official @google-cloud/vision client library, which authenticates
 * via GOOGLE_APPLICATION_CREDENTIALS (a service-account JSON key) or
 * Application Default Credentials in a GCP environment. See:
 * https://cloud.google.com/vision (reference [20] in the paper).
 */

let visionClient = null;

function getClient() {
  if (visionClient) return visionClient;

  // Lazy require so the server can still boot (e.g. for local dev without
  // credentials configured) and fail only when a classification is attempted.
  const vision = require('@google-cloud/vision');
  visionClient = new vision.ImageAnnotatorClient();
  return visionClient;
}

/**
 * @param {Buffer} imageBuffer - raw image bytes (from multer memory storage)
 * @returns {Promise<Array<{description: string, score: number}>>}
 */
async function detectLabels(imageBuffer) {
  if (!imageBuffer || !imageBuffer.length) {
    throw new Error('No image data provided for Vision analysis');
  }

  const client = getClient();

  const [result] = await client.labelDetection({
    image: { content: imageBuffer },
  });

  const annotations = result.labelAnnotations || [];

  return annotations.map((a) => ({
    description: a.description,
    score: a.score, // 0..1 confidence
  }));
}

module.exports = { detectLabels };
