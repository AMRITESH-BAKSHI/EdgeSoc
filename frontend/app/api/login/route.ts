import { NextResponse } from "next/server";
import { appendToWebsiteLog } from "../../../lib/serverPaths";
import { API_BASE_URL } from "../../../lib/config";

export async function POST(request: Request) {

  const body = await request.json();

  const { username } = body;

  const logEntry =
    `[${new Date().toISOString()}] LOGIN_FAILED ip=127.0.0.1 username=${username}\n`;

  appendToWebsiteLog(logEntry);

  // Run detector automatically
  try {

    await fetch(
      `${API_BASE_URL}/detect`,
      {
        method: "POST"
      }
    );

  } catch (err) {

    console.error(err);

  }

  return NextResponse.json({
    success: true
  });

}
