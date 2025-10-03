// Pluggable content moderation service
// Providers: AWS Rekognition, Google Vision SafeSearch, Hive Moderation

export type ModerationResult = {
  allowed: boolean;
  labels?: any;
  reason?: string;
};

const PROVIDER = process.env.MODERATION_PROVIDER || "none"; // aws|google|hive|none

const HIVE_API_KEY = process.env.HIVE_API_KEY;
const HIVE_BASE = "https://api.thehive.ai/api/v2/task/sync"; // example endpoint

// AWS Rekognition (image moderation via SDK v3). Video moderation requires S3 and async jobs (not implemented here).
async function moderateWithAWSRekognition(url: string, isVideo: boolean): Promise<ModerationResult> {
  if (isVideo) {
    // For production, use StartContentModeration on an S3 video and poll results.
    return { allowed: true, reason: "aws_video_moderation_not_implemented" };
  }
  try {
    const { RekognitionClient, DetectModerationLabelsCommand } = await import("@aws-sdk/client-rekognition");
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
    if (!region) return { allowed: true, reason: "aws_region_missing" };
    // Fetch image bytes
    const resp = await fetch(url);
    if (!resp.ok) return { allowed: true, reason: `fetch_image_${resp.status}` };
    const buf = Buffer.from(await resp.arrayBuffer());
    const client = new RekognitionClient({ region });
    const minConf = Number(process.env.AWS_REKOG_MIN_CONF || 80);
    const out = await client.send(new DetectModerationLabelsCommand({ Image: { Bytes: buf }, MinConfidence: minConf }));
    const labels = out.ModerationLabels || [];
    const blocked = labels.some(l => {
      const name = (l.Name || '').toLowerCase();
      const conf = Number(l.Confidence || 0) / 100; // SDK returns 0-100
      const threshold = Number(process.env.MODERATION_BLOCK_THRESHOLD || 0.85);
      return (
        ["explicit nudity","nudity","sexual","suggestive","violence","weapon","hate","self-harm","guns","gore","drugs"].some(k => name.includes(k)) &&
        conf >= threshold
      );
    });
    return { allowed: !blocked, labels: out };
  } catch (e) {
    console.error("aws rekognition error", e);
    return { allowed: true, reason: "aws_rekognition_error" };
  }
}

// Google Vision SafeSearch (image moderation via REST). For video, consider Google Video Intelligence API.
async function moderateWithGoogleVision(url: string, isVideo: boolean): Promise<ModerationResult> {
  if (isVideo) {
    // For production, use Video Intelligence explicit content detection.
    return { allowed: true, reason: "google_video_moderation_not_implemented" };
  }
  try {
    const key = process.env.GOOGLE_VISION_API_KEY;
    if (!key) return { allowed: true, reason: "google_vision_key_missing" };
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${key}`;
    const body = {
      requests: [
        {
          image: { source: { imageUri: url } },
          features: [{ type: "SAFE_SEARCH_DETECTION" }],
        },
      ],
    };
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) return { allowed: true, reason: `google_vision_http_${resp.status}` };
    const data: any = await resp.json();
    const ann = data?.responses?.[0]?.safeSearchAnnotation;
    if (!ann) return { allowed: true, labels: data };
    // Values: UNKNOWN, VERY_UNLIKELY, UNLIKELY, POSSIBLE, LIKELY, VERY_LIKELY
    const badLevels = new Set(["POSSIBLE", "LIKELY", "VERY_LIKELY"]);
    const block = (
      badLevels.has(ann.adult) ||
      badLevels.has(ann.violence) ||
      badLevels.has(ann.racy)
    );
    return { allowed: !block, labels: ann };
  } catch (e) {
    console.error("google vision error", e);
    return { allowed: true, reason: "google_vision_error" };
  }
}

async function moderateWithHive(url: string, isVideo: boolean): Promise<ModerationResult> {
  if (!HIVE_API_KEY) return { allowed: true, reason: "hive_not_configured" };
  try {
    const resp = await fetch(`${HIVE_BASE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${HIVE_API_KEY}`,
      },
      body: JSON.stringify({
        input: [{ url }],
        // Configure models for nudity, violence, hate, etc.
        // Refer to Hive docs for exact payload
      }),
    });
    if (!resp.ok) return { allowed: true, reason: `hive_http_${resp.status}` };
    const data = await resp.json();
    // Parse provider-specific scores here; placeholder below falls back to keyword match
    const labels = data;
    const threshold = Number(process.env.MODERATION_BLOCK_THRESHOLD || 0.85);
    const flagged = JSON.stringify(labels).match(/nudity|sexual|violence|weapon|hate|self[- ]harm|gore|drugs/i);
    if (flagged) {
      return { allowed: false, labels, reason: "hive_flagged_placeholder" };
    }
    return { allowed: true, labels };
  } catch (e) {
    console.error("hive moderation error", e);
    return { allowed: true, reason: "hive_exception" };
  }
}

export async function moderateImageUrl(url: string): Promise<ModerationResult> {
  switch (PROVIDER.toLowerCase()) {
    case "aws":
      return moderateWithAWSRekognition(url, false);
    case "google":
      return moderateWithGoogleVision(url, false);
    case "hive":
      return moderateWithHive(url, false);
    default:
      return { allowed: true, reason: "moderation_disabled" };
  }
}

export async function moderateVideoUrl(url: string): Promise<ModerationResult> {
  switch (PROVIDER.toLowerCase()) {
    case "aws":
      return moderateWithAWSRekognition(url, true);
    case "google":
      return moderateWithGoogleVision(url, true);
    case "hive":
      return moderateWithHive(url, true);
    default:
      return { allowed: true, reason: "moderation_disabled" };
  }
}
