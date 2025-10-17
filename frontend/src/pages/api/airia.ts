import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env";

type SuccessResponse = {
  success: true;
  data: unknown;
};

type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

const AIRIA_BASE_URL = "https://api.airia.ai/v2/PipelineExecution";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { userId, userInput, asyncOutput = false } = req.body ?? {};

  if (typeof userId !== "string" || userId.length === 0) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  if (typeof userInput !== "string" || userInput.length === 0) {
    return res.status(400).json({ success: false, error: "Missing userInput" });
  }

  try {
    const response = await fetch(`${AIRIA_BASE_URL}/${env.AIRIA_PIPELINE_ID}`, {
      method: "POST",
      headers: {
        "X-API-KEY": env.AIRIA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        userInput,
        asyncOutput,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "Airia request failed",
        details: payload ?? undefined,
      });
    }

    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Unexpected error when contacting Airia",
      details: error instanceof Error ? error.message : error,
    });
  }
}
