import { NextResponse } from "next/server";
import { appendToWebsiteLog } from "../../../lib/serverPaths";

export async function POST(request: Request) {

  const body = await request.json();

  const query = body.query;

  // -----------------------------
  // Log SQL Query
  // -----------------------------
  const logEntry =
    `[${new Date().toISOString()}] SQL_QUERY query=${query}\n`;

  appendToWebsiteLog(logEntry);

  // -----------------------------
  // Log Request (for DDoS detection)
  // -----------------------------
  const requestLog =
    `[${new Date().toISOString()}] REQUEST ip=127.0.0.1\n`;

  appendToWebsiteLog(requestLog);

  // -----------------------------
  // Trigger EdgeSOC Detection
  // -----------------------------
  try {

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    await fetch(
      `${apiUrl}/detect`,
      {
        method: "POST",
      }
    );

  } catch (err) {

    console.error(
      "Failed to trigger EdgeSOC detector:",
      err
    );

  }

  return NextResponse.json({
    success: true,
  });

}